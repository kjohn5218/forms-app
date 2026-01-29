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
  EvaluationItem,
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  getCurrentTime,
  generateFormId
} from '../components/FormComponents'

const PRE_TRIP_ITEMS = [
  { name: 'uniformAppearance', label: 'Proper uniform and appearance' },
  { name: 'preTripInspection', label: 'Pre-trip inspection performed' },
  { name: 'paperworkComplete', label: 'Paperwork complete and organized' },
  { name: 'loadVerification', label: 'Load verification' },
  { name: 'securementCheck', label: 'Securement check' }
]

const DRIVING_ITEMS = [
  { name: 'mirrorUsage', label: 'Mirror usage' },
  { name: 'followingDistance', label: 'Following distance' },
  { name: 'speedManagement', label: 'Speed management' },
  { name: 'laneChanges', label: 'Lane changes' },
  { name: 'intersectionApproach', label: 'Intersection approach' },
  { name: 'backingManeuvers', label: 'Backing maneuvers' },
  { name: 'defensiveDriving', label: 'Defensive driving' },
  { name: 'useOfSignals', label: 'Use of signals' },
  { name: 'awarenessSurroundings', label: 'Awareness of surroundings' },
  { name: 'trafficLawCompliance', label: 'Compliance with traffic laws' },
  { name: 'hosCompliance', label: 'Hours of Service compliance' },
  { name: 'eldUsage', label: 'ELD usage' }
]

const CUSTOMER_ITEMS = [
  { name: 'professionalAppearance', label: 'Professional appearance' },
  { name: 'communicationSkills', label: 'Communication skills' },
  { name: 'deliveryProcedures', label: 'Delivery procedures' },
  { name: 'pickupProcedures', label: 'Pickup procedures' },
  { name: 'documentationAccuracy', label: 'Documentation accuracy' },
  { name: 'customerServiceAttitude', label: 'Customer service attitude' }
]

const DELIVERY_ITEMS = [
  { name: 'safeParking', label: 'Safe parking' },
  { name: 'properEquipmentUse', label: 'Proper use of equipment' },
  { name: 'loadHandling', label: 'Load handling' },
  { name: 'freightInspection', label: 'Freight inspection' },
  { name: 'paperworkCompletion', label: 'Paperwork completion' }
]

const OVERALL_RATINGS = [
  'Excellent',
  'Satisfactory',
  'Needs Improvement',
  'Unsatisfactory'
]

const DriverRideAlong = () => {
  const navigate = useNavigate()
  const [driverSignature, setDriverSignature] = useState('')
  const [evaluatorSignature, setEvaluatorSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate(),
      startTime: getCurrentTime()
    }
  })

  const onSubmit = async (data) => {
    if (!driverSignature || !evaluatorSignature) {
      alert('Both driver and evaluator signatures are required')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('DRA')

    const formData = {
      ...data,
      driverSignature,
      evaluatorSignature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/driver-ride-along', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Driver Ride Along' }
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
      <FormHeader title="Driver Ride Along" gradient="from-indigo-500 to-indigo-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Ride Along Information">
          <DateInput
            label="Date"
            name="date"
            register={register}
            errors={errors}
            required
            defaultValue={getTodayDate()}
          />
          <div className="grid grid-cols-2 gap-4">
            <TimeInput
              label="Start Time"
              name="startTime"
              register={register}
              errors={errors}
              required
              defaultValue={getCurrentTime()}
            />
            <TimeInput
              label="End Time"
              name="endTime"
              register={register}
              errors={errors}
              required
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
        </FormSection>

        <FormSection title="Driver Information">
          <TextInput
            label="Driver Name"
            name="driverName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Driver Employee ID"
            name="driverEmployeeId"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Years of Experience"
            name="yearsOfExperience"
            type="number"
            register={register}
            errors={errors}
          />
          <TextInput
            label="CDL Number"
            name="cdlNumber"
            register={register}
            errors={errors}
          />
          <DateInput
            label="CDL Expiration Date"
            name="cdlExpirationDate"
            register={register}
            errors={errors}
          />
        </FormSection>

        <FormSection title="Evaluator Information">
          <TextInput
            label="Evaluator Name"
            name="evaluatorName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Evaluator Title"
            name="evaluatorTitle"
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
          <TextInput
            label="Route/Destination"
            name="routeDestination"
            register={register}
            errors={errors}
          />
        </FormSection>

        <FormSection title="Pre-Trip Evaluation">
          <div className="bg-white rounded-lg p-4">
            {PRE_TRIP_ITEMS.map(item => (
              <EvaluationItem
                key={item.name}
                label={item.label}
                name={`preTrip.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Driving Evaluation">
          <div className="bg-white rounded-lg p-4">
            {DRIVING_ITEMS.map(item => (
              <EvaluationItem
                key={item.name}
                label={item.label}
                name={`driving.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Customer Interaction">
          <div className="bg-white rounded-lg p-4">
            {CUSTOMER_ITEMS.map(item => (
              <EvaluationItem
                key={item.name}
                label={item.label}
                name={`customer.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Delivery Evaluation">
          <div className="bg-white rounded-lg p-4">
            {DELIVERY_ITEMS.map(item => (
              <EvaluationItem
                key={item.name}
                label={item.label}
                name={`delivery.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Overall Assessment">
          <TextArea
            label="Strengths"
            name="strengths"
            register={register}
            errors={errors}
            placeholder="List driver's strengths..."
            rows={3}
          />
          <TextArea
            label="Areas for Improvement"
            name="areasForImprovement"
            register={register}
            errors={errors}
            placeholder="List areas needing improvement..."
            rows={3}
          />
          <TextArea
            label="Training Recommendations"
            name="trainingRecommendations"
            register={register}
            errors={errors}
            placeholder="Any recommended training?"
            rows={3}
          />
          <SelectInput
            label="Overall Rating"
            name="overallRating"
            register={register}
            errors={errors}
            options={OVERALL_RATINGS}
            required
          />
        </FormSection>

        <FormSection title="Signatures">
          <SignaturePad
            label="Driver Signature"
            signature={driverSignature}
            setSignature={setDriverSignature}
            required
          />
          <SignaturePad
            label="Evaluator Signature"
            signature={evaluatorSignature}
            setSignature={setEvaluatorSignature}
            required
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default DriverRideAlong
