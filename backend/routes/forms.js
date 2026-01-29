const express = require('express')
const router = express.Router()
const db = require('../database/init')
const { validateForm } = require('../middleware/validation')
const { sendFormNotification } = require('../services/emailService')

// Helper to get submitted_by field based on form type
const getSubmittedBy = (formType, data) => {
  switch (formType) {
    case 'forklift-inspection':
      return data.operatorName
    case 'safety-event':
      return data.reporterName
    case 'observation':
      return data.observerName
    case 'load-quality-exception':
      return data.employeeReportingName
    case 'dvir-audit':
      return data.auditorName
    case 'forklift-operator-evaluation':
      return data.evaluatorName
    case 'terminal-inspection':
      return data.inspectorName
    case 'hazard-report':
      return data.anonymousReport ? 'Anonymous' : data.reporterName
    case 'driver-ride-along':
      return data.evaluatorName
    case 'shop-inspection':
      return data.inspectorName
    case 'fleet-management':
      return `${data.firstName} ${data.lastName}`
    case 'cvsa-road-check-prep':
      return data.inspectedBy
    case 'fuel-card-receipt':
      return data.driverName
    case 'pre-trip-training':
      return data.trainerName
    case 'red-binder-checklist':
      return `${data.firstName} ${data.lastName}`
    case 'selection-grade-road-test':
      return data.evaluatorName
    default:
      return 'Unknown'
  }
}

// Generic form submission handler
const handleFormSubmission = (formType) => {
  return async (req, res) => {
    try {
      const data = req.validatedBody || req.body
      const submissionId = data.submissionId
      const terminal = data.terminal || data.reportingServiceCenter || data.location || 'N/A'
      const submittedBy = getSubmittedBy(formType, data)
      const submittedAt = new Date().toISOString()

      // Insert into database
      const stmt = db.prepare(`
        INSERT INTO form_submissions (id, form_type, terminal, submitted_by, submitted_at, data)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        submissionId,
        formType,
        terminal,
        submittedBy,
        submittedAt,
        JSON.stringify(data)
      )

      // Send email notification (async, don't wait)
      sendFormNotification(formType, {
        ...data,
        submittedBy,
        terminal
      }).then(result => {
        if (result.success && !result.skipped) {
          // Update email_sent flag
          db.prepare('UPDATE form_submissions SET email_sent = 1 WHERE id = ?')
            .run(submissionId)
        }
      }).catch(err => {
        console.error('Email notification error:', err)
      })

      res.json({
        success: true,
        id: submissionId,
        message: 'Form submitted successfully'
      })

    } catch (error) {
      console.error(`Error submitting ${formType}:`, error)
      res.status(500).json({
        success: false,
        error: 'Failed to submit form'
      })
    }
  }
}

// Define routes for each form type
const formTypes = [
  'forklift-inspection',
  'safety-event',
  'observation',
  'load-quality-exception',
  'dvir-audit',
  'forklift-operator-evaluation',
  'terminal-inspection',
  'hazard-report',
  'driver-ride-along',
  'shop-inspection',
  'fleet-management',
  'cvsa-road-check-prep',
  'fuel-card-receipt',
  'pre-trip-training',
  'red-binder-checklist',
  'selection-grade-road-test'
]

// Register routes
formTypes.forEach(formType => {
  router.post(
    `/${formType}`,
    validateForm(formType),
    handleFormSubmission(formType)
  )
})

// GET endpoint to retrieve form submissions (for admin/reporting)
router.get('/submissions', (req, res) => {
  try {
    const { formType, terminal, limit = 100, offset = 0 } = req.query

    let query = 'SELECT * FROM form_submissions WHERE 1=1'
    const params = []

    if (formType) {
      query += ' AND form_type = ?'
      params.push(formType)
    }

    if (terminal) {
      query += ' AND terminal = ?'
      params.push(terminal)
    }

    query += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    const submissions = db.prepare(query).all(...params)

    // Parse JSON data
    const result = submissions.map(sub => ({
      ...sub,
      data: JSON.parse(sub.data)
    }))

    res.json({
      success: true,
      count: result.length,
      submissions: result
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions'
    })
  }
})

// GET single submission by ID
router.get('/submissions/:id', (req, res) => {
  try {
    const submission = db.prepare(
      'SELECT * FROM form_submissions WHERE id = ?'
    ).get(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      })
    }

    res.json({
      success: true,
      submission: {
        ...submission,
        data: JSON.parse(submission.data)
      }
    })

  } catch (error) {
    console.error('Error fetching submission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission'
    })
  }
})

module.exports = router
