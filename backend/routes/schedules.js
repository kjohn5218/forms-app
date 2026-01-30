const express = require('express')
const router = express.Router()
const db = require('../database/init')
const { registerSchedule, unregisterSchedule, executeSchedule } = require('../services/schedulerService')
const crypto = require('crypto')

// Generate unique ID
const generateId = () => {
  return 'SCH-' + crypto.randomBytes(4).toString('hex').toUpperCase()
}

// GET all schedules
router.get('/', (req, res) => {
  try {
    const schedules = db.prepare('SELECT * FROM report_schedules ORDER BY created_at DESC').all()

    // Parse JSON fields
    const result = schedules.map(s => ({
      ...s,
      recipients: JSON.parse(s.recipients),
      is_active: Boolean(s.is_active)
    }))

    res.json({
      success: true,
      schedules: result
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedules'
    })
  }
})

// GET single schedule
router.get('/:id', (req, res) => {
  try {
    const schedule = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(req.params.id)

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    res.json({
      success: true,
      schedule: {
        ...schedule,
        recipients: JSON.parse(schedule.recipients),
        is_active: Boolean(schedule.is_active)
      }
    })
  } catch (error) {
    console.error('Error fetching schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule'
    })
  }
})

// POST create new schedule
router.post('/', (req, res) => {
  try {
    const {
      name,
      frequency,
      day_of_week,
      day_of_month,
      time,
      terminal,
      recipients,
      format
    } = req.body

    // Validate required fields
    if (!name || !frequency || !time || !recipients || !format) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    // Validate recipients
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one recipient email is required'
      })
    }

    const id = generateId()

    const stmt = db.prepare(`
      INSERT INTO report_schedules (id, name, frequency, day_of_week, day_of_month, time, terminal, recipients, format, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `)

    stmt.run(
      id,
      name,
      frequency,
      day_of_week || null,
      day_of_month || null,
      time,
      terminal || null,
      JSON.stringify(recipients),
      format
    )

    // Register with scheduler
    const schedule = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(id)
    registerSchedule(schedule)

    res.json({
      success: true,
      id,
      message: 'Schedule created successfully'
    })
  } catch (error) {
    console.error('Error creating schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule'
    })
  }
})

// PUT update schedule
router.put('/:id', (req, res) => {
  try {
    const {
      name,
      frequency,
      day_of_week,
      day_of_month,
      time,
      terminal,
      recipients,
      format,
      is_active
    } = req.body

    const existing = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    const stmt = db.prepare(`
      UPDATE report_schedules
      SET name = ?, frequency = ?, day_of_week = ?, day_of_month = ?, time = ?, terminal = ?, recipients = ?, format = ?, is_active = ?
      WHERE id = ?
    `)

    stmt.run(
      name || existing.name,
      frequency || existing.frequency,
      day_of_week !== undefined ? day_of_week : existing.day_of_week,
      day_of_month !== undefined ? day_of_month : existing.day_of_month,
      time || existing.time,
      terminal !== undefined ? terminal : existing.terminal,
      recipients ? JSON.stringify(recipients) : existing.recipients,
      format || existing.format,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      req.params.id
    )

    // Update scheduler
    const updated = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(req.params.id)
    if (updated.is_active) {
      registerSchedule(updated)
    } else {
      unregisterSchedule(req.params.id)
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully'
    })
  } catch (error) {
    console.error('Error updating schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update schedule'
    })
  }
})

// DELETE schedule
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    // Unregister from scheduler
    unregisterSchedule(req.params.id)

    // Delete from database
    db.prepare('DELETE FROM report_schedules WHERE id = ?').run(req.params.id)

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule'
    })
  }
})

// POST trigger schedule immediately (test/manual run)
router.post('/:id/test', async (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    // Execute the schedule immediately
    await executeSchedule(req.params.id)

    // Get updated schedule to return last_run_status
    const updated = db.prepare('SELECT * FROM report_schedules WHERE id = ?').get(req.params.id)

    res.json({
      success: true,
      message: 'Report sent successfully',
      last_run_at: updated.last_run_at,
      last_run_status: updated.last_run_status
    })
  } catch (error) {
    console.error('Error executing schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to execute schedule'
    })
  }
})

module.exports = router
