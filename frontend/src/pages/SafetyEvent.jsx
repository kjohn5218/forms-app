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

const EVENT_TYPES = [
  'Injury',
  'Near Miss',
  'Property Damage',
  'Vehicle Accident',
  'Environmental',
  'Security',
  'Other'
]

const CONTRIBUTING_FACTORS = [
  'Equipment',
  'Training',
  'Procedure',
  'Environment',
  'Human Error',
  'Other'
]

const SafetyEvent = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      dateOfEvent: getTodayDate(),
      timeOfEvent: getCurrentTime()
    }
  })

  const eventType = watch('eventType')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('SAF')

    const formData = {
      ...data,
      photos,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/safety-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Safety Event Report' }
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
      <FormHeader title="Safety Event Report" gradient="from-red-500 to-red-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Event Information">
          <DateInput
            label="Date of Event"
            name="dateOfEvent"
            register={register}
            errors={errors}
            required
            defaultValue={getTodayDate()}
          />
          <TimeInput
            label="Time of Event"
            name="timeOfEvent"
            register={register}
            errors={errors}
            required
            defaultValue={getCurrentTime()}
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
          />
          <TextInput
            label="Reporter Email"
            name="reporterEmail"
            type="email"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Event Type">
          <RadioGroup
            label="Type of Event"
            name="eventType"
            register={register}
            errors={errors}
            options={EVENT_TYPES}
            required
          />
        </FormSection>

        <FormSection title="Event Details">
          <TextInput
            label="Location within facility"
            name="locationWithinFacility"
            register={register}
            errors={errors}
            required
            placeholder="e.g., Loading Dock 3, Warehouse Aisle B"
          />
          <TextArea
            label="Description of Event"
            name="eventDescription"
            register={register}
            errors={errors}
            required
            minLength={50}
            placeholder="Please provide a detailed description of the event (minimum 50 characters)..."
            rows={5}
          />
          <TextArea
            label="Immediate Actions Taken"
            name="immediateActions"
            register={register}
            errors={errors}
            required
            placeholder="What actions were taken immediately after the event?"
            rows={3}
          />
          <TextArea
            label="Witnesses"
            name="witnesses"
            register={register}
            errors={errors}
            placeholder="List any witnesses (names and contact info if available)"
            rows={2}
          />
          <PhotoUpload
            label="Photos"
            name="photos"
            photos={photos}
            setPhotos={setPhotos}
            maxPhotos={10}
          />
        </FormSection>

        {eventType === 'Injury' && (
          <FormSection title="Injury Details">
            <TextInput
              label="Injured Person Name"
              name="injuredPersonName"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Body Part Affected"
              name="bodyPartAffected"
              register={register}
              errors={errors}
              placeholder="e.g., Left hand, Lower back"
            />
            <TextInput
              label="Nature of Injury"
              name="natureOfInjury"
              register={register}
              errors={errors}
              placeholder="e.g., Cut, Bruise, Strain"
            />
            <RadioGroup
              label="First Aid Provided?"
              name="firstAidProvided"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
            <RadioGroup
              label="Medical Treatment Required?"
              name="medicalTreatmentRequired"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
          </FormSection>
        )}

        <FormSection title="Root Cause Analysis">
          <CheckboxGroup
            label="Contributing Factors"
            name="contributingFactors"
            register={register}
            options={CONTRIBUTING_FACTORS}
          />
          <TextArea
            label="Recommended Corrective Actions"
            name="correctiveActions"
            register={register}
            errors={errors}
            placeholder="What corrective actions would you recommend to prevent this from happening again?"
            rows={4}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default SafetyEvent
