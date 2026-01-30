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
  SubmitButton,
  TERMINALS,
  getTodayDate,
  getCurrentTime,
  generateFormId
} from '../../components/FormComponents'

const OBSERVATION_ITEMS = [
  { name: 'usesSeatBelt', label: 'Does employee use seat belt?' },
  { name: 'setsNeutralBrake', label: 'Always place the forklift in neutral, sets parking brake, and places fork blades on the ground when leaving the forklift?' },
  { name: 'threePointsContact', label: 'Utilizes 3 points of contact when getting on and off the forklift' },
  { name: 'looksDirectionOfTravel', label: 'Consistently looks in the direction of travel as well as look around for obstacles?' },
  { name: 'travelSafeHeight', label: 'Travel with load/forks at a safe height?' },
  { name: 'travelSafeSpeed', label: 'Travel at a safe speed?' },
  { name: 'carefulWithLoads', label: 'Careful when picking up/placing loads to prevent damage?' },
  { name: 'willingToHandLoad', label: 'Willing to get off the forklift to hand load freight when necessary?' },
  { name: 'watchesForPedestrians', label: 'Watches constantly for pedestrians/other forklifts and uses horn to notify others of their presence.' },
  { name: 'noHeadArmsThroughMast', label: 'Does not place head or arms through the front of forklift/mast' }
]

const ObservationItem = ({ item, register, watch }) => {
  const fieldValue = watch(`observation.${item.name}`)

  return (
    <div className="py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 flex-1 pr-4">{item.label}</span>
        <div className="flex gap-2">
          {['Safe', 'At Risk'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                {...register(`observation.${item.name}`, { required: true })}
                value={option}
                className="sr-only peer"
              />
              <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
                ${option === 'Safe' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
                ${option === 'At Risk' ? 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 hover:bg-red-50' : ''}
                border-gray-300 text-gray-600
              `}>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const ForkliftOperation = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate(),
      time: getCurrentTime()
    }
  })

  const observation = watch('observation') || {}

  const calculateResult = () => {
    const values = Object.values(observation)
    if (values.length === 0) return null
    const atRiskCount = values.filter(v => v === 'At Risk').length
    if (atRiskCount === 0) return 'Safe'
    return 'At Risk'
  }

  const result = calculateResult()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('FKO')

    const formData = {
      ...data,
      formSubtype: 'forklift-operation',
      result,
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
          state: { submissionId, formType: 'Forklift Operation Observation' }
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
        title="Forklift Operation Observation"
        gradient="from-amber-500 to-amber-600"
        backTo="/observation-forms"
      />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Date"
              name="date"
              register={register}
              errors={errors}
              required
            />
            <TimeInput
              label="Time"
              name="time"
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
          <TextInput
            label="Observer Name"
            name="observerName"
            register={register}
            errors={errors}
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
            label="Forklift ID"
            name="forkliftId"
            register={register}
            errors={errors}
          />
          <TextInput
            label="Location"
            name="location"
            register={register}
            errors={errors}
            placeholder="Dock area or location"
          />
        </FormSection>

        <FormSection title="Observation Items">
          <div className="divide-y divide-gray-200">
            {OBSERVATION_ITEMS.map(item => (
              <ObservationItem
                key={item.name}
                item={item}
                register={register}
                watch={watch}
              />
            ))}
          </div>
        </FormSection>

        {result && (
          <FormSection title="Observation Result">
            <div className={`p-4 rounded-lg text-center font-bold text-lg ${
              result === 'Safe'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {result}
            </div>
          </FormSection>
        )}

        <FormSection title="Additional Comments">
          <TextArea
            label="Comments"
            name="comments"
            register={register}
            errors={errors}
            placeholder="Any additional observations or notes..."
            rows={3}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default ForkliftOperation
