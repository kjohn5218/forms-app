import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Home, FileText } from 'lucide-react'

const Success = () => {
  const location = useLocation()
  const { submissionId, formType } = location.state || {}

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Submitted!</h1>
          <p className="text-gray-600">Your submission has been received successfully.</p>
        </div>

        {submissionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Submission ID</p>
            <p className="text-lg font-mono font-bold text-ccfs-primary">{submissionId}</p>
          </div>
        )}

        {formType && (
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <FileText className="w-5 h-5" />
            <span>{formType}</span>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 bg-ccfs-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          A confirmation email has been sent to the safety team.
        </p>
      </div>
    </div>
  )
}

export default Success
