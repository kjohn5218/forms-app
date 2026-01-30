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

const HABITS = [
  {
    name: 'aimHighInSteering',
    title: '1. Aim High in Steering',
    description: [
      'a. How do you do it? Pick an imaginary Target – Baseball/Dartboard',
      'b. What does it do for you? Centers car in traffic lane and creates a safe path on turns.',
      'c. Key Phrase: Find a safe path well ahead.'
    ]
  },
  {
    name: 'getBigPicture',
    title: '2. Get the Big Picture',
    description: [
      'a. How do you do it? How wide, how deep? What is in it? Objects and ground.',
      'b. What does it do for you? Keeps you away from billboards. Smooth stops and turns. Buys Time.',
      'c. Key Phrase: Stay back and see it all'
    ]
  },
  {
    name: 'keepEyesMoving',
    title: '3. Keep Your Eyes Moving',
    description: [
      'a. How do you do it? Move eyes; front every 2 seconds, rear every 5-8 seconds',
      'b. What does it do for you? Keeps you alive at intersections. Keeps eyes ahead of the car.',
      'c. Key Phrase: Scan don\'t stare.'
    ]
  },
  {
    name: 'leaveYourselfOut',
    title: '4. Leave Yourself an Out',
    description: [
      'a. How do you do it? Have an escape route. Take the path of least resistance.',
      'b. What does it do for you? Space on all sides, but always in front.',
      'c. Key Phrase: Be prepared. Expect the Unexpected.'
    ]
  },
  {
    name: 'makeSureTheySeeYou',
    title: '5. Make Sure They See You',
    description: [
      'a. How do you do it? Communicate in traffic; horn, lights, and signals',
      'b. What does it do for you? Establishes eye-to-eye contact',
      'c. Key Phrase: Don\'t gamble. Use your horn, lights, and signals.'
    ]
  }
]

const HabitItem = ({ habit, register, watch }) => {
  const fieldValue = watch(`habits.${habit.name}`)

  return (
    <div className="py-4 border-b border-gray-200">
      <div className="mb-3">
        <h4 className="font-semibold text-gray-800">{habit.title}</h4>
        <div className="mt-2 text-sm text-gray-600 space-y-1">
          {habit.description.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {['Understands concept', 'Does not understand concept'].map(option => (
          <label key={option} className="flex items-center">
            <input
              type="radio"
              {...register(`habits.${habit.name}`, { required: true })}
              value={option}
              className="sr-only peer"
            />
            <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer border transition-colors
              ${option === 'Understands concept' ? 'peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:bg-green-50' : ''}
              ${option === 'Does not understand concept' ? 'peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 hover:bg-red-50' : ''}
              border-gray-300 text-gray-600
            `}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

const FiveSeeingHabits = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const habits = watch('habits') || {}

  const calculateResult = () => {
    const values = Object.values(habits)
    if (values.length === 0) return null
    const doesNotUnderstandCount = values.filter(v => v === 'Does not understand concept').length
    if (doesNotUnderstandCount === 0) return 'Pass'
    return `Needs Training (${doesNotUnderstandCount} items)`
  }

  const result = calculateResult()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('5SH')

    const formData = {
      ...data,
      formSubtype: 'five-seeing-habits',
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
          state: { submissionId, formType: 'Five Seeing Habits Observation' }
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
        title="Five Seeing Habits"
        gradient="from-cyan-500 to-cyan-600"
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
            label="Interviewer/Manager Email"
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
        </FormSection>

        <FormSection title="Interview - Five Seeing Habits">
          <p className="text-sm text-gray-600 mb-4">
            Interview the driver and record their understanding of each of the habits.
          </p>
          <div className="divide-y divide-gray-200">
            {HABITS.map(habit => (
              <HabitItem
                key={habit.name}
                habit={habit}
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

export default FiveSeeingHabits
