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

const KEYS = [
  { name: 'backOnlyWhenNecessary', label: '1. Back only when necessary' },
  { name: 'getOutAndLook', label: '2. Get out and look (GOAL)' },
  { name: 'backImmediately', label: '3. Back immediately and scan area constantly' },
  { name: 'minimizeTheBack', label: '4. Minimize the back' },
  { name: 'backToDriverSide', label: '5. Back to the driver side' },
  { name: 'backAtIdleSpeed', label: '6. Back at idle speed and sound horn every 3 seconds' },
  { name: 'noBackLiftgateExtended', label: '7. Do not back liftgate up while liftgate is extended' }
]

const KeyItem = ({ keyItem, register, watch }) => {
  const fieldValue = watch(`keys.${keyItem.name}`)

  return (
    <div className="py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 flex-1 pr-4 font-medium">{keyItem.label}</span>
        <div className="flex gap-2">
          {['Understands concept', 'Does not understand concept'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                {...register(`keys.${keyItem.name}`, { required: true })}
                value={option}
                className="sr-only peer"
              />
              <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
                ${option === 'Understands concept' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
                ${option === 'Does not understand concept' ? 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 hover:bg-red-50' : ''}
                border-gray-300 text-gray-600
              `}>
                {option === 'Understands concept' ? 'Understands' : 'Does not understand'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const SevenKeysBacking = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const keys = watch('keys') || {}

  const calculateResult = () => {
    const values = Object.values(keys)
    if (values.length === 0) return null
    const doesNotUnderstandCount = values.filter(v => v === 'Does not understand concept').length
    if (doesNotUnderstandCount === 0) return 'Pass'
    return `Needs Training (${doesNotUnderstandCount} items)`
  }

  const result = calculateResult()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('7KB')

    const formData = {
      ...data,
      formSubtype: 'seven-keys-backing',
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
          state: { submissionId, formType: 'Seven Keys to Backing Observation' }
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
        title="Seven Keys to Backing"
        gradient="from-emerald-500 to-emerald-600"
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
            label="Interviewer Name"
            name="interviewerName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Driver Name"
            name="driverName"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Interview - Seven Keys to Backing">
          <p className="text-sm text-gray-600 mb-4">
            Interview the driver and record their understanding of each of the keys.
          </p>
          <div className="divide-y divide-gray-200">
            {KEYS.map(keyItem => (
              <KeyItem
                key={keyItem.name}
                keyItem={keyItem}
                register={register}
                watch={watch}
              />
            ))}
          </div>
        </FormSection>

        {result && (
          <FormSection title="Interview Result">
            <div className={`p-4 rounded-lg text-center font-bold text-lg ${
              result === 'Pass'
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
            placeholder="Any additional notes about the interview..."
            rows={3}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default SevenKeysBacking
