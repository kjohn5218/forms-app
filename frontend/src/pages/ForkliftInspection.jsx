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
  TextArea,
  RadioGroup,
  InspectionItem,
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

const ForkliftInspection = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const onSubmit = async (data) => {
    if (!signature) {
      alert('Please provide your signature')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('FLI')

    const formData = {
      ...data,
      photos,
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
          <p className="text-sm text-gray-500 mb-4">Mark each item as Pass, Fail, or N/A</p>
          <div className="bg-white rounded-lg p-4">
            {INSPECTION_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`inspection.${item.name}`}
                register={register}
                errors={errors}
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
