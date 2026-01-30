import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Play,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Table,
  Building2,
  X
} from 'lucide-react'
import { TERMINALS } from '../components/FormComponents'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

const ReportScheduler = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [sendingTest, setSendingTest] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    time: '08:00',
    terminal: '',
    recipients: [''],
    format: 'pdf'
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules')
      const data = await response.json()
      if (data.success) {
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      frequency: 'weekly',
      day_of_week: 1,
      day_of_month: 1,
      time: '08:00',
      terminal: '',
      recipients: [''],
      format: 'pdf'
    })
    setEditingSchedule(null)
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (schedule) => {
    setFormData({
      name: schedule.name,
      frequency: schedule.frequency,
      day_of_week: schedule.day_of_week || 1,
      day_of_month: schedule.day_of_month || 1,
      time: schedule.time,
      terminal: schedule.terminal || '',
      recipients: schedule.recipients.length > 0 ? schedule.recipients : [''],
      format: schedule.format
    })
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Filter out empty recipients
    const validRecipients = formData.recipients.filter(r => r.trim() !== '')

    if (validRecipients.length === 0) {
      alert('Please add at least one recipient email')
      return
    }

    const payload = {
      ...formData,
      recipients: validRecipients,
      terminal: formData.terminal || null
    }

    try {
      const url = editingSchedule
        ? `/api/schedules/${editingSchedule.id}`
        : '/api/schedules'

      const response = await fetch(url, {
        method: editingSchedule ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        fetchSchedules()
        closeForm()
      } else {
        alert(data.error || 'Failed to save schedule')
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Error saving schedule')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchSchedules()
      } else {
        alert(data.error || 'Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Error deleting schedule')
    }
  }

  const handleToggleActive = async (schedule) => {
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !schedule.is_active })
      })

      const data = await response.json()

      if (data.success) {
        fetchSchedules()
      }
    } catch (error) {
      console.error('Error toggling schedule:', error)
    }
  }

  const handleSendTest = async (id) => {
    setSendingTest(id)

    try {
      const response = await fetch(`/api/schedules/${id}/test`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        alert('Test report sent successfully!')
        fetchSchedules()
      } else {
        alert(data.error || 'Failed to send test report')
      }
    } catch (error) {
      console.error('Error sending test:', error)
      alert('Error sending test report')
    } finally {
      setSendingTest(null)
    }
  }

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }))
  }

  const removeRecipient = (index) => {
    if (formData.recipients.length <= 1) return
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }))
  }

  const updateRecipient = (index, value) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r)
    }))
  }

  const formatFrequency = (schedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.time}`
      case 'weekly':
        const day = DAYS_OF_WEEK.find(d => d.value === schedule.day_of_week)
        return `${day?.label || 'Monday'}s at ${schedule.time}`
      case 'monthly':
        return `${schedule.day_of_month}${getOrdinalSuffix(schedule.day_of_month)} of month at ${schedule.time}`
      default:
        return schedule.frequency
    }
  }

  const getOrdinalSuffix = (n) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const formatLastRun = (schedule) => {
    if (!schedule.last_run_at) return 'Never'
    const date = new Date(schedule.last_run_at)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-white/80 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Calendar className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-lg font-semibold text-white">Report Scheduler</h1>
                <p className="text-xs text-white/70">Automated Report Delivery</p>
              </div>
            </div>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Schedule</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {schedules.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Scheduled Reports</h3>
            <p className="text-gray-500 mb-4">Create a schedule to automatically receive forklift inspection reports via email.</p>
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(schedule => (
              <div
                key={schedule.id}
                className={`bg-white rounded-xl p-4 shadow ${!schedule.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{schedule.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatFrequency(schedule)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(schedule)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        schedule.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{schedule.terminal || 'All Terminals'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    {schedule.format === 'pdf' && <FileText className="w-4 h-4 text-gray-400" />}
                    {schedule.format === 'excel' && <Table className="w-4 h-4 text-gray-400" />}
                    {schedule.format === 'both' && <FileText className="w-4 h-4 text-gray-400" />}
                    <span className="capitalize">{schedule.format === 'both' ? 'PDF & Excel' : schedule.format.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{schedule.recipients.length} recipient(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    {schedule.last_run_status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {schedule.last_run_status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                    {!schedule.last_run_status && <Clock className="w-4 h-4 text-gray-400" />}
                    <span>Last: {formatLastRun(schedule)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleSendTest(schedule.id)}
                    disabled={sendingTest === schedule.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {sendingTest === schedule.id ? 'Sending...' : 'Send Now'}
                  </button>
                  <button
                    onClick={() => openEditForm(schedule)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingSchedule ? 'Edit Schedule' : 'New Schedule'}
              </h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Schedule Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Weekly Safety Report"
                  required
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Day Selection (for weekly/monthly) */}
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Month *
                  </label>
                  <select
                    value={formData.day_of_month}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_month: parseInt(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time (Central Time) *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Terminal Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terminal (optional)
                </label>
                <select
                  value={formData.terminal}
                  onChange={(e) => setFormData(prev => ({ ...prev, terminal: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All Terminals</option>
                  {TERMINALS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Format *
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'pdf', label: 'PDF', icon: FileText },
                    { value: 'excel', label: 'Excel', icon: Table },
                    { value: 'both', label: 'Both', icon: FileText }
                  ].map(option => (
                    <label key={option.value} className="flex-1">
                      <input
                        type="radio"
                        name="format"
                        value={option.value}
                        checked={formData.format === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                        className="sr-only peer"
                      />
                      <div className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                        <option.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients *
                </label>
                <div className="space-y-2">
                  {formData.recipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2"
                        placeholder="email@example.com"
                      />
                      {formData.recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRecipient}
                  className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipient
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportScheduler
