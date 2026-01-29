import { useState, useRef, useEffect } from 'react'
import { Camera, X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

// Terminal locations for all forms
export const TERMINALS = [
  'ABQ', 'BIL', 'BIS', 'BOI', 'BTM', 'BYI', 'BZN', 'CPR', 'DEN', 'DFW',
  'DIK', 'DRO', 'DSM', 'DUL', 'ELP', 'FAR', 'GAR', 'GFK', 'GJT', 'GRI',
  'GTF', 'HAY', 'HLN', 'HOU', 'IDA', 'KCY', 'KSP', 'LAS', 'MOT', 'MSO',
  'MSP', 'NCS', 'NPL', 'OMA', 'PHX', 'PIE', 'PUB', 'RNO', 'ROW', 'RPC',
  'SAL', 'SAT', 'SCB', 'SGF', 'SGU', 'SLC', 'STL', 'SXF', 'TUS', 'WIC', 'WTT'
]

// US States for fuel card receipt form
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

// Generate unique form ID
export const generateFormId = (prefix) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${id}`
}

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Get current time in HH:MM format
export const getCurrentTime = () => {
  return new Date().toTimeString().slice(0, 5)
}

// Form Header Component
export const FormHeader = ({ title, gradient = 'from-blue-600 to-blue-700' }) => (
  <header className="bg-blue-600 text-white sticky top-0 z-10 shadow-sm">
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-center h-14 gap-3">
        <Link to="/" className="p-2 hover:bg-blue-500 rounded-md transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-3">
          <img src="/ccfs-logo-white.png" alt="CCFS Logo" className="h-8" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
    </div>
  </header>
)

// Text Input Component
export const TextInput = ({
  label,
  name,
  register,
  errors,
  required,
  type = 'text',
  placeholder,
  maxLength,
  disabled,
  validation = {}
}) => {
  const rules = {
    required: required ? `${label} is required` : false,
    ...validation
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name, rules)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ccfs-primary focus:border-transparent ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )
}

// Select Input Component
export const SelectInput = ({
  label,
  name,
  register,
  errors,
  options,
  required,
  placeholder = 'Select...'
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name, { required: required ? `${label} is required` : false })}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ccfs-primary focus:border-transparent ${
        errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value !== undefined ? opt.value : opt} value={opt.value !== undefined ? opt.value : opt}>
          {opt.label !== undefined ? opt.label : opt}
        </option>
      ))}
    </select>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
  </div>
)

// Date Input Component
export const DateInput = ({ label, name, register, errors, required, defaultValue }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="date"
      defaultValue={defaultValue}
      {...register(name, { required: required ? `${label} is required` : false })}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ccfs-primary focus:border-transparent ${
        errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
  </div>
)

// Time Input Component
export const TimeInput = ({ label, name, register, errors, required, defaultValue }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="time"
      defaultValue={defaultValue}
      {...register(name, { required: required ? `${label} is required` : false })}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ccfs-primary focus:border-transparent ${
        errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
  </div>
)

// Text Area Component
export const TextArea = ({
  label,
  name,
  register,
  errors,
  required,
  rows = 4,
  placeholder,
  maxLength,
  minLength,
  validation = {}
}) => {
  const rules = {
    required: required ? `${label} is required` : false,
    minLength: minLength ? { value: minLength, message: `${label} must be at least ${minLength} characters` } : undefined,
    ...validation
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...register(name, rules)}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ccfs-primary focus:border-transparent ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {maxLength && (
        <p className="text-xs text-gray-400 mt-1">Max {maxLength} characters</p>
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )
}

// Radio Group Component
export const RadioGroup = ({ label, name, register, errors, options, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="space-y-2">
      {options.map(option => (
        <label key={option.value !== undefined ? option.value : option} className="flex items-center p-2 bg-gray-50 rounded-lg">
          <input
            type="radio"
            {...register(name, { required: required ? `${label} is required` : false })}
            value={option.value !== undefined ? option.value : option}
            className="mr-3 w-5 h-5 text-ccfs-primary focus:ring-ccfs-primary"
          />
          <span className="text-gray-700">{option.label !== undefined ? option.label : option}</span>
        </label>
      ))}
    </div>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
  </div>
)

// Checkbox Group Component
export const CheckboxGroup = ({ label, name, register, options, required, errors }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="space-y-2">
      {options.map(option => (
        <label key={option.value !== undefined ? option.value : option} className="flex items-center p-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            {...register(name)}
            value={option.value !== undefined ? option.value : option}
            className="mr-3 w-5 h-5 rounded text-ccfs-primary focus:ring-ccfs-primary"
          />
          <span className="text-gray-700">{option.label !== undefined ? option.label : option}</span>
        </label>
      ))}
    </div>
    {errors && errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
  </div>
)

// Single Checkbox Component
export const Checkbox = ({ label, name, register }) => (
  <div className="mb-4">
    <label className="flex items-center p-2 bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        {...register(name)}
        className="mr-3 w-5 h-5 rounded text-ccfs-primary focus:ring-ccfs-primary"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  </div>
)

// Inspection Item Component (Pass/Fail/NA)
export const InspectionItem = ({ label, name, register, errors, options = ['Pass', 'Fail', 'N/A'], required = true }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200">
    <span className="text-sm text-gray-700 flex-1 pr-4">{label}</span>
    <div className="flex gap-2">
      {options.map(option => (
        <label key={option} className="flex items-center">
          <input
            type="radio"
            {...register(name, { required: required ? 'Selection required' : false })}
            value={option}
            className="sr-only peer"
          />
          <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
            ${option === 'Pass' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
            ${option === 'Fail' ? 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 hover:bg-red-50' : ''}
            ${option === 'N/A' ? 'peer-checked:bg-gray-500 peer-checked:text-white peer-checked:border-gray-500 hover:bg-gray-50' : ''}
            ${!['Pass', 'Fail', 'N/A'].includes(option) ? 'peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-blue-50' : ''}
            border-gray-300 text-gray-600
          `}>
            {option}
          </span>
        </label>
      ))}
    </div>
  </div>
)

// Rating Item Component (Good/Fair/Poor/NA)
export const RatingItem = ({ label, name, register, errors }) => (
  <InspectionItem
    label={label}
    name={name}
    register={register}
    errors={errors}
    options={['Good', 'Fair', 'Poor', 'N/A']}
  />
)

// Evaluation Item Component (Satisfactory/Needs Improvement/Unsatisfactory)
export const EvaluationItem = ({ label, name, register, errors }) => (
  <InspectionItem
    label={label}
    name={name}
    register={register}
    errors={errors}
    options={['Satisfactory', 'Needs Improvement', 'Unsatisfactory']}
  />
)

// Training Item Component (Demonstrated/Needs Practice/Not Demonstrated)
export const TrainingItem = ({ label, name, register, errors }) => (
  <InspectionItem
    label={label}
    name={name}
    register={register}
    errors={errors}
    options={['Demonstrated', 'Needs Practice', 'Not Demonstrated']}
  />
)

// Yes/No Item Component
export const YesNoItem = ({ label, name, register, errors }) => (
  <InspectionItem
    label={label}
    name={name}
    register={register}
    errors={errors}
    options={['Yes', 'No', 'N/A']}
  />
)

// Photo Upload Component
export const PhotoUpload = ({ label, name, photos, setPhotos, required, maxPhotos = 6 }) => {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (photos.length >= maxPhotos) return
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result].slice(0, maxPhotos))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        <span className="text-gray-400 ml-2">({photos.length}/{maxPhotos})</span>
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-ccfs-primary transition-colors"
        >
          <div className="text-center">
            <Camera className="mx-auto h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">Tap to take photo</span>
          </div>
        </button>
      )}
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative">
              <img src={photo} alt={`Photo ${idx + 1}`} className="h-24 w-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Signature Pad Component
export const SignaturePad = ({ label, signature, setSignature, required }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      ctx.scale(2, 2)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
    }
  }, [])

  const getPosition = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPosition(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    if (isDrawing && hasDrawn) {
      const canvas = canvasRef.current
      setSignature(canvas.toDataURL())
    }
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature('')
    setHasDrawn(false)
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button
        type="button"
        onClick={clearSignature}
        className="text-sm text-ccfs-primary mt-2 hover:underline"
      >
        Clear Signature
      </button>
    </div>
  )
}

// Form Section Component
export const FormSection = ({ title, children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
    )}
    {children}
  </div>
)

// Form Navigation Component (for multi-page forms)
export const FormNavigation = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  isSubmitting,
  canSubmit
}) => (
  <div className="flex justify-between items-center mt-6 pt-4 border-t">
    <button
      type="button"
      onClick={onPrevious}
      disabled={currentPage === 1}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 min-w-[100px]"
    >
      Previous
    </button>
    <span className="text-sm text-gray-500">
      Page {currentPage} of {totalPages}
    </span>
    {canSubmit ? (
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 bg-ccfs-primary text-white rounded-lg disabled:opacity-50 min-w-[100px]"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    ) : (
      <button
        type="button"
        onClick={onNext}
        className="px-4 py-2 bg-ccfs-primary text-white rounded-lg min-w-[100px]"
      >
        Next
      </button>
    )}
  </div>
)

// Info Banner Component
export const InfoBanner = ({ children, type = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  return (
    <div className={`p-3 rounded-lg border mb-4 ${styles[type]}`}>
      {children}
    </div>
  )
}

// Submit Button Component
export const SubmitButton = ({ isSubmitting, label = 'Submit Form' }) => (
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full py-3 bg-ccfs-primary text-white font-semibold rounded-lg disabled:opacity-50 transition-colors hover:bg-opacity-90"
  >
    {isSubmitting ? 'Submitting...' : label}
  </button>
)

// Form Container Component
export const FormContainer = ({ children, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-4 pb-8">
    {children}
  </form>
)
