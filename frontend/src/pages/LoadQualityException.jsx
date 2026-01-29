import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import {
  FormHeader,
  FormContainer,
  FormSection,
  TextInput,
  SelectInput,
  DateInput,
  TextArea,
  CheckboxGroup,
  PhotoUpload,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const LOAD_TYPES = [
  'Linehaul',
  'P&D',
  'City',
  'Relay'
]

const EXCEPTION_TYPES = [
  'Poor Quality',
  "Wasn't rewrapped",
  'Shifted Load',
  'Improper Blocking/Bracing',
  'Mixed Freight',
  'Overweight',
  'Leaking Freight',
  'Damaged Freight',
  'Incorrect Paperwork',
  'Other'
]

const LoadQualityException = () => {
  const navigate = useNavigate()
  const [doorOpenedPhoto, setDoorOpenedPhoto] = useState([])
  const [additionalPhotos, setAdditionalPhotos] = useState([])
  const [proNumbers, setProNumbers] = useState([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const addProNumber = () => {
    setProNumbers([...proNumbers, ''])
  }

  const removeProNumber = (index) => {
    if (proNumbers.length > 1) {
      setProNumbers(proNumbers.filter((_, i) => i !== index))
    }
  }

  const updateProNumber = (index, value) => {
    const updated = [...proNumbers]
    updated[index] = value
    setProNumbers(updated)
  }

  const onSubmit = async (data) => {
    if (doorOpenedPhoto.length === 0) {
      alert('Please take a photo when door is opened')
      return
    }

    // Filter out empty pro numbers
    const filteredProNumbers = proNumbers.filter(p => p.trim() !== '')
    if (filteredProNumbers.length === 0) {
      alert('At least one Affected Pro Number is required')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('LQE')

    const formData = {
      ...data,
      doorOpenedPhoto: doorOpenedPhoto[0],
      additionalPhotos,
      affectedProNumbers: filteredProNumbers,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/load-quality-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Load Quality Exception' }
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
      <FormHeader title="Load Quality Exception" gradient="from-purple-500 to-purple-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Report Information">
          <SelectInput
            label="Reporting Service Center"
            name="reportingServiceCenter"
            register={register}
            errors={errors}
            options={TERMINALS}
            required
          />
          <DateInput
            label="Date"
            name="date"
            register={register}
            errors={errors}
            required
            defaultValue={getTodayDate()}
          />
          <TextInput
            label="Employee Reporting Name"
            name="employeeReportingName"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Load Information">
          <SelectInput
            label="Type of load?"
            name="loadType"
            register={register}
            errors={errors}
            options={LOAD_TYPES}
            required
          />
          <SelectInput
            label="Loaded at which Service Center?"
            name="loadedAtServiceCenter"
            register={register}
            errors={errors}
            options={TERMINALS}
            required
          />
          <TextInput
            label="Trailer #"
            name="trailerNumber"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Load Photos">
          <PhotoUpload
            label="Load Photo - Take when door opened"
            name="doorOpenedPhoto"
            photos={doorOpenedPhoto}
            setPhotos={setDoorOpenedPhoto}
            required
            maxPhotos={1}
          />
          <PhotoUpload
            label="Load Photo - Additional"
            name="additionalPhotos"
            photos={additionalPhotos}
            setPhotos={setAdditionalPhotos}
            maxPhotos={5}
          />
        </FormSection>

        <FormSection title="Exception Details">
          <CheckboxGroup
            label="Exception (select all that apply)"
            name="exceptionTypes"
            register={register}
            errors={errors}
            options={EXCEPTION_TYPES}
            required
          />
          <TextArea
            label="Comments"
            name="comments"
            register={register}
            errors={errors}
            placeholder="Describe the issue in detail..."
            rows={4}
          />
        </FormSection>

        <FormSection title="Affected Pro Numbers">
          <div className="space-y-3">
            {proNumbers.map((proNumber, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={proNumber}
                  onChange={(e) => updateProNumber(index, e.target.value)}
                  placeholder="Enter Pro Number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccfs-primary focus:border-transparent"
                />
                {proNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProNumber(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProNumber}
              className="flex items-center gap-2 text-ccfs-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Another Pro Number
            </button>
          </div>
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default LoadQualityException
