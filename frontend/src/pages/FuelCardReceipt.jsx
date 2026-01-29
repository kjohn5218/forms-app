import { useState, useMemo } from 'react'
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
  PhotoUpload,
  SubmitButton,
  TERMINALS,
  US_STATES,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const FUEL_TYPES = [
  'Diesel',
  'DEF',
  'Gasoline'
]

const FuelCardReceipt = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate(),
      transactionDate: getTodayDate()
    }
  })

  const gallons = watch('gallons')
  const pricePerGallon = watch('pricePerGallon')

  const totalAmount = useMemo(() => {
    const g = parseFloat(gallons) || 0
    const p = parseFloat(pricePerGallon) || 0
    return (g * p).toFixed(2)
  }, [gallons, pricePerGallon])

  const onSubmit = async (data) => {
    if (photos.length === 0) {
      alert('At least one receipt photo is required')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('FCR')

    const formData = {
      ...data,
      totalAmount,
      photos,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/fuel-card-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Fuel Card Receipt' }
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
      <FormHeader title="Fuel Card Receipt" gradient="from-emerald-500 to-emerald-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Driver Information">
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
            label="Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Transaction Information">
          <DateInput
            label="Transaction Date"
            name="transactionDate"
            register={register}
            errors={errors}
            required
            defaultValue={getTodayDate()}
          />
          <TextInput
            label="Fuel Card Last 4 Digits"
            name="fuelCardLast4"
            register={register}
            errors={errors}
            required
            maxLength={4}
            validation={{
              pattern: { value: /^\d{4}$/, message: 'Must be exactly 4 digits' }
            }}
          />
          <TextInput
            label="Truck Number"
            name="truckNumber"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Odometer Reading"
            name="odometerReading"
            type="number"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="Fuel Purchase">
          <SelectInput
            label="Fuel Type"
            name="fuelType"
            register={register}
            errors={errors}
            options={FUEL_TYPES}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Gallons"
              name="gallons"
              type="number"
              register={register}
              errors={errors}
              required
              validation={{
                min: { value: 0.01, message: 'Must be greater than 0' }
              }}
            />
            <TextInput
              label="Price per Gallon ($)"
              name="pricePerGallon"
              type="number"
              register={register}
              errors={errors}
              required
              validation={{
                min: { value: 0.01, message: 'Must be greater than 0' }
              }}
            />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-emerald-700">${totalAmount}</div>
          </div>
        </FormSection>

        <FormSection title="Station Information">
          <TextInput
            label="Station Name"
            name="stationName"
            register={register}
            errors={errors}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Station City"
              name="stationCity"
              register={register}
              errors={errors}
              required
            />
            <SelectInput
              label="Station State"
              name="stationState"
              register={register}
              errors={errors}
              options={US_STATES}
              required
            />
          </div>
        </FormSection>

        <FormSection title="Receipt">
          <PhotoUpload
            label="Receipt Photo (required)"
            name="photos"
            photos={photos}
            setPhotos={setPhotos}
            required
            maxPhotos={3}
          />
          <TextArea
            label="Additional Notes"
            name="additionalNotes"
            register={register}
            errors={errors}
            placeholder="Any additional notes..."
            rows={3}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default FuelCardReceipt
