const cron = require('node-cron')
const db = require('../database/init')
const { generateReport } = require('./reportService')
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses')

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
})

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ccfs.com'
const EMAIL_OVERRIDE = process.env.EMAIL_OVERRIDE || null

// Store active cron jobs
const activeJobs = new Map()

// Apply email override for development/testing
const applyEmailOverride = (recipients) => {
  if (!EMAIL_OVERRIDE) return recipients
  console.log(`[EMAIL OVERRIDE] Redirecting from [${recipients.join(', ')}] to [${EMAIL_OVERRIDE}]`)
  return [EMAIL_OVERRIDE]
}

// Build MIME message with attachments
const buildMimeMessageWithAttachments = (from, to, subject, textBody, attachments) => {
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
    ''
  ]

  // Add attachments
  attachments.forEach(attachment => {
    const contentType = attachment.type === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    message.push(
      `--${boundary}`,
      `Content-Type: ${contentType}`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      attachment.buffer.toString('base64'),
      ''
    )
  })

  message.push(`--${boundary}--`)

  return message.join('\r\n')
}

// Send report email
const sendReportEmail = async (schedule, reportData) => {
  const recipients = JSON.parse(schedule.recipients)

  if (!recipients || recipients.length === 0) {
    console.log('No recipients configured for schedule:', schedule.name)
    return { success: false, error: 'No recipients' }
  }

  const subject = `[Scheduled Report] Forklift Inspection Report - ${schedule.name}`

  const emailBody = `
SCHEDULED FORKLIFT INSPECTION REPORT
=====================================

Report Name: ${schedule.name}
Report Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}
Terminal: ${schedule.terminal || 'All Terminals'}
Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}

SUMMARY
-------
Total Inspections: ${reportData.stats.totalInspections}
Inspections with Failures: ${reportData.stats.inspectionsWithFailures}
Total Failed Items: ${reportData.stats.totalFailures}
Pass Rate: ${reportData.stats.totalInspections > 0 ? Math.round((1 - reportData.stats.inspectionsWithFailures / reportData.stats.totalInspections) * 100) : 0}%

Safe to Operate:
- Yes: ${reportData.stats.safeToOperate.yes}
- No: ${reportData.stats.safeToOperate.no}

${reportData.reports.length > 0 ? 'See attached report(s) for full details.' : 'No inspection data found for this period.'}

---
This is an automated report from the CCFS LTL Logistics Safety Management System.
To modify this schedule, visit the Report Scheduler in the CCFS Forms application.
`

  // Skip if AWS credentials not configured
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.log('AWS credentials not configured - skipping scheduled report email')
    console.log('Would have sent report to:', recipients)
    console.log('Subject:', subject)
    console.log('Attachments:', reportData.reports.map(r => r.filename))
    return { success: true, skipped: true, recipients }
  }

  try {
    const finalRecipients = applyEmailOverride(recipients)

    const mimeMessage = buildMimeMessageWithAttachments(
      FROM_EMAIL,
      finalRecipients,
      subject,
      emailBody,
      reportData.reports
    )

    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(mimeMessage)
      }
    })

    await sesClient.send(command)
    console.log(`Scheduled report email sent to: ${finalRecipients.join(', ')}`)
    return { success: true, recipients: finalRecipients }

  } catch (error) {
    console.error('Error sending scheduled report email:', error)
    return { success: false, error: error.message }
  }
}

// Execute a scheduled report
const executeSchedule = async (scheduleId) => {
  console.log(`Executing schedule: ${scheduleId}`)

  try {
    const schedule = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(scheduleId)

    if (!schedule || !schedule.is_active) {
      console.log(`Schedule ${scheduleId} not found or inactive`)
      return
    }

    // Generate the report
    const reportData = await generateReport(schedule)

    // Send email
    const emailResult = await sendReportEmail(schedule, reportData)

    // Update last run status
    const status = emailResult.success ? 'success' : 'failed'
    db.prepare(`
      UPDATE report_schedules
      SET last_run_at = ?, last_run_status = ?
      WHERE id = ?
    `).run(new Date().toISOString(), status, scheduleId)

    console.log(`Schedule ${schedule.name} executed with status: ${status}`)

  } catch (error) {
    console.error(`Error executing schedule ${scheduleId}:`, error)

    // Update with error status
    db.prepare(`
      UPDATE report_schedules
      SET last_run_at = ?, last_run_status = ?
      WHERE id = ?
    `).run(new Date().toISOString(), 'failed', scheduleId)
  }
}

// Convert schedule to cron expression
const scheduleToCron = (schedule) => {
  const [hours, minutes] = schedule.time.split(':')

  switch (schedule.frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`
    case 'weekly':
      return `${minutes} ${hours} * * ${schedule.day_of_week || 1}`
    case 'monthly':
      return `${minutes} ${hours} ${schedule.day_of_month || 1} * *`
    default:
      return `${minutes} ${hours} * * *`
  }
}

// Register a schedule with cron
const registerSchedule = (schedule) => {
  // Remove existing job if any
  if (activeJobs.has(schedule.id)) {
    activeJobs.get(schedule.id).stop()
    activeJobs.delete(schedule.id)
  }

  if (!schedule.is_active) {
    console.log(`Schedule ${schedule.name} is inactive, not registering`)
    return
  }

  const cronExpression = scheduleToCron(schedule)

  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression for schedule ${schedule.name}: ${cronExpression}`)
    return
  }

  const job = cron.schedule(cronExpression, () => {
    executeSchedule(schedule.id)
  }, {
    timezone: 'America/Chicago'
  })

  activeJobs.set(schedule.id, job)
  console.log(`Registered schedule: ${schedule.name} (${cronExpression})`)
}

// Unregister a schedule
const unregisterSchedule = (scheduleId) => {
  if (activeJobs.has(scheduleId)) {
    activeJobs.get(scheduleId).stop()
    activeJobs.delete(scheduleId)
    console.log(`Unregistered schedule: ${scheduleId}`)
  }
}

// Initialize scheduler - load all active schedules
const initializeScheduler = () => {
  console.log('Initializing report scheduler...')

  try {
    const schedules = db.prepare('SELECT * FROM report_schedules WHERE is_active = 1').all()

    schedules.forEach(schedule => {
      registerSchedule(schedule)
    })

    console.log(`Scheduler initialized with ${schedules.length} active schedule(s)`)
  } catch (error) {
    console.error('Error initializing scheduler:', error)
  }
}

// Stop all scheduled jobs
const stopScheduler = () => {
  console.log('Stopping scheduler...')
  activeJobs.forEach((job, id) => {
    job.stop()
  })
  activeJobs.clear()
  console.log('Scheduler stopped')
}

module.exports = {
  initializeScheduler,
  stopScheduler,
  registerSchedule,
  unregisterSchedule,
  executeSchedule
}
