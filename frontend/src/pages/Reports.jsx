import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, AlertTriangle, CheckCircle, XCircle, Filter, Calendar, Building2 } from 'lucide-react'
import { TERMINALS } from '../components/FormComponents'

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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [selectedTerminal, startDate, endDate])

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

      setSubmissions(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      recentFailures: []
    }

    // Initialize failure counts for each inspection item
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
        stats.failuresByForklift[forkliftId] = (stats.failuresByForklift[forkliftId] || 0) + 1

        // Add to recent failures
        stats.recentFailures.push({
          id: sub.id,
          date: data.date,
          terminal: sub.terminal,
          forkliftId: data.forkliftId,
          operator: data.operatorName,
          failedItems: Object.entries(data.inspection || {})
            .filter(([, v]) => v === 'Fail')
            .map(([k]) => stats.failuresByItem[k]?.label || k),
          safeToOperate: data.safeToOperate,
          defectsFound: data.defectsFound
        })
      }

      // Safe to operate count
      if (data.safeToOperate === 'Yes') stats.safeToOperate.yes++
      else if (data.safeToOperate === 'No') stats.safeToOperate.no++
    })

    // Sort recent failures by date (most recent first)
    stats.recentFailures.sort((a, b) => new Date(b.date) - new Date(a.date))

    return stats
  }

  const stats = calculateStats()

  const clearFilters = () => {
    setSelectedTerminal('')
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
            <Link to="/" className="text-white/80 hover:text-white">
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
          {(selectedTerminal || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Terminal</label>
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
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
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
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-700">Failures by Terminal</h3>
            </div>
            {Object.keys(stats.failuresByTerminal).length === 0 ? (
              <div className="p-6 text-center text-gray-400">No failures by terminal</div>
            ) : (
              <div className="divide-y">
                {Object.entries(stats.failuresByTerminal)
                  .sort((a, b) => b[1] - a[1])
                  .map(([terminal, count]) => (
                    <div key={terminal} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{terminal}</span>
                      </div>
                      <span className="text-sm font-semibold text-red-600">{count} failed inspection(s)</span>
                    </div>
                  ))}
              </div>
            )}
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
    </div>
  )
}

export default Reports
