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
  RatingItem,
  PhotoUpload,
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const INSPECTION_TYPES = [
  'Monthly',
  'Quarterly',
  'Annual',
  'Special'
]

const EXTERIOR_ITEMS = [
  { name: 'parkingLot', label: 'Parking Lot Condition' },
  { name: 'exteriorLighting', label: 'Exterior Lighting' },
  { name: 'fencingGates', label: 'Fencing and Gates' },
  { name: 'signage', label: 'Signage' },
  { name: 'landscaping', label: 'Landscaping' },
  { name: 'dockDoors', label: 'Dock Doors' },
  { name: 'loadingDocks', label: 'Loading Docks' }
]

const DOCK_ITEMS = [
  { name: 'dockFloor', label: 'Floor Condition' },
  { name: 'dockLighting', label: 'Lighting' },
  { name: 'fireExtinguishers', label: 'Fire Extinguishers' },
  { name: 'emergencyExits', label: 'Emergency Exits' },
  { name: 'aisleMarkings', label: 'Aisle Markings' },
  { name: 'storageOrganization', label: 'Storage Organization' },
  { name: 'rackingCondition', label: 'Racking Condition' }
]

const OFFICE_ITEMS = [
  { name: 'officeCleanliness', label: 'Cleanliness' },
  { name: 'officeLighting', label: 'Lighting' },
  { name: 'hvacFunction', label: 'HVAC Function' },
  { name: 'restrooms', label: 'Restrooms' },
  { name: 'breakRoom', label: 'Break Room' },
  { name: 'firstAidStation', label: 'First Aid Station' }
]

const SAFETY_ITEMS = [
  { name: 'eyeWashStations', label: 'Eye Wash Stations' },
  { name: 'fireSuppressionSystem', label: 'Fire Suppression System' },
  { name: 'spillKits', label: 'Spill Kits' },
  { name: 'ppeAvailability', label: 'PPE Availability' },
  { name: 'aed', label: 'AED (if applicable)' }
]

const SECURITY_ITEMS = [
  { name: 'cameraSystems', label: 'Camera Systems' },
  { name: 'accessControl', label: 'Access Control' },
  { name: 'alarmSystem', label: 'Alarm System' },
  { name: 'visitorLog', label: 'Visitor Log' }
]

const TerminalInspection = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      inspectionDate: getTodayDate()
    }
  })

  const onSubmit = async (data) => {
    if (!signature) {
      alert('Please provide your signature')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('TRM')

    const formData = {
      ...data,
      photos,
      signature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/terminal-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Terminal Inspection' }
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
      <FormHeader title="Terminal Inspection" gradient="from-teal-500 to-teal-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Inspection Information">
          <DateInput
            label="Inspection Date"
            name="inspectionDate"
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
            label="Inspector Name"
            name="inspectorName"
            register={register}
            errors={errors}
            required
          />
          <SelectInput
            label="Inspection Type"
            name="inspectionType"
            register={register}
            errors={errors}
            options={INSPECTION_TYPES}
            required
          />
        </FormSection>

        <FormSection title="Exterior">
          <div className="bg-white rounded-lg p-4">
            {EXTERIOR_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`exterior.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
          <TextArea
            label="Exterior Comments/Deficiencies"
            name="exteriorComments"
            register={register}
            errors={errors}
            placeholder="Note any issues..."
            rows={3}
          />
        </FormSection>

        <FormSection title="Interior - Dock">
          <div className="bg-white rounded-lg p-4">
            {DOCK_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`dock.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
          <TextArea
            label="Dock Comments/Deficiencies"
            name="dockComments"
            register={register}
            errors={errors}
            placeholder="Note any issues..."
            rows={3}
          />
        </FormSection>

        <FormSection title="Interior - Office">
          <div className="bg-white rounded-lg p-4">
            {OFFICE_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`office.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
          <TextArea
            label="Office Comments/Deficiencies"
            name="officeComments"
            register={register}
            errors={errors}
            placeholder="Note any issues..."
            rows={3}
          />
        </FormSection>

        <FormSection title="Safety Equipment">
          <div className="bg-white rounded-lg p-4">
            {SAFETY_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`safety.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
          <TextArea
            label="Safety Comments/Deficiencies"
            name="safetyComments"
            register={register}
            errors={errors}
            placeholder="Note any issues..."
            rows={3}
          />
        </FormSection>

        <FormSection title="Security">
          <div className="bg-white rounded-lg p-4">
            {SECURITY_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`security.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
          <TextArea
            label="Security Comments/Deficiencies"
            name="securityComments"
            register={register}
            errors={errors}
            placeholder="Note any issues..."
            rows={3}
          />
        </FormSection>

        <FormSection title="Photos & Signature">
          <PhotoUpload
            label="Photos"
            name="photos"
            photos={photos}
            setPhotos={setPhotos}
            maxPhotos={20}
          />
          <SignaturePad
            label="Inspector Signature"
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

export default TerminalInspection
