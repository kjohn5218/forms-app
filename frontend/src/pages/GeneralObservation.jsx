import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  FormHeader,
  FormContainer,
  FormSection,
  TextInput,
  SelectInput,
  DateInput,
  TimeInput,
  TextArea,
  RadioGroup,
  CheckboxGroup,
  PhotoUpload,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  getCurrentTime,
  generateFormId
} from '../components/FormComponents'

const OBSERVATION_TYPES = [
  { value: 'unsafe_act', label: 'Unsafe Act' },
  { value: 'unsafe_condition', label: 'Unsafe Condition' },
  { value: 'safe_behavior', label: 'Safe Behavior Recognition' },
  { value: 'environmental', label: 'Environmental Concern' },
  { value: 'security', label: 'Security Issue' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'ppe_compliance', label: 'PPE Compliance' },
  { value: 'ergonomics', label: 'Ergonomics' },
  { value: 'fire_safety', label: 'Fire Safety' },
  { value: 'electrical_safety', label: 'Electrical Safety' },
  { value: 'chemical_safety', label: 'Chemical Safety' },
  { value: 'loading_unloading', label: 'Loading/Unloading' },
  { value: 'dock_operations', label: 'Dock Operations' },
  { value: 'vehicle_equipment', label: 'Vehicle/Equipment' }
]

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical']

const PPE_TYPES = [
  'Hard Hat',
  'Safety Glasses',
  'Steel Toe Boots',
  'High-Vis Vest',
  'Gloves',
  'Hearing Protection'
]

const GeneralObservation = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate(),
      time: getCurrentTime()
    }
  })

  const observationType = watch('observationType')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('OBS')

    const formData = {
      ...data,
      photos,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Observation Form' }
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
      <FormHeader title="General Observation" gradient="from-green-500 to-green-600" backTo="/observation-forms" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Observation Type">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {OBSERVATION_TYPES.map(type => (
              <label
                key={type.value}
                className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors text-sm text-center ${
                  observationType === type.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <input
                  type="radio"
                  {...register('observationType', { required: 'Please select an observation type' })}
                  value={type.value}
                  className="sr-only"
                />
                {type.label}
              </label>
            ))}
          </div>
          {errors.observationType && (
            <p className="text-red-500 text-xs">{errors.observationType.message}</p>
          )}
        </FormSection>

        <FormSection title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Date"
              name="date"
              register={register}
              errors={errors}
              required
              defaultValue={getTodayDate()}
            />
            <TimeInput
              label="Time"
              name="time"
              register={register}
              errors={errors}
              required
              defaultValue={getCurrentTime()}
            />
          </div>
          <SelectInput
            label="Terminal"
            name="terminal"
            register={register}
            errors={errors}
            options={TERMINALS}
            required
          />
          <TextInput
            label="Observer Name"
            name="observerName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Observer/Manager Email"
            name="observerEmail"
            register={register}
            errors={errors}
            required
            type="email"
            placeholder="email@ccfs.com"
          />
          <TextInput
            label="Location"
            name="location"
            register={register}
            errors={errors}
            required
            placeholder="Specific location of observation"
          />
        </FormSection>

        <FormSection title="Observation Details">
          <TextArea
            label="Description"
            name="description"
            register={register}
            errors={errors}
            required
            placeholder="Describe what you observed..."
            rows={4}
          />
          <SelectInput
            label="Immediate Risk Level"
            name="riskLevel"
            register={register}
            errors={errors}
            options={RISK_LEVELS}
            required
          />
          <TextArea
            label="Action Taken"
            name="actionTaken"
            register={register}
            errors={errors}
            placeholder="What action was taken, if any?"
            rows={3}
          />
          <RadioGroup
            label="Follow-up Required?"
            name="followUpRequired"
            register={register}
            errors={errors}
            options={['Yes', 'No']}
          />
        </FormSection>

        {/* Safe Behavior Recognition specific fields */}
        {observationType === 'safe_behavior' && (
          <FormSection title="Recognition Details">
            <TextInput
              label="Employee Name Being Recognized"
              name="recognizedEmployeeName"
              register={register}
              errors={errors}
            />
            <TextArea
              label="Specific Behavior Observed"
              name="specificBehavior"
              register={register}
              errors={errors}
              placeholder="Describe the safe behavior observed..."
              rows={3}
            />
            <TextArea
              label="Recommendation for Recognition"
              name="recognitionRecommendation"
              register={register}
              errors={errors}
              placeholder="What type of recognition would you recommend?"
              rows={2}
            />
          </FormSection>
        )}

        {/* PPE Compliance specific fields */}
        {observationType === 'ppe_compliance' && (
          <FormSection title="PPE Details">
            <CheckboxGroup
              label="PPE Type"
              name="ppeTypes"
              register={register}
              options={PPE_TYPES}
            />
            <RadioGroup
              label="Compliant?"
              name="ppeCompliant"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
          </FormSection>
        )}

        {/* Chemical Safety specific fields */}
        {observationType === 'chemical_safety' && (
          <FormSection title="Chemical Details">
            <TextInput
              label="Chemical Name/Type"
              name="chemicalName"
              register={register}
              errors={errors}
            />
            <RadioGroup
              label="SDS Available?"
              name="sdsAvailable"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
            <RadioGroup
              label="Proper Storage?"
              name="properStorage"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
          </FormSection>
        )}

        <FormSection title="Photos">
          <PhotoUpload
            label="Photos"
            name="photos"
            photos={photos}
            setPhotos={setPhotos}
            maxPhotos={6}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default GeneralObservation
