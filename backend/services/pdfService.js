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
          `Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} | CCFS Safety Management System`,
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

// Body area labels for injury location
const BODY_AREA_LABELS = {
  '1': 'Head (Left Front)',
  '2': 'Head (Right Front)',
  '3': 'Neck (Front)',
  '4': 'Right Shoulder/Chest',
  '5': 'Left Shoulder/Chest',
  '6': 'Right Upper Arm',
  '7': 'Left Upper Arm',
  '8': 'Right Forearm',
  '9': 'Left Forearm',
  '10': 'Right Hand',
  '11': 'Left Hand',
  '12': 'Right Upper Abdomen',
  '13': 'Left Upper Abdomen',
  '14': 'Right Lower Abdomen',
  '15': 'Left Lower Abdomen',
  '16': 'Groin',
  '17': 'Right Upper Leg',
  '18': 'Left Upper Leg',
  '19': 'Right Lower Leg',
  '20': 'Left Lower Leg',
  '21': 'Right Foot',
  '22': 'Left Foot',
  '23': 'Head (Left Back)',
  '24': 'Head (Right Back)',
  '25': 'Neck (Back)',
  '26': 'Right Shoulder (Back)',
  '27': 'Left Shoulder (Back)',
  '28': 'Right Upper Arm (Back)',
  '29': 'Left Upper Arm (Back)',
  '30': 'Right Forearm (Back)',
  '31': 'Left Forearm (Back)',
  '32': 'Right Hand (Back)',
  '33': 'Left Hand (Back)',
  '34': 'Upper Back (Right)',
  '35': 'Upper Back (Left)',
  '36': 'Mid Back (Right)',
  '37': 'Mid Back (Left)',
  '38': 'Right Buttock',
  '39': 'Left Buttock',
  '40': 'Right Upper Leg (Back)',
  '41': 'Left Upper Leg (Back)',
  '42': 'Right Lower Leg (Back)',
  '43': 'Left Lower Leg (Back)',
  '44': 'Right Heel',
  '45': 'Left Heel'
}

const generateSafetyEventPDF = async (data) => {
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

      // Helper function for section headers
      const addSectionHeader = (title) => {
        if (doc.y > 680) doc.addPage()
        doc.fontSize(14)
          .fillColor('#dc2626')
          .font('Helvetica-Bold')
          .text(title)
        doc.moveDown(0.3)
        doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke('#dc2626')
        doc.moveDown(0.5)
      }

      // Helper function for label-value pairs
      const addField = (label, value) => {
        if (doc.y > 700) doc.addPage()
        doc.fontSize(10)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text(label + ': ', { continued: true })
          .fillColor('#333333')
          .font('Helvetica')
          .text(value || 'N/A')
        doc.moveDown(0.3)
      }

      // Helper for checkbox lists
      const addCheckboxList = (label, items) => {
        if (!items || (Array.isArray(items) && items.length === 0)) return
        if (doc.y > 680) doc.addPage()
        doc.fontSize(10)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text(label + ':')
        doc.moveDown(0.2)
        const itemsArray = Array.isArray(items) ? items : [items]
        itemsArray.forEach(item => {
          doc.fontSize(9)
            .fillColor('#333333')
            .font('Helvetica')
            .text('  • ' + item)
        })
        doc.moveDown(0.4)
      }

      // Header with date
      doc.fontSize(10)
        .fillColor('#666666')
        .text(formatDate(data.dateOfEvent), { align: 'right' })

      doc.moveDown(0.5)

      // Title
      doc.fontSize(22)
        .fillColor('#dc2626')
        .font('Helvetica-Bold')
        .text('Safety Event Report', { align: 'center' })

      doc.moveDown(0.3)

      // Submission ID
      doc.fontSize(10)
        .fillColor('#999999')
        .font('Helvetica')
        .text(`Submission ID: ${data.submissionId}`, { align: 'center' })

      doc.moveDown(1)

      // Employee/Contractor Information
      addSectionHeader('Employee/Contractor Information')
      addField('Name', `${data.firstName || ''} ${data.lastName || ''}`.trim())
      addField('Employee Number', data.employeeNumber)
      addField('Phone Number', data.phoneNumber)

      doc.moveDown(0.5)

      // Event Information
      addSectionHeader('Event Information')
      addField('Date of Event', formatDate(data.dateOfEvent))
      addField('Time of Event', data.timeOfEvent)
      addField('Terminal', data.terminal)
      addField('Event Location', data.eventLocation)
      if (data.eventLocation === 'Other') {
        addField('Other Location', data.otherLocation)
      }

      doc.moveDown(0.5)

      // Event Types
      addSectionHeader('Event Types')
      addCheckboxList('Selected Event Types', data.eventTypes)

      doc.moveDown(0.5)

      // Vehicle Information
      addSectionHeader('Vehicle Information')
      addField('Tractor Number', data.tractorNumber)
      addField('Trailer Number', data.trailerNumber)
      addField('Vehicle Towed', data.vehicleTowed)
      addCheckboxList('Vehicle Damage', data.vehicleDamage)
      addField('Vehicle Location', data.vehicleLocation)
      addField('Pro Number', data.proNumber)
      addField('Shipper Name', data.shipperName)

      // Hazardous Materials (if applicable)
      const hasHazmat = data.eventTypes && data.eventTypes.includes('Hazardous materials spilled')
      if (hasHazmat) {
        doc.moveDown(0.5)
        addSectionHeader('Hazardous Materials Information')
        addField('ID Number', data.hazmatIdNumber)
        addField('Proper Shipping Name', data.properShippingName)
        addField('Technical Name', data.technicalName)
        addField('Hazard Class', data.hazardClass)
        addField('Packaging Group', data.packagingGroup)
        addField('Quantity Released', data.quantityReleased)
        addField('Packaging Description', data.packagingDescription)
      }

      doc.moveDown(0.5)

      // Supervisor Contact
      addSectionHeader('Supervisor Contact')
      addField('Supervisor Contacted', data.supervisorContacted)
      if (data.supervisorContacted === 'Yes') {
        addField('Supervisor Name', `${data.supervisorFirstName || ''} ${data.supervisorLastName || ''}`.trim())
      } else if (data.supervisorContacted === 'No') {
        addField('Reason Not Contacted', data.supervisorNotContactedReason)
      }
      addField('CURA Contacted', data.curaContacted)

      // DOT Inspection (if applicable)
      const hasDOT = data.eventTypes && data.eventTypes.includes('DOT Inspection')
      if (hasDOT) {
        doc.moveDown(0.5)
        addSectionHeader('DOT Inspection Details')
        addField('Inspection Level', data.dotInspectionLevel)
        addField('# of Violations', data.numberOfViolations)
        addField('Out of Service', data.outOfService)
      }

      // Other Vehicle Information (if applicable)
      const hasOtherVehicle = data.eventTypes && data.eventTypes.includes('Other vehicles involved')
      if (hasOtherVehicle) {
        doc.moveDown(0.5)
        addSectionHeader('Other Vehicle (#2) Information')
        addField('Make/Model', data.vehicle2MakeModel)
        addField('License # and State', data.vehicle2License)
        addField('VIN #', data.vehicle2Vin)
        addField('Driver Name', data.vehicle2DriverName)
        addField('Driver License #', data.vehicle2DriverLicense)
        addField('Driver Phone', data.vehicle2DriverPhone)
        addField('Owner/Company', data.vehicle2OwnerName)
        addField('Insurance Company', data.vehicle2InsuranceCompany)
        addField('Insurance Policy #', data.vehicle2InsurancePolicy)
      }

      // Property Damage (if applicable)
      const hasPropertyDamage = data.eventTypes && data.eventTypes.includes('Property damage (other than vehicles)')
      if (hasPropertyDamage) {
        doc.moveDown(0.5)
        addSectionHeader('Property Damage Information')
        addField('Property Owner', data.propertyOwner)
        addField('Phone #', data.propertyOwnerPhone)
        addField('Insurance Company', data.propertyInsuranceCompany)
        addField('Insurance Policy #', data.propertyInsurancePolicy)
        addField('Damage Description', data.propertyDamageDescription)
      }

      // Witness Information
      if (data.witnessName) {
        doc.moveDown(0.5)
        addSectionHeader('Witness Information')
        addField('Witness Name', data.witnessName)
        addField('Witness Phone', data.witnessPhone)
        const witnessAddress = [
          data.witnessStreet,
          data.witnessStreet2,
          `${data.witnessCity || ''} ${data.witnessState || ''} ${data.witnessZip || ''}`.trim()
        ].filter(Boolean).join(', ')
        if (witnessAddress) addField('Witness Address', witnessAddress)
      }

      // Scene Conditions
      doc.moveDown(0.5)
      addSectionHeader('Scene Conditions')
      addCheckboxList('Character of Road', data.characterOfRoad)
      addCheckboxList('Road Surface Condition', data.roadSurfaceCondition)
      addCheckboxList('Weather', data.weather)
      addCheckboxList('Light Conditions', data.lightConditions)
      addCheckboxList('Control Device', data.controlDevice)
      addCheckboxList('Type of Collision', data.collisionType)
      addCheckboxList('Highway Type', data.highwayType)
      addField('Speed at Time of Event', data.speedAtEvent)

      // Incident Description
      doc.moveDown(0.5)
      addSectionHeader('Incident Description')
      doc.fontSize(10)
        .fillColor('#333333')
        .font('Helvetica')
        .text(data.employeeStatement || 'No statement provided', {
          width: pageWidth,
          align: 'left'
        })

      // First Report of Injury (if applicable)
      const hasInjury = data.eventTypes && data.eventTypes.includes('Illness or injury to self')
      if (hasInjury) {
        doc.addPage()
        addSectionHeader('First Report of Injury')
        addField('Employee Sex', data.employeeSex)
        addField('Employee Department', data.employeeDepartment)
        addField('Work Status', data.employeeWorkStatus)
        addField('Months with Employer', data.monthsWithEmployer)
        addField('Job Title at Time of Event', data.jobTitleAtEvent)
        addField('Months in Job', data.monthsInJob)
        addField('Work Day Part', data.workDayPart)

        // Body Areas Affected
        doc.moveDown(0.5)
        addSectionHeader('Body Areas Affected')

        const frontAreas = data.bodyAreasFront || []
        const backAreas = data.bodyAreasBack || []
        const allAreas = [...(Array.isArray(frontAreas) ? frontAreas : [frontAreas]), ...(Array.isArray(backAreas) ? backAreas : [backAreas])].filter(Boolean)

        if (allAreas.length > 0) {
          const areaLabels = allAreas.map(area => `Area ${area}: ${BODY_AREA_LABELS[area] || 'Unknown'}`)
          addCheckboxList('Affected Areas', areaLabels)
        } else {
          doc.fontSize(10)
            .fillColor('#666666')
            .font('Helvetica-Oblique')
            .text('No body areas selected')
          doc.moveDown(0.3)
        }

        // Nature of Injury
        doc.moveDown(0.5)
        addSectionHeader('Nature of Injury')
        addCheckboxList('Injury Type(s)', data.injuryNature)

        // Treatment Information
        doc.moveDown(0.5)
        addSectionHeader('Treatment Information')
        addField('Sought Medical Treatment', data.soughtMedicalTreatment)
        if (data.soughtMedicalTreatment === 'Yes') {
          addField('Medical Facility Name', data.medicalFacilityName)
          addField('Medical Facility Address', data.medicalFacilityAddress)
        }
        addField('Left Work Due to Injury', data.leftWorkDueToInjury)
      }

      // Event Evaluation
      doc.moveDown(0.5)
      addSectionHeader('Event Evaluation')
      addCheckboxList('Unsafe Work Conditions', data.unsafeConditions)
      addCheckboxList('Unsafe Acts by People', data.unsafeActs)

      if (data.whyUnsafeExist) {
        addField('Why Unsafe Conditions/Acts Exist', data.whyUnsafeExist)
      }

      addField('Factors Encouraged Unsafe Behavior', data.factorsEncouraged)
      if (data.factorsEncouraged === 'Yes' && data.factorsDescription) {
        addField('Factor Description', data.factorsDescription)
      }
      addField('Unsafe Acts/Conditions Reported Prior', data.priorReported)
      addField('Similar Events or Near Misses Prior', data.similarEventsPrior)

      // Footer
      doc.fontSize(8)
        .fillColor('#999999')
        .text(
          `Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} | CCFS Safety Management System`,
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
  generateObservationPDF,
  generateSafetyEventPDF
}
