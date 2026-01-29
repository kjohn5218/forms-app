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

module.exports = {
  generateLoadQualityExceptionPDF
}
