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
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const EVALUATION_TYPES = [
  'Initial',
  'Annual',
  'Re-certification',
  'Post-Incident'
]

const FORKLIFT_TYPES = [
  'Sit-down Counter Balance',
  'Stand-up',
  'Reach Truck',
  'Order Picker',
  'Pallet Jack'
]

const PRACTICAL_ITEMS = [
  { name: 'preOperation', label: 'Pre-operation Inspection' },
  { name: 'startingProcedures', label: 'Starting Procedures' },
  { name: 'traveling', label: 'Traveling (loaded and unloaded)' },
  { name: 'turningManeuvering', label: 'Turning and Maneuvering' },
  { name: 'stoppingParking', label: 'Stopping and Parking' },
  { name: 'loadingUnloading', label: 'Loading/Unloading' },
  { name: 'stackingUnstacking', label: 'Stacking/Unstacking' },
  { name: 'dockOperations', label: 'Dock Operations' },
  { name: 'pedestrianSafety', label: 'Pedestrian Safety Awareness' },
  { name: 'speedControl', label: 'Speed Control' },
  { name: 'hornUsage', label: 'Horn Usage' },
  { name: 'loadHandling', label: 'Load Handling' },
  { name: 'rampOperations', label: 'Ramp/Incline Operations' },
  { name: 'batteryCharging', label: 'Battery Charging/Fueling (if applicable)' },
  { name: 'shutdownProcedures', label: 'Shutdown Procedures' }
]

const OVERALL_RESULTS = [
  'Pass',
  'Fail',
  'Conditional Pass'
]

const ForkliftOperatorEvaluation = () => {
  const navigate = useNavigate()
  const [operatorSignature, setOperatorSignature] = useState('')
  const [evaluatorSignature, setEvaluatorSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      evaluationDate: getTodayDate(),
      passingScore: 80
    }
  })

  const testScore = watch('testScore')
  const passingScore = watch('passingScore') || 80
  const testPassed = testScore >= passingScore
  const overallResult = watch('overallResult')

  const onSubmit = async (data) => {
    if (!operatorSignature || !evaluatorSignature) {
      alert('Both operator and evaluator signatures are required')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('FOE')

    const formData = {
      ...data,
      testPassed,
      operatorSignature,
      evaluatorSignature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/forklift-operator-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Forklift Operator Evaluation' }
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
      <FormHeader title="Forklift Operator Evaluation" gradient="from-amber-500 to-amber-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Operator Information">
          <DateInput
            label="Evaluation Date"
            name="evaluationDate"
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
            label="Employee ID"
            name="employeeId"
            register={register}
            errors={errors}
            required
          />
          <SelectInput
            label="Evaluation Type"
            name="evaluationType"
            register={register}
            errors={errors}
            options={EVALUATION_TYPES}
            required
          />
          <SelectInput
            label="Forklift Type"
            name="forkliftType"
            register={register}
            errors={errors}
            options={FORKLIFT_TYPES}
            required
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

        <FormSection title="Written Test">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Test Score"
              name="testScore"
              type="number"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Score must be 0-100' }, max: { value: 100, message: 'Score must be 0-100' } }}
            />
            <TextInput
              label="Passing Score"
              name="passingScore"
              type="number"
              register={register}
              errors={errors}
              disabled
            />
          </div>
          {testScore !== undefined && testScore !== '' && (
            <div className={`mt-2 p-3 rounded-lg ${testPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Test {testPassed ? 'Passed' : 'Failed'}
            </div>
          )}
        </FormSection>

        <FormSection title="Practical Evaluation">
          <p className="text-sm text-gray-500 mb-4">Mark each item as Satisfactory, Unsatisfactory, or N/A</p>
          <div className="bg-white rounded-lg p-4">
            {PRACTICAL_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`practical.${item.name}`}
                register={register}
                errors={errors}
                options={['Satisfactory', 'Unsatisfactory', 'N/A']}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Evaluation Results">
          <SelectInput
            label="Overall Result"
            name="overallResult"
            register={register}
            errors={errors}
            options={OVERALL_RESULTS}
            required
          />
          <TextArea
            label="Areas Needing Improvement"
            name="areasNeedingImprovement"
            register={register}
            errors={errors}
            placeholder="List any areas that need improvement..."
            rows={3}
          />
          <TextArea
            label="Restrictions (if any)"
            name="restrictions"
            register={register}
            errors={errors}
            placeholder="List any restrictions..."
            rows={2}
          />
          <RadioGroup
            label="Re-evaluation Required?"
            name="reEvaluationRequired"
            register={register}
            errors={errors}
            options={['Yes', 'No']}
          />
          {(overallResult === 'Conditional Pass' || overallResult === 'Fail') && (
            <DateInput
              label="Re-evaluation Date"
              name="reEvaluationDate"
              register={register}
              errors={errors}
            />
          )}
        </FormSection>

        <FormSection title="Certification">
          <DateInput
            label="Certification Valid Until"
            name="certificationValidUntil"
            register={register}
            errors={errors}
          />
          <p className="text-xs text-gray-500 mb-4">Typically valid for 3 years from evaluation date</p>
        </FormSection>

        <FormSection title="Signatures">
          <SignaturePad
            label="Operator Signature"
            signature={operatorSignature}
            setSignature={setOperatorSignature}
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

export default ForkliftOperatorEvaluation
