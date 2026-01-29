const { SESClient, SendEmailCommand, SendRawEmailCommand } = require('@aws-sdk/client-ses')
const { generateLoadQualityExceptionPDF } = require('./pdfService')

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
})

const SAFETY_EMAIL = process.env.SAFETY_EMAIL || 'safety@ccfs.com'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ccfs.com'
const SERVICE_CENTER_EMAIL_DOMAIN = process.env.SERVICE_CENTER_EMAIL_DOMAIN || 'ccfs.com'

// Generate service center email from code (e.g., ABQ -> ABQ@ccfs.com)
const getServiceCenterEmail = (serviceCenter) => {
  if (!serviceCenter) return null
  return `${serviceCenter.toUpperCase()}@${SERVICE_CENTER_EMAIL_DOMAIN}`
}

// Priority form types that need immediate notification
const PRIORITY_FORMS = [
  'safety-event',
  'hazard-report',
  'load-quality-exception',
  'cvsa-road-check-prep'
]

const formatFormType = (formType) => {
  return formType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Build MIME message with PDF attachment
const buildMimeMessage = (from, to, subject, textBody, pdfBuffer, pdfFilename) => {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const toAddresses = Array.isArray(to) ? to.join(', ') : to

  let message = [
    `From: ${from}`,
    `To: ${toAddresses}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: application/pdf',
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${pdfFilename}"`,
    '',
    pdfBuffer.toString('base64'),
    '',
    `--${boundary}--`
  ].join('\r\n')

  return message
}

const generateEmailBody = (formType, data) => {
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'full',
    timeStyle: 'short'
  })

  let body = `
Form Submission Details
------------------------
Submission ID: ${data.submissionId}
Form Type: ${formatFormType(formType)}
Terminal: ${data.terminal || data.reportingServiceCenter || 'N/A'}
Submitted: ${submittedAt}
Submitted By: ${data.submittedBy || data.operatorName || data.reporterName || data.inspectorName || data.driverName || data.employeeReportingName || 'N/A'}

`

  // Add form-specific details based on form type
  switch (formType) {
    case 'safety-event':
      body += `
Event Type: ${data.eventType || 'N/A'}
Date of Event: ${data.dateOfEvent || 'N/A'}
Time of Event: ${data.timeOfEvent || 'N/A'}
Location: ${data.locationWithinFacility || 'N/A'}
Description: ${data.eventDescription || 'N/A'}
${data.eventType === 'Injury' ? `
INJURY DETAILS:
- Injured Person: ${data.injuredPersonName || 'N/A'}
- Body Part: ${data.bodyPartAffected || 'N/A'}
- Nature of Injury: ${data.natureOfInjury || 'N/A'}
- First Aid Provided: ${data.firstAidProvided || 'N/A'}
- Medical Treatment Required: ${data.medicalTreatmentRequired || 'N/A'}
` : ''}
`
      break

    case 'hazard-report':
      body += `
Hazard Type: ${data.hazardType || 'N/A'}
Category: ${data.hazardCategory || 'N/A'}
Location: ${data.location || 'N/A'}
Potential Severity: ${data.potentialSeverity || 'N/A'}
Description: ${data.description || 'N/A'}
Suggested Action: ${data.suggestedCorrectiveAction || 'N/A'}
`
      break

    case 'load-quality-exception':
      body += `
LOAD QUALITY EXCEPTION REPORT
=============================

Please see the attached PDF for the complete report with photos.
The PDF includes a signature section for supervisor/loader acknowledgment.

SUMMARY:
- Reporting Service Center: ${data.reportingServiceCenter || 'N/A'}
- Loaded at Service Center: ${data.loadedAtServiceCenter || 'N/A'}
- Date: ${data.date || 'N/A'}
- Employee Reporting: ${data.employeeReportingName || 'N/A'}
- Type of Load: ${data.loadType || 'N/A'}
- Trailer #: ${data.trailerNumber || 'N/A'}
- Exception Types: ${Array.isArray(data.exceptionTypes) ? data.exceptionTypes.join(', ') : data.exceptionTypes || 'N/A'}
- Affected Pro Numbers: ${Array.isArray(data.affectedProNumbers) ? data.affectedProNumbers.join(', ') : data.affectedProNumbers || 'N/A'}
- Comments: ${data.comments || 'None'}

ACTION REQUIRED:
Supervisor should print the attached PDF and discuss the load quality issue with the loader.
Both parties must sign the acknowledgment section.
`
      break

    case 'forklift-inspection':
      body += `
Forklift ID: ${data.forkliftId || 'N/A'}
Operator: ${data.operatorName || 'N/A'}
Shift: ${data.shift || 'N/A'}
Hour Meter: ${data.hourMeter || 'N/A'}
Safe to Operate: ${data.safeToOperate || 'N/A'}
Defects Found: ${data.defectsFound || 'None reported'}
`
      break

    case 'cvsa-road-check-prep':
      const summary = data.summary || {}
      body += `
Truck #: ${data.truckNumber || 'N/A'}
Trailer #: ${data.trailerNumber || 'N/A'}
Inspection Results:
- Pass: ${summary.pass || 0}
- Fail: ${summary.fail || 0}
- N/A: ${summary.na || 0}
Status: ${summary.fail > 0 ? 'DEFECTS FOUND - ENTERED IN GEOTAB' : 'READY FOR ROAD CHECK'}
Notes: ${data.notes || 'None'}
`
      break

    default:
      body += `
Please log into the CCFS Forms system to view the complete submission details.
`
  }

  body += `
---
CCFS LTL Logistics Safety Management System
`

  return body
}

// Send load quality exception with PDF attachment to service centers
const sendLoadQualityExceptionEmail = async (data) => {
  try {
    const reportingEmail = getServiceCenterEmail(data.reportingServiceCenter)
    const loadingEmail = getServiceCenterEmail(data.loadedAtServiceCenter)

    // Collect unique recipients
    const recipients = new Set()
    if (reportingEmail) recipients.add(reportingEmail)
    if (loadingEmail) recipients.add(loadingEmail)
    recipients.add(SAFETY_EMAIL) // Always CC safety

    if (recipients.size === 0) {
      console.log('No recipients found for load quality exception email')
      return { success: false, error: 'No recipients' }
    }

    const formattedType = formatFormType('load-quality-exception')
    const subject = `[PRIORITY] [${formattedType}] - ${data.reportingServiceCenter} - Trailer #${data.trailerNumber} - ${data.submissionId}`
    const emailBody = generateEmailBody('load-quality-exception', data)

    // Generate PDF
    console.log('Generating PDF for load quality exception...')
    const pdfBuffer = await generateLoadQualityExceptionPDF(data)
    const pdfFilename = `Load_Quality_Exception_${data.submissionId}.pdf`
    console.log(`PDF generated: ${pdfFilename} (${pdfBuffer.length} bytes)`)

    // Skip if AWS credentials not configured
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.log('AWS credentials not configured - skipping email notification')
      console.log('Would have sent load quality exception email to:', Array.from(recipients))
      console.log('Subject:', subject)
      console.log('PDF attachment:', pdfFilename)
      return { success: true, skipped: true, recipients: Array.from(recipients), pdfSize: pdfBuffer.length }
    }

    // Build MIME message with PDF attachment
    const mimeMessage = buildMimeMessage(
      FROM_EMAIL,
      Array.from(recipients),
      subject,
      emailBody,
      pdfBuffer,
      pdfFilename
    )

    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(mimeMessage)
      }
    })

    await sesClient.send(command)
    console.log(`Load quality exception email with PDF sent to: ${Array.from(recipients).join(', ')}`)
    return { success: true, recipients: Array.from(recipients) }

  } catch (error) {
    console.error('Error sending load quality exception email:', error)
    return { success: false, error: error.message }
  }
}

const sendFormNotification = async (formType, data) => {
  try {
    // Special handling for load quality exception - send to service centers with PDF
    if (formType === 'load-quality-exception') {
      return await sendLoadQualityExceptionEmail(data)
    }

    // Skip email if AWS credentials are not configured
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.log('AWS credentials not configured - skipping email notification')
      console.log('Would have sent email for:', formType, data.submissionId)
      return { success: true, skipped: true }
    }

    const isPriority = PRIORITY_FORMS.includes(formType)
    const formattedType = formatFormType(formType)
    const terminal = data.terminal || data.reportingServiceCenter || 'N/A'

    // Determine subject line
    let subject = `[${formattedType}] - ${terminal} - ${data.submissionId}`
    if (isPriority) {
      subject = `[PRIORITY] ${subject}`
    }
    if (formType === 'safety-event' && data.eventType === 'Injury') {
      subject = `[URGENT - INJURY REPORT] ${subject}`
    }

    const emailBody = generateEmailBody(formType, data)

    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [SAFETY_EMAIL]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8'
          }
        }
      }
    })

    await sesClient.send(command)
    console.log(`Email sent successfully for ${formType}: ${data.submissionId}`)
    return { success: true }

  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendFormNotification,
  getServiceCenterEmail,
  SERVICE_CENTER_EMAIL_DOMAIN
}
