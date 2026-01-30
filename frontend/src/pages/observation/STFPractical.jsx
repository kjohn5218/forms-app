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
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../../components/FormComponents'

const PRACTICAL_ITEMS = [
  { name: 'centerOfGravity', label: 'Explain what and where the center of gravity is' },
  { name: 'correctPosture', label: 'Demonstrate correct posture for optimal center of gravity' },
  { name: 'properCarrying', label: 'Demonstrate proper carrying technique to maintain center of gravity' },
  { name: 'defineMomentum', label: 'Define momentum' },
  { name: 'momentumEffect', label: 'Explain what effect momentum has on slips, trips, and falls' },
  { name: 'defineSlip', label: 'Define a slip and explain how it occurs' },
  { name: 'appropriateFootwear', label: 'Is the employee wearing appropriate footwear?' },
  { name: 'heelTractionAids', label: 'Describe when heel traction aids should be used' },
  { name: 'walkSlipperySurface', label: 'Demonstrate how to walk on a slippery surface' },
  { name: 'slippingHazards', label: 'Explain and describe items in their environment that would be considered a slipping hazard' },
  { name: 'defineTrip', label: 'Define a trip and explain how it occurs' },
  { name: 'trippingHazards', label: 'Explain and describe items in their environment that would be considered a tripping hazard' },
  { name: 'preventativeHousekeeping', label: 'Explain/Demonstrate preventative housekeeping' },
  { name: 'defineFalling', label: 'Define what falling is and how it occurs' },
  { name: 'reduceInjuryMethods', label: 'Describe the proper methods to help reduce the chances of an injury while falling' },
  { name: 'threePointsContact', label: 'Explain/Demonstrate how to proper use three points of contact' },
  { name: 'explainLEADS', label: 'Explain LEADS' }
]

const PracticalItem = ({ item, register, watch, index }) => {
  const fieldValue = watch(`practical.${item.name}.status`)

  return (
    <div className="py-4 border-b border-gray-200">
      <div className="mb-2">
        <span className="text-sm text-gray-700 font-medium">{index + 1}. {item.label}</span>
      </div>
      <div className="flex gap-2 mb-2">
        {['Acceptable', 'Training Required', 'N/A'].map(option => (
          <label key={option} className="flex items-center">
            <input
              type="radio"
              {...register(`practical.${item.name}.status`, { required: true })}
              value={option}
              className="sr-only peer"
            />
            <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
              ${option === 'Acceptable' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
              ${option === 'Training Required' ? 'peer-checked:bg-yellow-500 peer-checked:text-white peer-checked:border-yellow-500 hover:bg-yellow-50' : ''}
              ${option === 'N/A' ? 'peer-checked:bg-gray-500 peer-checked:text-white peer-checked:border-gray-500 hover:bg-gray-50' : ''}
              border-gray-300 text-gray-600
            `}>
              {option}
            </span>
          </label>
        ))}
      </div>
      <textarea
        {...register(`practical.${item.name}.comment`)}
        placeholder="Comments (optional)"
        rows={2}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>
  )
}

const STFPractical = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const practical = watch('practical') || {}

  const calculateResult = () => {
    const items = Object.values(practical)
    if (items.length === 0) return null
    const trainingRequired = items.filter(item => item?.status === 'Training Required').length
    if (trainingRequired === 0) return 'Acceptable'
    return `Training Required (${trainingRequired} items)`
  }

  const getTrainingRequiredItems = () => {
    const items = []
    PRACTICAL_ITEMS.forEach(item => {
      if (practical[item.name]?.status === 'Training Required') {
        items.push(item.label)
      }
    })
    return items
  }

  const result = calculateResult()
  const trainingItems = getTrainingRequiredItems()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('STFP')

    const formData = {
      ...data,
      formSubtype: 'stf-practical',
      result,
      tasksRequiringTraining: trainingItems,
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
          state: { submissionId, formType: 'Slips, Trips & Falls Practical' }
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
      <FormHeader
        title="Slips, Trips & Falls Practical"
        gradient="from-orange-500 to-orange-600"
        backTo="/observation-forms"
      />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Basic Information">
          <DateInput
            label="Date"
            name="date"
            register={register}
            errors={errors}
            required
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
            label="Evaluator Name"
            name="evaluatorName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Evaluator/Manager Email"
            name="observerEmail"
            register={register}
            errors={errors}
            required
            type="email"
            placeholder="email@ccfs.com"
          />
          <TextInput
            label="Employee Name"
            name="employeeName"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Practical Evaluation">
          <p className="text-sm text-gray-600 mb-4">
            Evaluate the employee's understanding and demonstration of each item.
          </p>
          <div className="divide-y divide-gray-200">
            {PRACTICAL_ITEMS.map((item, index) => (
              <PracticalItem
                key={item.name}
                item={item}
                register={register}
                watch={watch}
                index={index}
              />
            ))}
          </div>
        </FormSection>

        {result && (
          <FormSection title="Evaluation Result">
            <div className={`p-4 rounded-lg text-center font-bold text-lg ${
              result === 'Acceptable'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            }`}>
              {result}
            </div>
            {trainingItems.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Tasks Requiring Training:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {trainingItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </FormSection>
        )}

        <FormSection title="Additional Notes">
          <TextArea
            label="Notes"
            name="additionalNotes"
            register={register}
            errors={errors}
            placeholder="Any additional notes about the evaluation..."
            rows={3}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default STFPractical
