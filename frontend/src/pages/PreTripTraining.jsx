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
  TrainingItem,
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const TRAINING_TYPES = [
  'New Hire',
  'Refresher',
  'Upgrade',
  'Remedial'
]

const VEHICLE_TYPES = [
  'Day Cab',
  'Sleeper',
  'Straight Truck'
]

const PRE_TRIP_ITEMS = [
  { name: 'engineCompartment', label: 'Engine compartment check' },
  { name: 'cabInspection', label: 'Cab inspection' },
  { name: 'couplingSystem', label: 'Coupling system' },
  { name: 'cargoArea', label: 'Cargo area/trailer' },
  { name: 'lightsReflectors', label: 'Lights and reflectors' },
  { name: 'brakes', label: 'Brakes' },
  { name: 'wheelsTires', label: 'Wheels and tires' },
  { name: 'suspension', label: 'Suspension' },
  { name: 'exhaustSystem', label: 'Exhaust system' },
  { name: 'steeringComponents', label: 'Steering components' }
]

const DRIVING_SKILLS_ITEMS = [
  { name: 'vehicleControl', label: 'Vehicle control' },
  { name: 'shifting', label: 'Shifting (if manual)' },
  { name: 'backingStraight', label: 'Backing - straight line' },
  { name: 'backingOffset', label: 'Backing - offset' },
  { name: 'backing90', label: 'Backing - 90 degree' },
  { name: 'dockingProcedures', label: 'Docking procedures' },
  { name: 'couplingUncoupling', label: 'Coupling/uncoupling' },
  { name: 'cityDriving', label: 'City driving' },
  { name: 'highwayDriving', label: 'Highway driving' },
  { name: 'defensiveDriving', label: 'Defensive driving techniques' }
]

const KNOWLEDGE_ITEMS = [
  { name: 'hosRules', label: 'Hours of Service rules' },
  { name: 'eldOperation', label: 'ELD operation' },
  { name: 'hazmatBasics', label: 'Hazmat basics (if applicable)' },
  { name: 'accidentProcedures', label: 'Accident procedures' },
  { name: 'companyPolicies', label: 'Company policies' }
]

const READY_OPTIONS = [
  'Yes',
  'No',
  'Additional Training Needed'
]

const PreTripTraining = () => {
  const navigate = useNavigate()
  const [traineeSignature, setTraineeSignature] = useState('')
  const [trainerSignature, setTrainerSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const readyForSolo = watch('readyForSolo')

  const onSubmit = async (data) => {
    if (!traineeSignature || !trainerSignature) {
      alert('Both trainee and trainer signatures are required')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('PTT')

    const formData = {
      ...data,
      traineeSignature,
      trainerSignature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/pre-trip-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Pre-Trip Training' }
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
      <FormHeader title="Pre-Trip Training" gradient="from-violet-500 to-violet-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Trainee Information">
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
            label="Trainee Name"
            name="traineeName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Trainee Employee ID"
            name="traineeEmployeeId"
            register={register}
            errors={errors}
            required
          />
          <SelectInput
            label="Training Type"
            name="trainingType"
            register={register}
            errors={errors}
            options={TRAINING_TYPES}
            required
          />
        </FormSection>

        <FormSection title="Trainer Information">
          <TextInput
            label="Trainer Name"
            name="trainerName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Trainer Employee ID"
            name="trainerEmployeeId"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Vehicle Information">
          <TextInput
            label="Truck Number"
            name="truckNumber"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Trailer Number"
            name="trailerNumber"
            register={register}
            errors={errors}
          />
          <SelectInput
            label="Vehicle Type"
            name="vehicleType"
            register={register}
            errors={errors}
            options={VEHICLE_TYPES}
            required
          />
        </FormSection>

        <FormSection title="Pre-Trip Inspection Training">
          <p className="text-sm text-gray-500 mb-4">Mark each item: Demonstrated, Needs Practice, or Not Demonstrated</p>
          <div className="bg-white rounded-lg p-4">
            {PRE_TRIP_ITEMS.map(item => (
              <TrainingItem
                key={item.name}
                label={item.label}
                name={`preTripInspection.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Driving Skills">
          <div className="bg-white rounded-lg p-4">
            {DRIVING_SKILLS_ITEMS.map(item => (
              <TrainingItem
                key={item.name}
                label={item.label}
                name={`drivingSkills.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Knowledge Assessment">
          <div className="bg-white rounded-lg p-4">
            {KNOWLEDGE_ITEMS.map(item => (
              <TrainingItem
                key={item.name}
                label={item.label}
                name={`knowledge.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Evaluation Results">
          <TextInput
            label="Overall Score (%)"
            name="overallScore"
            type="number"
            register={register}
            errors={errors}
            validation={{
              min: { value: 0, message: 'Score must be 0-100' },
              max: { value: 100, message: 'Score must be 0-100' }
            }}
          />
          <RadioGroup
            label="Ready for Solo Driving?"
            name="readyForSolo"
            register={register}
            errors={errors}
            options={READY_OPTIONS}
            required
          />
          <TextArea
            label="Areas Requiring Additional Training"
            name="additionalTrainingAreas"
            register={register}
            errors={errors}
            placeholder="List any areas needing more training..."
            rows={3}
          />
          <TextArea
            label="Trainer Comments"
            name="trainerComments"
            register={register}
            errors={errors}
            placeholder="Additional comments..."
            rows={3}
          />
          {(readyForSolo === 'No' || readyForSolo === 'Additional Training Needed') && (
            <DateInput
              label="Recommended Follow-up Date"
              name="followUpDate"
              register={register}
              errors={errors}
            />
          )}
        </FormSection>

        <FormSection title="Signatures">
          <SignaturePad
            label="Trainee Signature"
            signature={traineeSignature}
            setSignature={setTraineeSignature}
            required
          />
          <SignaturePad
            label="Trainer Signature"
            signature={trainerSignature}
            setSignature={setTrainerSignature}
            required
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default PreTripTraining
