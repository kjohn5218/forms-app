import { useState, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Camera, X, AlertTriangle } from 'lucide-react'
import {
  FormHeader,
  FormContainer,
  FormSection,
  TextInput,
  SelectInput,
  DateInput,
  TextArea,
  RadioGroup,
  PhotoUpload,
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

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

// Inspection Item with Photo Prompt on Fail
const InspectionItemWithPhoto = ({ item, register, control, itemPhotos, setItemPhotos }) => {
  const inputRef = useRef(null)
  const fieldValue = useWatch({ control, name: `inspection.${item.name}` })
  const isFailed = fieldValue === 'Fail'
  const photos = itemPhotos[item.name] || []

  const handlePhotoCapture = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (photos.length >= 3) return
      const reader = new FileReader()
      reader.onloadend = () => {
        setItemPhotos(prev => ({
          ...prev,
          [item.name]: [...(prev[item.name] || []), reader.result].slice(0, 3)
        }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index) => {
    setItemPhotos(prev => ({
      ...prev,
      [item.name]: (prev[item.name] || []).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className={`py-3 border-b border-gray-200 ${isFailed ? 'bg-red-50 -mx-4 px-4' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 flex-1 pr-4">{item.label}</span>
        <div className="flex gap-2">
          {['Pass', 'Fail', 'N/A'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                {...register(`inspection.${item.name}`, { required: 'Selection required' })}
                value={option}
                className="sr-only peer"
              />
              <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
                ${option === 'Pass' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
                ${option === 'Fail' ? 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 hover:bg-red-50' : ''}
                ${option === 'N/A' ? 'peer-checked:bg-gray-500 peer-checked:text-white peer-checked:border-gray-500 hover:bg-gray-50' : ''}
                border-gray-300 text-gray-600
              `}>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Photo prompt when failed */}
      {isFailed && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Photo required for failed item</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          {photos.length < 3 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="text-sm">Take Photo of Issue ({photos.length}/3)</span>
            </button>
          )}
          {photos.length > 0 && (
            <div className="mt-2 flex gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  <img src={photo} alt={`Issue ${idx + 1}`} className="h-16 w-16 object-cover rounded-lg border border-red-300" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ForkliftInspection = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [itemPhotos, setItemPhotos] = useState({}) // Photos per failed item
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const onSubmit = async (data) => {
    if (!signature) {
      alert('Please provide your signature')
      return
    }

    // Check if any failed items are missing photos
    const failedItemsWithoutPhotos = Object.entries(data.inspection || {})
      .filter(([key, value]) => value === 'Fail' && (!itemPhotos[key] || itemPhotos[key].length === 0))
      .map(([key]) => INSPECTION_ITEMS.find(i => i.name === key)?.label || key)

    if (failedItemsWithoutPhotos.length > 0) {
      alert(`Please take photos of the following failed items:\n\n${failedItemsWithoutPhotos.join('\n')}`)
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('FLI')

    const formData = {
      ...data,
      photos,
      itemPhotos, // Photos associated with specific failed items
      signature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/forklift-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Forklift Inspection' }
        })
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <FormHeader title="Forklift Inspection" gradient="from-orange-500 to-orange-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Basic Information">
          <DateInput
            label="Date"
            name="date"
            register={register}
            errors={errors}
            required
            defaultValue={getTodayDate()}
          />
          <SelectInput
            label="Terminal"
            name="terminal"
            register={register}
            errors={errors}
            options={TERMINALS}
            required
          />
          <TextInput
            label="Operator Name"
            name="operatorName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Forklift Number/ID"
            name="forkliftId"
            register={register}
            errors={errors}
            required
          />
          <SelectInput
            label="Shift"
            name="shift"
            register={register}
            errors={errors}
            options={['Day', 'Night']}
            required
          />
          <TextInput
            label="Hour Meter Reading"
            name="hourMeter"
            type="number"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Inspection Checklist">
          <p className="text-sm text-gray-500 mb-4">Mark each item as Pass, Fail, or N/A. Photos are required for failed items.</p>
          <div className="bg-white rounded-lg p-4">
            {INSPECTION_ITEMS.map(item => (
              <InspectionItemWithPhoto
                key={item.name}
                item={item}
                register={register}
                control={control}
                itemPhotos={itemPhotos}
                setItemPhotos={setItemPhotos}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Additional Information">
          <TextArea
            label="Defects Found"
            name="defectsFound"
            register={register}
            errors={errors}
            placeholder="Describe any defects found during inspection..."
            rows={4}
          />

          <PhotoUpload
            label="Photos"
            name="photos"
            photos={photos}
            setPhotos={setPhotos}
            maxPhotos={6}
          />

          <RadioGroup
            label="Forklift Safe to Operate?"
            name="safeToOperate"
            register={register}
            errors={errors}
            options={['Yes', 'No']}
            required
          />
        </FormSection>

        <FormSection title="Signature">
          <SignaturePad
            label="Operator Signature"
            signature={signature}
            setSignature={setSignature}
            required
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default ForkliftInspection
