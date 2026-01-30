import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, AlertTriangle, CheckCircle, XCircle, Filter, Calendar, Building2, Image, User, Truck, X, Download, FileText, FileSpreadsheet } from 'lucide-react'
import { TERMINALS } from '../components/FormComponents'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const INSPECTION_ITEMS = [
  { name: 'forks', label: 'Forks' },
  { name: 'mastLiftChains', label: 'Mast/Chains' },
  { name: 'overheadGuard', label: 'Overhead Guard' },
  { name: 'loadBackrest', label: 'Load Backrest' },
  { name: 'tiresWheels', label: 'Tires/Wheels' },
  { name: 'brakes', label: 'Brakes' },
  { name: 'steering', label: 'Steering' },
  { name: 'horn', label: 'Horn' },
  { name: 'lights', label: 'Lights' },
  { name: 'backupAlarm', label: 'Backup Alarm' },
  { name: 'hydraulicSystem', label: 'Hydraulic System' },
  { name: 'batteryFuel', label: 'Battery/Fuel' },
  { name: 'seatBelt', label: 'Seat Belt' },
  { name: 'mirrors', label: 'Mirrors' },
  { name: 'fireExtinguisher', label: 'Fire Extinguisher' }
]

const Reports = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  // Filters
  const [selectedTerminal, setSelectedTerminal] = useState('')
  const [selectedForklift, setSelectedForklift] = useState('')
  const [selectedOperator, setSelectedOperator] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Photo modal
  const [photoModal, setPhotoModal] = useState({ open: false, photos: [], currentIndex: 0 })

  useEffect(() => {
    fetchSubmissions()
  }, [selectedTerminal, selectedForklift, selectedOperator, startDate, endDate])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      let url = '/api/forms/submissions?formType=forklift-inspection&limit=1000'
      if (selectedTerminal) {
        url += `&terminal=${selectedTerminal}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch data')

      const result = await response.json()
      let filtered = result.submissions || []

      // Apply date filters on client side
      if (startDate) {
        filtered = filtered.filter(s => s.data.date >= startDate)
      }
      if (endDate) {
        filtered = filtered.filter(s => s.data.date <= endDate)
      }
      // Apply forklift filter
      if (selectedForklift) {
        filtered = filtered.filter(s => s.data.forkliftId === selectedForklift)
      }
      // Apply operator filter
      if (selectedOperator) {
        filtered = filtered.filter(s => s.data.operatorName === selectedOperator)
      }

      setSubmissions(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Get unique forklifts and operators for filter dropdowns
  const { uniqueForklifts, uniqueOperators } = useMemo(() => {
    const forklifts = new Set()
    const operators = new Set()
    submissions.forEach(sub => {
      if (sub.data.forkliftId) forklifts.add(sub.data.forkliftId)
      if (sub.data.operatorName) operators.add(sub.data.operatorName)
    })
    return {
      uniqueForklifts: Array.from(forklifts).sort(),
      uniqueOperators: Array.from(operators).sort()
    }
  }, [submissions])

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalInspections: submissions.length,
      inspectionsWithFailures: 0,
      totalFailures: 0,
      safeToOperate: { yes: 0, no: 0 },
      failuresByItem: {},
      failuresByTerminal: {},
      failuresByForklift: {},
      inspectionsByTerminal: {},
      recentFailures: [],
      allInspections: []
    }

    // Initialize failure counts for each inspection item
    INSPECTION_ITEMS.forEach(item => {
      stats.failuresByItem[item.name] = { label: item.label, count: 0 }
    })

    submissions.forEach(sub => {
      const data = sub.data
      let hasFailure = false
      const failedItems = []
      const passedItems = []
      const naItems = []

      // Track inspections by terminal (all inspections, not just failures)
      const terminal = sub.terminal || 'Unknown'
      stats.inspectionsByTerminal[terminal] = (stats.inspectionsByTerminal[terminal] || 0) + 1

      // Count failures by inspection item
      if (data.inspection) {
        Object.entries(data.inspection).forEach(([key, value]) => {
          const label = stats.failuresByItem[key]?.label || key
          if (value === 'Fail') {
            hasFailure = true
            stats.totalFailures++
            if (stats.failuresByItem[key]) {
              stats.failuresByItem[key].count++
            }
            failedItems.push(label)
          } else if (value === 'Pass') {
            passedItems.push(label)
          } else if (value === 'N/A') {
            naItems.push(label)
          }
        })
      }

      // Build inspection detail for all inspections list
      const inspectionDetail = {
        id: sub.id,
        date: data.date,
        terminal: sub.terminal,
        forkliftId: data.forkliftId,
        operator: data.operatorName,
        shift: data.shift,
        hourMeter: data.hourMeter,
        inspection: data.inspection,
        passedItems,
        failedItems,
        naItems,
        safeToOperate: data.safeToOperate,
        defectsFound: data.defectsFound,
        photos: data.photos || [],
        itemPhotos: data.itemPhotos || {}, // Photos per failed item
        hasFailure
      }
      stats.allInspections.push(inspectionDetail)

      if (hasFailure) {
        stats.inspectionsWithFailures++

        // Track failures by terminal
        stats.failuresByTerminal[terminal] = (stats.failuresByTerminal[terminal] || 0) + 1

        // Track by forklift
        const forkliftId = data.forkliftId || 'Unknown'
        stats.failuresByForklift[forkliftId] = (stats.failuresByForklift[forkliftId] || 0) + 1

        // Add to recent failures
        stats.recentFailures.push({
          id: sub.id,
          date: data.date,
          terminal: sub.terminal,
          forkliftId: data.forkliftId,
          operator: data.operatorName,
          failedItems,
          safeToOperate: data.safeToOperate,
          defectsFound: data.defectsFound,
          photos: data.photos || [],
          itemPhotos: data.itemPhotos || {} // Photos per failed item
        })
      }

      // Safe to operate count
      if (data.safeToOperate === 'Yes') stats.safeToOperate.yes++
      else if (data.safeToOperate === 'No') stats.safeToOperate.no++
    })

    // Sort recent failures by date (most recent first)
    stats.recentFailures.sort((a, b) => new Date(b.date) - new Date(a.date))
    // Sort all inspections by date (most recent first)
    stats.allInspections.sort((a, b) => new Date(b.date) - new Date(a.date))

    return stats
  }

  const stats = calculateStats()

  // Open photo modal
  const openPhotoModal = (photos, index = 0) => {
    setPhotoModal({ open: true, photos, currentIndex: index })
  }

  const closePhotoModal = () => {
    setPhotoModal({ open: false, photos: [], currentIndex: 0 })
  }

  const nextPhoto = () => {
    setPhotoModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length
    }))
  }

  const prevPhoto = () => {
    setPhotoModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
    }))
  }

  // Export single inspection to PDF
  const exportInspectionToPDF = (inspection) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Forklift Inspection Report', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`ID: ${inspection.id}`, 105, 28, { align: 'center' })

    // Basic Info
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Basic Information', 14, 40)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const basicInfo = [
      ['Date', inspection.date],
      ['Terminal', inspection.terminal],
      ['Forklift ID', inspection.forkliftId],
      ['Operator', inspection.operator],
      ['Shift', inspection.shift],
      ['Hour Meter', inspection.hourMeter?.toString() || 'N/A'],
      ['Safe to Operate', inspection.safeToOperate]
    ]

    doc.autoTable({
      startY: 45,
      head: [],
      body: basicInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    })

    // Inspection Results
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Inspection Results', 14, doc.lastAutoTable.finalY + 15)

    const inspectionData = INSPECTION_ITEMS.map(item => {
      const value = inspection.inspection?.[item.name] || 'N/A'
      return [item.label, value]
    })

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Item', 'Status']],
      body: inspectionData,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      didParseCell: (data) => {
        if (data.column.index === 1) {
          if (data.cell.raw === 'Pass') {
            data.cell.styles.textColor = [34, 139, 34]
          } else if (data.cell.raw === 'Fail') {
            data.cell.styles.textColor = [220, 53, 69]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    })

    // Defects
    if (inspection.defectsFound) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Defects/Notes', 14, doc.lastAutoTable.finalY + 15)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const splitText = doc.splitTextToSize(inspection.defectsFound, 180)
      doc.text(splitText, 14, doc.lastAutoTable.finalY + 22)
    }

    // Footer
    doc.setFontSize(8)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 285)
    doc.text('CCFS LTL Logistics', 196, 285, { align: 'right' })

    doc.save(`Forklift_Inspection_${inspection.id}.pdf`)
  }

  // Export all inspections list to PDF
  const exportListToPDF = () => {
    const doc = new jsPDF('landscape')

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Forklift Inspection Report', 148, 15, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const filterText = []
    if (selectedTerminal) filterText.push(`Terminal: ${selectedTerminal}`)
    if (selectedForklift) filterText.push(`Forklift: ${selectedForklift}`)
    if (selectedOperator) filterText.push(`Operator: ${selectedOperator}`)
    if (startDate) filterText.push(`From: ${startDate}`)
    if (endDate) filterText.push(`To: ${endDate}`)
    doc.text(filterText.length > 0 ? filterText.join(' | ') : 'All Inspections', 148, 22, { align: 'center' })

    const tableData = stats.allInspections.map(i => [
      i.date,
      i.terminal,
      i.forkliftId,
      i.operator,
      i.shift,
      i.passedItems.length,
      i.failedItems.length,
      i.safeToOperate,
      i.id
    ])

    doc.autoTable({
      startY: 30,
      head: [['Date', 'Terminal', 'Forklift', 'Operator', 'Shift', 'Passed', 'Failed', 'Safe', 'ID']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.cell.raw > 0) {
          data.cell.styles.textColor = [220, 53, 69]
          data.cell.styles.fontStyle = 'bold'
        }
        if (data.column.index === 7) {
          if (data.cell.raw === 'No') {
            data.cell.styles.textColor = [220, 53, 69]
            data.cell.styles.fontStyle = 'bold'
          } else if (data.cell.raw === 'Yes') {
            data.cell.styles.textColor = [34, 139, 34]
          }
        }
      }
    })

    // Summary
    const summaryY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ${stats.totalInspections} | With Failures: ${stats.inspectionsWithFailures} | Pass Rate: ${stats.totalInspections > 0 ? Math.round((1 - stats.inspectionsWithFailures / stats.totalInspections) * 100) : 0}%`, 14, summaryY)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 200)
    doc.text('CCFS LTL Logistics', 283, 200, { align: 'right' })

    doc.save(`Forklift_Inspections_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Export single inspection to Excel
  const exportInspectionToExcel = (inspection) => {
    const basicInfo = [
      ['Forklift Inspection Report', ''],
      ['', ''],
      ['ID', inspection.id],
      ['Date', inspection.date],
      ['Terminal', inspection.terminal],
      ['Forklift ID', inspection.forkliftId],
      ['Operator', inspection.operator],
      ['Shift', inspection.shift],
      ['Hour Meter', inspection.hourMeter],
      ['Safe to Operate', inspection.safeToOperate],
      ['', ''],
      ['Inspection Results', ''],
      ['Item', 'Status']
    ]

    const inspectionResults = INSPECTION_ITEMS.map(item => [
      item.label,
      inspection.inspection?.[item.name] || 'N/A'
    ])

    const defects = [
      ['', ''],
      ['Defects/Notes', inspection.defectsFound || 'None']
    ]

    const data = [...basicInfo, ...inspectionResults, ...defects]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection')
    XLSX.writeFile(wb, `Forklift_Inspection_${inspection.id}.xlsx`)
  }

  // Export all inspections list to Excel
  const exportListToExcel = () => {
    const headers = ['Date', 'Terminal', 'Forklift ID', 'Operator', 'Shift', 'Hour Meter', 'Safe to Operate', 'Passed Items', 'Failed Items', 'N/A Items', 'Has Failure', 'Defects', 'ID']

    const data = stats.allInspections.map(i => [
      i.date,
      i.terminal,
      i.forkliftId,
      i.operator,
      i.shift,
      i.hourMeter,
      i.safeToOperate,
      i.passedItems.join(', '),
      i.failedItems.join(', '),
      i.naItems.join(', '),
      i.hasFailure ? 'Yes' : 'No',
      i.defectsFound || '',
      i.id
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 8 },
      { wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 40 }, { wch: 30 },
      { wch: 12 }, { wch: 40 }, { wch: 15 }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inspections')

    // Add summary sheet
    const summaryData = [
      ['Forklift Inspection Summary Report'],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Filters Applied'],
      ['Terminal', selectedTerminal || 'All'],
      ['Forklift', selectedForklift || 'All'],
      ['Operator', selectedOperator || 'All'],
      ['Date Range', startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'All'],
      [''],
      ['Statistics'],
      ['Total Inspections', stats.totalInspections],
      ['Inspections with Failures', stats.inspectionsWithFailures],
      ['Total Failed Items', stats.totalFailures],
      ['Pass Rate', `${stats.totalInspections > 0 ? Math.round((1 - stats.inspectionsWithFailures / stats.totalInspections) * 100) : 0}%`],
      ['Safe to Operate - Yes', stats.safeToOperate.yes],
      ['Safe to Operate - No', stats.safeToOperate.no],
      [''],
      ['Terminals with Activity', Object.keys(stats.inspectionsByTerminal).length]
    ]

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

    XLSX.writeFile(wb, `Forklift_Inspections_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const clearFilters = () => {
    setSelectedTerminal('')
    setSelectedForklift('')
    setSelectedOperator('')
    setStartDate('')
    setEndDate('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/reports" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <BarChart3 className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-lg font-semibold text-white">Forklift Inspection Reports</h1>
              <p className="text-xs text-white/70">Analytics & Reporting</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {(selectedTerminal || selectedForklift || selectedOperator || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <Building2 className="w-3 h-3 inline mr-1" />Terminal
            </label>
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Terminals</option>
              {TERMINALS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <Truck className="w-3 h-3 inline mr-1" />Forklift
            </label>
            <select
              value={selectedForklift}
              onChange={(e) => setSelectedForklift(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Forklifts</option>
              {uniqueForklifts.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <User className="w-3 h-3 inline mr-1" />Operator
            </label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Operators</option>
              {uniqueOperators.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'allInspections', label: 'All Inspections' },
            { id: 'failures', label: 'Failures Detail' },
            { id: 'byItem', label: 'By Item' },
            { id: 'byTerminal', label: 'By Terminal' },
            { id: 'byForklift', label: 'By Forklift' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-blue-600">{stats.totalInspections}</div>
                <div className="text-sm text-gray-500">Total Inspections</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-red-600">{stats.inspectionsWithFailures}</div>
                <div className="text-sm text-gray-500">With Failures</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-orange-600">{stats.totalFailures}</div>
                <div className="text-sm text-gray-500">Total Failed Items</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalInspections > 0
                    ? Math.round((1 - stats.inspectionsWithFailures / stats.totalInspections) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">Pass Rate</div>
              </div>
            </div>

            {/* Safe to Operate */}
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="font-semibold text-gray-700 mb-3">Safe to Operate Status</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Yes: <strong>{stats.safeToOperate.yes}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">No: <strong>{stats.safeToOperate.no}</strong></span>
                </div>
              </div>
            </div>

            {/* Top Failed Items */}
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="font-semibold text-gray-700 mb-3">Top Failed Items</h3>
              <div className="space-y-2">
                {Object.entries(stats.failuresByItem)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 5)
                  .filter(([, data]) => data.count > 0)
                  .map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{data.label}</span>
                      <span className="text-sm font-semibold text-red-600">{data.count}</span>
                    </div>
                  ))}
                {Object.values(stats.failuresByItem).every(d => d.count === 0) && (
                  <p className="text-sm text-gray-400">No failures recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'allInspections' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">All Inspections ({stats.allInspections.length})</h3>
              {stats.allInspections.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={exportListToExcel}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export XLS
                  </button>
                  <button
                    onClick={exportListToPDF}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
            {stats.allInspections.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow text-center text-gray-400">
                No inspections found
              </div>
            ) : (
              stats.allInspections.map(inspection => (
                <div key={inspection.id} className={`bg-white rounded-xl p-4 shadow ${inspection.hasFailure ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-800">Forklift #{inspection.forkliftId}</div>
                      <div className="text-sm text-gray-500">{inspection.terminal} - {inspection.date}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        inspection.safeToOperate === 'No'
                          ? 'bg-red-100 text-red-700'
                          : inspection.hasFailure
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {inspection.safeToOperate === 'No' ? 'Unsafe' : inspection.hasFailure ? 'Issues Found' : 'Pass'}
                      </span>
                      <span className="text-xs text-gray-400">{inspection.shift} Shift</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><strong className="text-gray-600">Operator:</strong> {inspection.operator}</div>
                    <div><strong className="text-gray-600">Hour Meter:</strong> {inspection.hourMeter}</div>
                  </div>

                  {/* Inspection Results */}
                  <div className="space-y-2 text-sm">
                    {inspection.passedItems.length > 0 && (
                      <div>
                        <strong className="text-green-600">Passed ({inspection.passedItems.length}):</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inspection.passedItems.map((item, idx) => (
                            <span key={idx} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {inspection.failedItems.length > 0 && (
                      <div>
                        <strong className="text-red-600">Failed ({inspection.failedItems.length}):</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inspection.failedItems.map((item, idx) => (
                            <span key={idx} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {inspection.naItems.length > 0 && (
                      <div>
                        <strong className="text-gray-500">N/A ({inspection.naItems.length}):</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inspection.naItems.map((item, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {inspection.defectsFound && (
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Defects/Notes:</strong> {inspection.defectsFound}
                    </div>
                  )}

                  {/* Item-specific Photos (for failed items) */}
                  {inspection.itemPhotos && Object.keys(inspection.itemPhotos).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <strong className="text-sm text-red-600">Failed Item Photos</strong>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(inspection.itemPhotos).map(([itemName, photos]) => {
                          if (!photos || photos.length === 0) return null
                          const itemLabel = INSPECTION_ITEMS.find(i => i.name === itemName)?.label || itemName
                          return (
                            <div key={itemName} className="bg-red-50 rounded-lg p-2">
                              <div className="text-xs font-medium text-red-700 mb-1">{itemLabel}</div>
                              <div className="flex gap-2 overflow-x-auto">
                                {photos.map((photo, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => openPhotoModal(photos, idx)}
                                    className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-red-200 hover:border-red-500 transition-colors"
                                  >
                                    <img
                                      src={photo}
                                      alt={`${itemLabel} photo ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* General Photos */}
                  {inspection.photos.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-gray-500" />
                        <strong className="text-sm text-gray-600">Additional Photos ({inspection.photos.length})</strong>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {inspection.photos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() => openPhotoModal(inspection.photos, idx)}
                            className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                          >
                            <img
                              src={photo}
                              alt={`Inspection photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <div className="text-xs text-gray-400">ID: {inspection.id}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportInspectionToExcel(inspection)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
                        title="Export to Excel"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        XLS
                      </button>
                      <button
                        onClick={() => exportInspectionToPDF(inspection)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                        title="Export to PDF"
                      >
                        <FileText className="w-3 h-3" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'failures' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-700">Recent Inspections with Failures</h3>
            </div>
            {stats.recentFailures.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow text-center text-gray-400">
                No failed inspections found
              </div>
            ) : (
              stats.recentFailures.map(failure => (
                <div key={failure.id} className="bg-white rounded-xl p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">Forklift #{failure.forkliftId}</div>
                      <div className="text-sm text-gray-500">{failure.terminal} - {failure.date}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      failure.safeToOperate === 'No'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {failure.safeToOperate === 'No' ? 'Unsafe' : 'Issues Found'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Operator:</strong> {failure.operator}
                  </div>
                  <div className="text-sm">
                    <strong className="text-red-600">Failed Items:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {failure.failedItems.map((item, idx) => (
                        <span key={idx} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {failure.defectsFound && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Notes:</strong> {failure.defectsFound}
                    </div>
                  )}
                  {/* Item-specific Photos */}
                  {failure.itemPhotos && Object.keys(failure.itemPhotos).length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <strong className="text-xs text-red-600">Failed Item Photos</strong>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(failure.itemPhotos).map(([itemName, photos]) => {
                          if (!photos || photos.length === 0) return null
                          const itemLabel = INSPECTION_ITEMS.find(i => i.name === itemName)?.label || itemName
                          return (
                            <div key={itemName} className="bg-red-50 rounded p-1.5">
                              <div className="text-xs font-medium text-red-700 mb-1">{itemLabel}</div>
                              <div className="flex gap-1 overflow-x-auto">
                                {photos.map((photo, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => openPhotoModal(photos, idx)}
                                    className="flex-shrink-0 w-10 h-10 rounded overflow-hidden border border-red-200 hover:border-red-500 transition-colors"
                                  >
                                    <img
                                      src={photo}
                                      alt={`${itemLabel} photo ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {/* General Photos */}
                  {failure.photos && failure.photos.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-gray-500" />
                        <strong className="text-xs text-gray-600">Additional Photos ({failure.photos.length})</strong>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {failure.photos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() => openPhotoModal(failure.photos, idx)}
                            className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                          >
                            <img
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">ID: {failure.id}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'byItem' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-700">Failures by Inspection Item</h3>
            </div>
            <div className="divide-y">
              {Object.entries(stats.failuresByItem)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-600">{data.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{
                            width: `${stats.totalInspections > 0
                              ? (data.count / stats.totalInspections) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                        {data.count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'byTerminal' && (
          <div className="space-y-4">
            {/* Inspections by Terminal */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-700">Inspections by Terminal</h3>
                <p className="text-xs text-gray-500 mt-1">Total inspections completed at each terminal</p>
              </div>
              {Object.keys(stats.inspectionsByTerminal).length === 0 ? (
                <div className="p-6 text-center text-gray-400">No inspections found</div>
              ) : (
                <div className="divide-y">
                  {Object.entries(stats.inspectionsByTerminal)
                    .sort((a, b) => b[1] - a[1])
                    .map(([terminal, count]) => {
                      const failures = stats.failuresByTerminal[terminal] || 0
                      const passRate = count > 0 ? Math.round(((count - failures) / count) * 100) : 0
                      return (
                        <div key={terminal} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{terminal}</span>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">{count} inspection(s)</span>
                          </div>
                          <div className="flex items-center gap-3 ml-6">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${passRate}%` }}
                              />
                            </div>
                            <div className="flex gap-3 text-xs">
                              <span className="text-green-600">{count - failures} passed</span>
                              <span className="text-red-600">{failures} failed</span>
                              <span className="text-gray-500">{passRate}% pass rate</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(stats.inspectionsByTerminal).length}</div>
                <div className="text-sm text-gray-500">Terminals with Activity</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalInspections > 0
                    ? Math.round(stats.totalInspections / Object.keys(stats.inspectionsByTerminal).length)
                    : 0}
                </div>
                <div className="text-sm text-gray-500">Avg per Terminal</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'byForklift' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-700">Failures by Forklift</h3>
              <p className="text-xs text-gray-500 mt-1">Forklifts with multiple failures may need maintenance attention</p>
            </div>
            {Object.keys(stats.failuresByForklift).length === 0 ? (
              <div className="p-6 text-center text-gray-400">No failures by forklift</div>
            ) : (
              <div className="divide-y">
                {Object.entries(stats.failuresByForklift)
                  .sort((a, b) => b[1] - a[1])
                  .map(([forkliftId, count]) => (
                    <div key={forkliftId} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-600">Forklift #{forkliftId}</span>
                      <span className={`text-sm font-semibold ${
                        count >= 3 ? 'text-red-600' : count >= 2 ? 'text-orange-600' : 'text-yellow-600'
                      }`}>
                        {count} failed inspection(s)
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {photoModal.open && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePhotoModal}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={closePhotoModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={photoModal.photos[photoModal.currentIndex]}
              alt={`Photo ${photoModal.currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {photoModal.photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4">
                <button
                  onClick={prevPhoto}
                  className="bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70"
                >
                  Previous
                </button>
                <span className="text-white bg-black/50 px-3 py-1 rounded">
                  {photoModal.currentIndex + 1} / {photoModal.photos.length}
                </span>
                <button
                  onClick={nextPhoto}
                  className="bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
