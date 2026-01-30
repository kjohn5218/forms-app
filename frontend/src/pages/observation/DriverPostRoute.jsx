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
  { name: 'removesSafetyChains', label: 'Driver removes safety chains from door, opens dock door, and opens trailer door' },
  { name: 'storesEquipment', label: 'Driver removes and stores mechanical assist equipment in proper storage locations and communicates defects, if any, to dispatch/supervisor' },
  { name: 'turnsPaperwork', label: 'Drivers turns in completed route paperwork to appropriate party' },
  { name: 'storesKeys', label: 'Driver stores/returns keys as appropriate (Driver does not leave keys in tractor, clipboard, or take them home)' },
  { name: 'changesStatus', label: 'Driver changes status to off duty and logs out of geotab' },
  { name: 'storesNELO', label: 'Drivers stores NELO device or turns in to dispatch as appropriate' }
]

const ObservationItem = ({ item, register, watch }) => {
  const fieldValue = watch(`observation.${item.name}`)

  return (
    <div className="py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 flex-1 pr-4">{item.label}</span>
        <div className="flex gap-2">
          {['Acceptable', 'Unacceptable'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                {...register(`observation.${item.name}`, { required: true })}
                value={option}
                className="sr-only peer"
              />
              <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
                ${option === 'Acceptable' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
                ${option === 'Unacceptable' ? 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 hover:bg-red-50' : ''}
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

const DriverPostRoute = () => {
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
    const unacceptableCount = values.filter(v => v === 'Unacceptable').length
    if (unacceptableCount === 0) return 'Acceptable'
    return 'Unacceptable'
  }

  const result = calculateResult()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('DPOR')

    const formData = {
      ...data,
      formSubtype: 'driver-post-route',
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
          state: { submissionId, formType: 'Delivery Driver Post-route Observation' }
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
        title="Delivery Driver Post-route Observation"
        gradient="from-violet-500 to-violet-600"
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
            label="Observer/Manager Email"
            name="observerEmail"
            register={register}
            errors={errors}
            required
            type="email"
            placeholder="email@ccfs.com"
          />
          <TextInput
            label="Driver Name"
            name="driverName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Truck Number"
            name="truckNumber"
            register={register}
            errors={errors}
          />
          <TextInput
            label="Route Number"
            name="routeNumber"
            register={register}
            errors={errors}
          />
        </FormSection>

        <FormSection title="Post-route Observation Items">
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
              result === 'Acceptable'
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

export default DriverPostRoute
