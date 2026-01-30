const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

// Check if logo exists
const logoPath = path.join(__dirname, '..', 'assets', 'ccfs-logo.png')
const hasLogo = fs.existsSync(logoPath)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const generateLoadQualityExceptionPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const pageWidth = doc.page.width - 100 // Account for margins

      // Header
      doc.fontSize(10)
        .text(formatDate(data.date), { align: 'right' })

      doc.moveDown(0.5)

      // Title
      doc.fontSize(24)
        .fillColor('#1e3a5f')
        .text('Load Quality Exception Report', { align: 'center' })

      doc.moveDown(1)

      // Helper function for label-value pairs
      const addField = (label, value, options = {}) => {
        const y = doc.y
        doc.fontSize(11)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text(label, 50, y, { continued: false })

        const labelWidth = 200
        doc.fontSize(11)
          .fillColor('#333333')
          .font('Helvetica')

        if (options.box) {
          // Draw a box around the value
          const boxX = 250
          const boxWidth = 100
          const boxHeight = 20
          doc.rect(boxX, y - 2, boxWidth, boxHeight)
            .stroke('#cccccc')
          doc.text(value || 'N/A', boxX + 5, y + 2)
        } else {
          doc.text(value || 'N/A', 250, y)
        }
        doc.moveDown(0.8)
      }

      // Report Information Section
      doc.moveDown(0.5)
      addField('Reporting Service Center', data.reportingServiceCenter, { box: true })
      addField('Date', formatDate(data.date))
      addField('Employee Reporting Name', data.employeeReportingName)

      doc.moveDown(0.5)

      // Load Information Section
      addField('Type of load?', data.loadType, { box: true })
      addField('Loaded at which Service Center?', data.loadedAtServiceCenter, { box: true })
      addField('Trailer #', data.trailerNumber)

      doc.moveDown(1)

      // Photos section header
      doc.fontSize(12)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Load Photo - Take when door opened')
      doc.moveDown(0.5)

      // Add door opened photo if exists
      if (data.doorOpenedPhoto) {
        try {
          // Convert base64 to buffer
          const base64Data = data.doorOpenedPhoto.replace(/^data:image\/\w+;base64,/, '')
          const imageBuffer = Buffer.from(base64Data, 'base64')
          doc.image(imageBuffer, {
            fit: [250, 200],
            align: 'center'
          })
        } catch (err) {
          doc.fontSize(10)
            .fillColor('#666666')
            .font('Helvetica-Oblique')
            .text('[Photo attached]')
        }
      }

      doc.moveDown(1)

      // Additional photos
      if (data.additionalPhotos && data.additionalPhotos.length > 0) {
        doc.fontSize(12)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Load Photo - Additional')
        doc.moveDown(0.5)

        for (const photo of data.additionalPhotos) {
          try {
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, '')
            const imageBuffer = Buffer.from(base64Data, 'base64')

            // Check if we need a new page
            if (doc.y > 500) {
              doc.addPage()
            }

            doc.image(imageBuffer, {
              fit: [250, 200],
              align: 'center'
            })
            doc.moveDown(0.5)
          } catch (err) {
            // Skip invalid images
          }
        }
      }

      // Check if we need a new page for exception details
      if (doc.y > 500) {
        doc.addPage()
      }

      doc.moveDown(1)

      // Exception Types
      doc.fontSize(12)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Exception')
      doc.moveDown(0.3)

      const exceptionTypes = Array.isArray(data.exceptionTypes)
        ? data.exceptionTypes
        : [data.exceptionTypes].filter(Boolean)

      // Draw exception types as tags
      let tagX = 50
      const tagY = doc.y
      doc.fontSize(10)

      for (const exception of exceptionTypes) {
        const textWidth = doc.widthOfString(exception)
        const tagWidth = textWidth + 16

        if (tagX + tagWidth > pageWidth + 50) {
          tagX = 50
          doc.y += 25
        }

        // Draw tag background
        doc.rect(tagX, doc.y, tagWidth, 20)
          .fill('#e8e8e8')

        // Draw tag text
        doc.fillColor('#333333')
          .text(exception, tagX + 8, doc.y + 5, { lineBreak: false })

        tagX += tagWidth + 8
      }

      doc.y += 30
      doc.moveDown(1)

      // Comments
      doc.fontSize(12)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Comments')
      doc.moveDown(0.3)
      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text(data.comments || 'None', { width: pageWidth })

      doc.moveDown(1)

      // Affected Pro Numbers
      doc.fontSize(12)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Affected Pro Number')
      doc.moveDown(0.3)

      const proNumbers = Array.isArray(data.affectedProNumbers)
        ? data.affectedProNumbers
        : [data.affectedProNumbers].filter(Boolean)

      for (const proNumber of proNumbers) {
        doc.fontSize(11)
          .fillColor('#333333')
          .font('Helvetica')
          .text(proNumber)
      }

      // New page for signatures
      doc.addPage()

      // Loader Acknowledgment Section
      doc.fontSize(14)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Loader Name, Employee Number and Signature')

      doc.moveDown(2)

      // Signature line
      doc.moveTo(50, doc.y)
        .lineTo(350, doc.y)
        .stroke('#1e3a5f')

      doc.moveDown(1.5)

      // Certification text
      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('Loader: I certify that this load quality issue has been discussed with me.')

      doc.moveDown(1)

      // Date line for loader
      doc.fontSize(11)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Date')

      doc.moveTo(50, doc.y + 5)
        .lineTo(350, doc.y + 5)
        .stroke('#1e3a5f')

      doc.moveDown(3)

      // Supervisor Signature Section
      doc.fontSize(14)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Supervisor Signature')

      doc.moveDown(2)

      // Supervisor signature line
      doc.moveTo(50, doc.y)
        .lineTo(350, doc.y)
        .stroke('#1e3a5f')

      doc.moveDown(1.5)

      // Date line for supervisor
      doc.fontSize(11)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Date')

      doc.moveTo(50, doc.y + 5)
        .lineTo(350, doc.y + 5)
        .stroke('#1e3a5f')

      // Footer with submission ID
      doc.fontSize(8)
        .fillColor('#999999')
        .text(
          `Submission ID: ${data.submissionId} | Generated: ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: pageWidth }
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// Observation form type titles and configurations
const OBSERVATION_FORM_CONFIGS = {
  'slips-trips-falls': {
    title: 'Slips, Trips & Falls Observation',
    color: '#eab308',
    observedField: 'employeeObserved',
    observedLabel: 'Employee Observed'
  },
  'driver-on-road': {
    title: 'Driver On-Road Observation',
    color: '#3b82f6',
    observedField: 'driverName',
    observedLabel: 'Driver Name'
  },
  'dock-safety': {
    title: 'Dock Safety Observation',
    color: '#14b8a6',
    observedField: 'employeeObserved',
    observedLabel: 'Employee Observed'
  },
  'stf-practical': {
    title: 'Slips, Trips & Falls Practical Evaluation',
    color: '#f97316',
    observedField: 'employeeName',
    observedLabel: 'Employee Name',
    isPractical: true
  },
  'lift-push-pull': {
    title: 'Lift, Push, Pull Observation',
    color: '#a855f7',
    observedField: 'employeeObserved',
    observedLabel: 'Employee Observed'
  },
  'driver-pre-route': {
    title: 'Delivery Driver Pre-route Observation',
    color: '#6366f1',
    observedField: 'driverName',
    observedLabel: 'Driver Name'
  },
  'driver-post-route': {
    title: 'Delivery Driver Post-route Observation',
    color: '#8b5cf6',
    observedField: 'driverName',
    observedLabel: 'Driver Name'
  },
  'driver-hazmat': {
    title: 'Driver Hazmat Observation',
    color: '#ef4444',
    observedField: 'driverName',
    observedLabel: 'Driver Name'
  },
  'forklift-operation': {
    title: 'Forklift Operation Observation',
    color: '#f59e0b',
    observedField: 'operatorName',
    observedLabel: 'Operator Name'
  },
  'load-quality-hazmat': {
    title: 'Load Quality / Hazmat Loading Observation',
    color: '#f43f5e',
    observedField: null,
    observedLabel: null
  },
  'five-seeing-habits': {
    title: 'Five Seeing Habits Interview',
    color: '#06b6d4',
    observedField: 'driverName',
    observedLabel: 'Driver Name',
    isInterview: true
  },
  'seven-keys-backing': {
    title: 'Seven Keys to Backing Interview',
    color: '#10b981',
    observedField: 'driverName',
    observedLabel: 'Driver Name',
    isInterview: true
  },
  'yard-observation': {
    title: 'Yard Observation',
    color: '#64748b',
    observedField: 'employeeObserved',
    observedLabel: 'Employee Observed'
  },
  'truck-trailer-coupling': {
    title: 'Truck & Trailer Coupling Observation',
    color: '#0ea5e9',
    observedField: 'driverName',
    observedLabel: 'Driver Name'
  }
}

const generateObservationPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const pageWidth = doc.page.width - 100
      const formConfig = OBSERVATION_FORM_CONFIGS[data.formSubtype] || {
        title: 'Observation Form',
        color: '#1e3a5f'
      }

      // Helper function for label-value pairs
      const addField = (label, value) => {
        doc.fontSize(11)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text(label + ': ', { continued: true })
          .fillColor('#333333')
          .font('Helvetica')
          .text(value || 'N/A')
        doc.moveDown(0.4)
      }

      // Header with date
      doc.fontSize(10)
        .fillColor('#666666')
        .text(formatDate(data.date), { align: 'right' })

      doc.moveDown(0.5)

      // Title
      doc.fontSize(20)
        .fillColor(formConfig.color)
        .font('Helvetica-Bold')
        .text(formConfig.title, { align: 'center' })

      doc.moveDown(0.3)

      // Submission ID
      doc.fontSize(10)
        .fillColor('#999999')
        .font('Helvetica')
        .text(`Submission ID: ${data.submissionId}`, { align: 'center' })

      doc.moveDown(1)

      // Basic Information Section
      doc.fontSize(14)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Basic Information')
      doc.moveDown(0.5)

      addField('Terminal', data.terminal)
      addField('Date', formatDate(data.date))
      if (data.time) addField('Time', data.time)

      // Observer/Evaluator/Interviewer name
      const observerName = data.observerName || data.evaluatorName || data.interviewerName
      const observerLabel = data.evaluatorName ? 'Evaluator' : (data.interviewerName ? 'Interviewer' : 'Observer')
      addField(observerLabel + ' Name', observerName)
      addField(observerLabel + ' Email', data.observerEmail)

      // Observed person (if applicable)
      if (formConfig.observedField && data[formConfig.observedField]) {
        addField(formConfig.observedLabel, data[formConfig.observedField])
      }

      // Additional fields based on form type
      if (data.location) addField('Location', data.location)
      if (data.truckNumber) addField('Truck Number', data.truckNumber)
      if (data.trailerNumber) addField('Trailer Number', data.trailerNumber)
      if (data.tractorNumber) addField('Tractor Number', data.tractorNumber)
      if (data.forkliftId) addField('Forklift ID', data.forkliftId)
      if (data.routeNumber) addField('Route Number', data.routeNumber)
      if (data.equipmentNumber) addField('Equipment', data.equipmentNumber)
      if (data.manifestNumber) addField('Manifest #', data.manifestNumber)
      if (data.loadedAtTerminal) addField('Loaded at Terminal', data.loadedAtTerminal)

      doc.moveDown(1)

      // Observation Items Section
      if (data.observation && typeof data.observation === 'object') {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Observation Items')
        doc.moveDown(0.5)

        Object.entries(data.observation).forEach(([key, value]) => {
          const isAtRisk = value === 'At Risk' || value === 'Unacceptable'
          const isSafe = value === 'Safe' || value === 'Acceptable'

          doc.fontSize(10)
            .fillColor('#333333')
            .font('Helvetica')
            .text(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ': ', { continued: true })

          doc.fillColor(isAtRisk ? '#ef4444' : (isSafe ? '#22c55e' : '#666666'))
            .font('Helvetica-Bold')
            .text(value)
        })
        doc.moveDown(1)
      }

      // Practical evaluation items (for STF Practical)
      if (data.practical && typeof data.practical === 'object') {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Practical Evaluation Items')
        doc.moveDown(0.5)

        Object.entries(data.practical).forEach(([key, item]) => {
          if (item && typeof item === 'object') {
            const isTrainingRequired = item.status === 'Training Required'

            doc.fontSize(10)
              .fillColor('#333333')
              .font('Helvetica')
              .text(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ': ', { continued: true })

            doc.fillColor(isTrainingRequired ? '#f59e0b' : '#22c55e')
              .font('Helvetica-Bold')
              .text(item.status || 'N/A')

            if (item.comment) {
              doc.fontSize(9)
                .fillColor('#666666')
                .font('Helvetica-Oblique')
                .text('  Comment: ' + item.comment)
            }
          }
        })
        doc.moveDown(1)
      }

      // Interview habits (for Five Seeing Habits)
      if (data.habits && typeof data.habits === 'object') {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Interview Results')
        doc.moveDown(0.5)

        Object.entries(data.habits).forEach(([key, value]) => {
          const doesNotUnderstand = value === 'Does not understand concept'

          doc.fontSize(10)
            .fillColor('#333333')
            .font('Helvetica')
            .text(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ': ', { continued: true })

          doc.fillColor(doesNotUnderstand ? '#ef4444' : '#22c55e')
            .font('Helvetica-Bold')
            .text(doesNotUnderstand ? 'Does Not Understand' : 'Understands')
        })
        doc.moveDown(1)
      }

      // Interview keys (for Seven Keys to Backing)
      if (data.keys && typeof data.keys === 'object') {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Interview Results')
        doc.moveDown(0.5)

        Object.entries(data.keys).forEach(([key, value]) => {
          const doesNotUnderstand = value === 'Does not understand concept'

          doc.fontSize(10)
            .fillColor('#333333')
            .font('Helvetica')
            .text(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ': ', { continued: true })

          doc.fillColor(doesNotUnderstand ? '#ef4444' : '#22c55e')
            .font('Helvetica-Bold')
            .text(doesNotUnderstand ? 'Does Not Understand' : 'Understands')
        })
        doc.moveDown(1)
      }

      // Tasks Requiring Training (for STF Practical)
      if (data.tasksRequiringTraining && data.tasksRequiringTraining.length > 0) {
        doc.fontSize(14)
          .fillColor('#f59e0b')
          .font('Helvetica-Bold')
          .text('Tasks Requiring Training')
        doc.moveDown(0.5)

        data.tasksRequiringTraining.forEach(task => {
          doc.fontSize(10)
            .fillColor('#333333')
            .font('Helvetica')
            .text('• ' + task)
        })
        doc.moveDown(1)
      }

      // Result Section
      if (data.result) {
        const isPositive = data.result === 'Safe' || data.result === 'Acceptable' || data.result === 'Pass'

        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Overall Result')
        doc.moveDown(0.5)

        // Draw result box
        const resultBoxWidth = 200
        const resultBoxHeight = 40
        const resultBoxX = (doc.page.width - resultBoxWidth) / 2
        const resultBoxY = doc.y

        doc.rect(resultBoxX, resultBoxY, resultBoxWidth, resultBoxHeight)
          .fill(isPositive ? '#dcfce7' : '#fee2e2')

        doc.rect(resultBoxX, resultBoxY, resultBoxWidth, resultBoxHeight)
          .stroke(isPositive ? '#22c55e' : '#ef4444')

        doc.fontSize(16)
          .fillColor(isPositive ? '#166534' : '#dc2626')
          .font('Helvetica-Bold')
          .text(data.result, resultBoxX, resultBoxY + 12, {
            width: resultBoxWidth,
            align: 'center'
          })

        doc.y = resultBoxY + resultBoxHeight + 20
      }

      // Comments Section
      if (data.comments || data.additionalNotes) {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Comments')
        doc.moveDown(0.3)
        doc.fontSize(11)
          .fillColor('#333333')
          .font('Helvetica')
          .text(data.comments || data.additionalNotes || 'None', { width: pageWidth })
        doc.moveDown(1)
      }

      // Footer
      doc.fontSize(8)
        .fillColor('#999999')
        .text(
          `Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} | CCFS LTL Logistics Safety Management System`,
          50,
          doc.page.height - 40,
          { align: 'center', width: pageWidth }
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  generateLoadQualityExceptionPDF,
  generateObservationPDF
}
