const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')
const db = require('../database/init')

const INSPECTION_ITEMS = [
  { name: 'forks', label: 'Forks (cracks, bends, wear)' },
  { name: 'mastLiftChains', label: 'Mast and Lift Chains' },
  { name: 'overheadGuard', label: 'Overhead Guard' },
  { name: 'loadBackrest', label: 'Load Backrest' },
  { name: 'tiresWheels', label: 'Tires and Wheels' },
  { name: 'brakes', label: 'Brakes (service and parking)' },
  { name: 'steering', label: 'Steering' },
  { name: 'horn', label: 'Horn' },
  { name: 'lights', label: 'Lights (head, tail, warning)' },
  { name: 'backupAlarm', label: 'Backup Alarm' },
  { name: 'hydraulicSystem', label: 'Hydraulic System (leaks, operation)' },
  { name: 'batteryFuel', label: 'Battery/Fuel Level' },
  { name: 'seatBelt', label: 'Seat Belt' },
  { name: 'mirrors', label: 'Mirrors' },
  { name: 'fireExtinguisher', label: 'Fire Extinguisher' }
]

// Get date range based on frequency
const getDateRange = (frequency) => {
  const now = new Date()
  let startDate

  switch (frequency) {
    case 'daily':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 1)
      break
    case 'weekly':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'monthly':
      startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 1)
      break
    default:
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7)
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  }
}

// Query forklift inspection submissions
const getForkliftInspections = (terminal, dateRange) => {
  let query = `
    SELECT * FROM form_submissions
    WHERE form_type = 'forklift-inspection'
  `
  const params = []

  if (terminal) {
    query += ' AND terminal = ?'
    params.push(terminal)
  }

  if (dateRange.start) {
    query += ' AND date(submitted_at) >= date(?)'
    params.push(dateRange.start)
  }

  if (dateRange.end) {
    query += ' AND date(submitted_at) <= date(?)'
    params.push(dateRange.end)
  }

  query += ' ORDER BY submitted_at DESC'

  const submissions = db.prepare(query).all(...params)
  return submissions.map(sub => ({
    ...sub,
    data: JSON.parse(sub.data)
  }))
}

// Calculate statistics from submissions
const calculateStats = (submissions) => {
  const stats = {
    totalInspections: submissions.length,
    inspectionsWithFailures: 0,
    totalFailures: 0,
    safeToOperate: { yes: 0, no: 0 },
    failuresByItem: {},
    failuresByTerminal: {},
    failuresByForklift: []
  }

  // Initialize failure counts
  INSPECTION_ITEMS.forEach(item => {
    stats.failuresByItem[item.name] = { label: item.label, count: 0 }
  })

  submissions.forEach(sub => {
    const data = sub.data
    let hasFailure = false

    // Count failures by inspection item
    if (data.inspection) {
      Object.entries(data.inspection).forEach(([key, value]) => {
        if (value === 'Fail') {
          hasFailure = true
          stats.totalFailures++
          if (stats.failuresByItem[key]) {
            stats.failuresByItem[key].count++
          }
        }
      })
    }

    if (hasFailure) {
      stats.inspectionsWithFailures++

      // Track by terminal
      const terminal = sub.terminal || 'Unknown'
      stats.failuresByTerminal[terminal] = (stats.failuresByTerminal[terminal] || 0) + 1

      // Track by forklift
      const forkliftId = data.forkliftId || 'Unknown'
      const existing = stats.failuresByForklift.find(f => f.forkliftId === forkliftId)
      if (existing) {
        existing.count++
      } else {
        stats.failuresByForklift.push({ forkliftId, count: 1 })
      }
    }

    // Safe to operate count
    if (data.safeToOperate === 'Yes') stats.safeToOperate.yes++
    else if (data.safeToOperate === 'No') stats.safeToOperate.no++
  })

  // Sort forklift failures by count
  stats.failuresByForklift.sort((a, b) => b.count - a.count)

  return stats
}

// Generate PDF report
const generatePDFReport = async (submissions, stats, dateRange, terminal) => {
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

      // Header
      doc.fontSize(10)
        .fillColor('#666666')
        .text(`Report Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`, { align: 'right' })

      doc.moveDown(0.5)

      // Title
      doc.fontSize(20)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Forklift Inspection Report', { align: 'center' })

      doc.moveDown(0.3)

      // Subtitle with date range and terminal
      doc.fontSize(12)
        .fillColor('#666666')
        .font('Helvetica')
        .text(`${dateRange.start} to ${dateRange.end}${terminal ? ` | Terminal: ${terminal}` : ' | All Terminals'}`, { align: 'center' })

      doc.moveDown(1.5)

      // Summary Section
      doc.fontSize(14)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Summary')

      doc.moveDown(0.5)

      // Summary boxes
      const boxWidth = (pageWidth - 30) / 4
      const boxHeight = 60
      const startX = 50
      const startY = doc.y

      const summaryData = [
        { label: 'Total Inspections', value: stats.totalInspections, color: '#3b82f6' },
        { label: 'With Failures', value: stats.inspectionsWithFailures, color: '#ef4444' },
        { label: 'Total Failed Items', value: stats.totalFailures, color: '#f97316' },
        { label: 'Pass Rate', value: `${stats.totalInspections > 0 ? Math.round((1 - stats.inspectionsWithFailures / stats.totalInspections) * 100) : 0}%`, color: '#22c55e' }
      ]

      summaryData.forEach((item, idx) => {
        const x = startX + (boxWidth + 10) * idx
        doc.rect(x, startY, boxWidth, boxHeight)
          .fill('#f3f4f6')

        doc.fontSize(20)
          .fillColor(item.color)
          .font('Helvetica-Bold')
          .text(String(item.value), x, startY + 12, { width: boxWidth, align: 'center' })

        doc.fontSize(9)
          .fillColor('#666666')
          .font('Helvetica')
          .text(item.label, x, startY + 38, { width: boxWidth, align: 'center' })
      })

      doc.y = startY + boxHeight + 20

      // Safe to Operate
      doc.fontSize(12)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Safe to Operate Status')

      doc.moveDown(0.3)
      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text(`Yes: ${stats.safeToOperate.yes}  |  No: ${stats.safeToOperate.no}`)

      doc.moveDown(1)

      // Top Failed Items
      doc.fontSize(14)
        .fillColor('#1e3a5f')
        .font('Helvetica-Bold')
        .text('Failures by Inspection Item')

      doc.moveDown(0.5)

      const sortedItems = Object.entries(stats.failuresByItem)
        .sort((a, b) => b[1].count - a[1].count)

      sortedItems.forEach(([key, data]) => {
        const barWidth = stats.totalInspections > 0 ? (data.count / stats.totalInspections) * 200 : 0

        doc.fontSize(10)
          .fillColor('#333333')
          .font('Helvetica')
          .text(data.label, 50, doc.y, { continued: false })

        const y = doc.y - 12
        doc.rect(280, y, 200, 12).fill('#e5e7eb')
        if (barWidth > 0) {
          doc.rect(280, y, barWidth, 12).fill('#ef4444')
        }

        doc.fontSize(10)
          .fillColor('#333333')
          .text(String(data.count), 490, y + 1)

        doc.moveDown(0.2)
      })

      // New page for details if needed
      if (doc.y > 600) {
        doc.addPage()
      }

      doc.moveDown(1)

      // Failures by Terminal
      if (Object.keys(stats.failuresByTerminal).length > 0) {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Failures by Terminal')

        doc.moveDown(0.5)

        Object.entries(stats.failuresByTerminal)
          .sort((a, b) => b[1] - a[1])
          .forEach(([terminal, count]) => {
            doc.fontSize(10)
              .fillColor('#333333')
              .font('Helvetica')
              .text(`${terminal}: ${count} failed inspection(s)`)
            doc.moveDown(0.2)
          })

        doc.moveDown(1)
      }

      // Failures by Forklift
      if (stats.failuresByForklift.length > 0) {
        doc.fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text('Forklifts with Failures')

        doc.moveDown(0.5)

        stats.failuresByForklift.slice(0, 10).forEach(({ forkliftId, count }) => {
          doc.fontSize(10)
            .fillColor('#333333')
            .font('Helvetica')
            .text(`Forklift #${forkliftId}: ${count} failed inspection(s)`)
          doc.moveDown(0.2)
        })
      }

      // Footer
      doc.fontSize(8)
        .fillColor('#999999')
        .text(
          'CCFS LTL Logistics Safety Management System',
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

// Generate Excel report
const generateExcelReport = async (submissions, stats, dateRange, terminal) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'CCFS Forms'
  workbook.created = new Date()

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary')

  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ]

  summarySheet.addRow({ metric: 'Report Period', value: `${dateRange.start} to ${dateRange.end}` })
  summarySheet.addRow({ metric: 'Terminal', value: terminal || 'All Terminals' })
  summarySheet.addRow({ metric: '', value: '' })
  summarySheet.addRow({ metric: 'Total Inspections', value: stats.totalInspections })
  summarySheet.addRow({ metric: 'Inspections with Failures', value: stats.inspectionsWithFailures })
  summarySheet.addRow({ metric: 'Total Failed Items', value: stats.totalFailures })
  summarySheet.addRow({ metric: 'Pass Rate', value: `${stats.totalInspections > 0 ? Math.round((1 - stats.inspectionsWithFailures / stats.totalInspections) * 100) : 0}%` })
  summarySheet.addRow({ metric: 'Safe to Operate - Yes', value: stats.safeToOperate.yes })
  summarySheet.addRow({ metric: 'Safe to Operate - No', value: stats.safeToOperate.no })

  // Style header row
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // Failures by Item Sheet
  const itemsSheet = workbook.addWorksheet('Failures by Item')

  itemsSheet.columns = [
    { header: 'Inspection Item', key: 'item', width: 40 },
    { header: 'Failure Count', key: 'count', width: 15 },
    { header: 'Failure Rate', key: 'rate', width: 15 }
  ]

  Object.entries(stats.failuresByItem)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([key, data]) => {
      const rate = stats.totalInspections > 0 ? `${Math.round((data.count / stats.totalInspections) * 100)}%` : '0%'
      itemsSheet.addRow({ item: data.label, count: data.count, rate })
    })

  itemsSheet.getRow(1).font = { bold: true }
  itemsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
  itemsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // All Inspections Sheet
  const inspectionsSheet = workbook.addWorksheet('All Inspections')

  inspectionsSheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Terminal', key: 'terminal', width: 10 },
    { header: 'Forklift ID', key: 'forkliftId', width: 15 },
    { header: 'Operator', key: 'operator', width: 20 },
    { header: 'Shift', key: 'shift', width: 10 },
    { header: 'Hour Meter', key: 'hourMeter', width: 12 },
    { header: 'Safe to Operate', key: 'safeToOperate', width: 15 },
    { header: 'Failed Items', key: 'failedItems', width: 50 },
    { header: 'Defects Found', key: 'defects', width: 40 }
  ]

  submissions.forEach(sub => {
    const data = sub.data
    const failedItems = data.inspection
      ? Object.entries(data.inspection)
          .filter(([, v]) => v === 'Fail')
          .map(([k]) => {
            const item = INSPECTION_ITEMS.find(i => i.name === k)
            return item ? item.label : k
          })
          .join(', ')
      : ''

    inspectionsSheet.addRow({
      date: data.date,
      terminal: sub.terminal,
      forkliftId: data.forkliftId,
      operator: data.operatorName,
      shift: data.shift,
      hourMeter: data.hourMeter,
      safeToOperate: data.safeToOperate,
      failedItems: failedItems || 'None',
      defects: data.defectsFound || ''
    })
  })

  inspectionsSheet.getRow(1).font = { bold: true }
  inspectionsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
  inspectionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

// Main function to generate report
const generateReport = async (schedule) => {
  const dateRange = getDateRange(schedule.frequency)
  const submissions = getForkliftInspections(schedule.terminal, dateRange)
  const stats = calculateStats(submissions)

  const reports = []

  if (schedule.format === 'pdf' || schedule.format === 'both') {
    const pdfBuffer = await generatePDFReport(submissions, stats, dateRange, schedule.terminal)
    reports.push({
      type: 'pdf',
      buffer: pdfBuffer,
      filename: `Forklift_Inspection_Report_${dateRange.start}_to_${dateRange.end}.pdf`
    })
  }

  if (schedule.format === 'excel' || schedule.format === 'both') {
    const excelBuffer = await generateExcelReport(submissions, stats, dateRange, schedule.terminal)
    reports.push({
      type: 'excel',
      buffer: excelBuffer,
      filename: `Forklift_Inspection_Report_${dateRange.start}_to_${dateRange.end}.xlsx`
    })
  }

  return {
    reports,
    stats,
    dateRange,
    submissionCount: submissions.length
  }
}

module.exports = {
  generateReport,
  getForkliftInspections,
  calculateStats,
  generatePDFReport,
  generateExcelReport,
  getDateRange
}
