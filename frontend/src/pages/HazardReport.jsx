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
  Checkbox,
  PhotoUpload,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  getCurrentTime,
  generateFormId
} from '../components/FormComponents'

const HAZARD_TYPES = ['Hazard', 'Near Miss']

const HAZARD_CATEGORIES = [
  'Slip/Trip/Fall',
  'Struck By/Against',
  'Caught In/Between',
  'Electrical',
  'Fire',
  'Chemical',
  'Ergonomic',
  'Vehicle/Equipment',
  'Environmental',
  'Security',
  'Other'
]

const SEVERITY_LEVELS = [
  'Minor',
  'Moderate',
  'Serious',
  'Catastrophic'
]

const FREQUENCY_LEVELS = [
  'Rare',
  'Occasional',
  'Frequent',
  'Continuous'
]

const HazardReport = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      dateReported: getTodayDate(),
      dateOfObservation: getTodayDate(),
      timeOfObservation: getCurrentTime()
    }
  })

  const isAnonymous = watch('anonymousReport')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('HAZ')

    const formData = {
      ...data,
      photos,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/hazard-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Hazard Report' }
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
      <FormHeader title="Report a Hazard" gradient="from-yellow-500 to-yellow-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Reporter Information">
          <DateInput
            label="Date Reported"
            name="dateReported"
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
            label="Reporter Name"
            name="reporterName"
            register={register}
            errors={errors}
            required
            placeholder={isAnonymous ? 'Anonymous' : 'Enter your name'}
            disabled={isAnonymous}
          />
          <Checkbox
            label="Submit Anonymously"
            name="anonymousReport"
            register={register}
          />
          {!isAnonymous && (
            <TextInput
              label="Reporter Contact (Email/Phone)"
              name="reporterContact"
              register={register}
              errors={errors}
              placeholder="Email or phone number"
            />
          )}
        </FormSection>

        <FormSection title="Hazard/Near Miss Information">
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Date of Observation"
              name="dateOfObservation"
              register={register}
              errors={errors}
              required
              defaultValue={getTodayDate()}
            />
            <TimeInput
              label="Time of Observation"
              name="timeOfObservation"
              register={register}
              errors={errors}
              required
              defaultValue={getCurrentTime()}
            />
          </div>
          <TextInput
            label="Location"
            name="location"
            register={register}
            errors={errors}
            required
            placeholder="Specific location of the hazard"
          />
          <RadioGroup
            label="Type"
            name="hazardType"
            register={register}
            errors={errors}
            options={HAZARD_TYPES}
            required
          />
          <SelectInput
            label="Hazard Category"
            name="hazardCategory"
            register={register}
            errors={errors}
            options={HAZARD_CATEGORIES}
            required
          />
        </FormSection>

        <FormSection title="Details">
          <TextArea
            label="Description"
            name="description"
            register={register}
            errors={errors}
            required
            minLength={25}
            placeholder="Describe the hazard or near miss in detail (minimum 25 characters)..."
            rows={4}
          />
          <TextArea
            label="Who/What was at risk?"
            name="whoAtRisk"
            register={register}
            errors={errors}
            placeholder="Who or what could have been harmed?"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Potential Severity"
              name="potentialSeverity"
              register={register}
              errors={errors}
              options={SEVERITY_LEVELS}
            />
            <SelectInput
              label="Frequency of Exposure"
              name="frequencyOfExposure"
              register={register}
              errors={errors}
              options={FREQUENCY_LEVELS}
            />
          </div>
          <TextArea
            label="Immediate Actions Taken"
            name="immediateActions"
            register={register}
            errors={errors}
            placeholder="What actions were taken immediately, if any?"
            rows={3}
          />
        </FormSection>

        <FormSection title="Recommendations">
          <TextArea
            label="Suggested Corrective Action"
            name="suggestedCorrectiveAction"
            register={register}
            errors={errors}
            required
            placeholder="What corrective action would you recommend?"
            rows={4}
          />
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

export default HazardReport
