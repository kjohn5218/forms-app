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
  InspectionItem,
  InfoBanner,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const TRUCK_INSPECTION_ITEMS = [
  { name: 'treadDepthSteer', label: 'Tread depth (4/32" steer, 2/32" drive)' },
  { name: 'exposedCords', label: 'Exposed cords or fabric' },
  { name: 'bulgesCuts', label: 'Bulges, cuts, or separations' },
  { name: 'inflationPressure', label: 'Inflation pressure' },
  { name: 'valveStems', label: 'Valve stems and caps' },
  { name: 'mismatchedTires', label: 'Mismatched tire sizes' },
  { name: 'wheelMounting', label: 'Wheel mounting' },
  { name: 'lugNuts', label: 'Lug nuts (loose/missing)' },
  { name: 'hubSeals', label: 'Hub seals (leaks)' },
  { name: 'rimDamage', label: 'Rim damage or cracks' }
]

const TRAILER_INSPECTION_ITEMS = [
  { name: 'treadDepth', label: 'Tread depth (2/32" minimum)' },
  { name: 'exposedCords', label: 'Exposed cords or fabric' },
  { name: 'bulgesCuts', label: 'Bulges, cuts, or separations' },
  { name: 'inflationPressure', label: 'Inflation pressure' },
  { name: 'valveStems', label: 'Valve stems and caps' },
  { name: 'mismatchedTires', label: 'Mismatched tire sizes' },
  { name: 'wheelMounting', label: 'Wheel mounting' },
  { name: 'lugNuts', label: 'Lug nuts (loose/missing)' },
  { name: 'hubSeals', label: 'Hub seals (leaks)' },
  { name: 'rimDamage', label: 'Rim damage or cracks' },
  { name: 'sliderPins', label: 'Slider pins (if equipped)' }
]

const TRAILER_TYPES = [
  'Dry Van',
  'Reefer',
  'Flatbed',
  'Tanker',
  'Other'
]

const CVSARoadCheckPrep = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      dateCompleted: getTodayDate()
    }
  })

  const truckNumber = watch('truckNumber')
  const trailerNumber = watch('trailerNumber')
  const truckInspection = watch('truckInspection')
  const trailerInspection = watch('trailerInspection')

  const summary = useMemo(() => {
    let pass = 0, fail = 0, na = 0

    if (truckNumber && truckInspection) {
      Object.values(truckInspection).forEach(value => {
        if (value === 'Pass') pass++
        else if (value === 'Fail') fail++
        else if (value === 'N/A') na++
      })
    }

    if (trailerNumber && trailerInspection) {
      Object.values(trailerInspection).forEach(value => {
        if (value === 'Pass') pass++
        else if (value === 'Fail') fail++
        else if (value === 'N/A') na++
      })
    }

    return { pass, fail, na, total: pass + fail + na }
  }, [truckNumber, trailerNumber, truckInspection, trailerInspection])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('CVSA')

    const formData = {
      ...data,
      summary,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/cvsa-road-check-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'CVSA Road Check Prep' }
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
      <FormHeader title="CVSA Road Check Prep" gradient="from-cyan-500 to-cyan-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <InfoBanner type="info">
          Maintenance focus is tires for this year's roadcheck
        </InfoBanner>

        <FormSection title="Basic Information">
          <DateInput
            label="Date Completed"
            name="dateCompleted"
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
            label="Inspected By"
            name="inspectedBy"
            register={register}
            errors={errors}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Truck #"
              name="truckNumber"
              register={register}
              errors={errors}
              placeholder="Optional"
            />
            <TextInput
              label="Trailer #"
              name="trailerNumber"
              register={register}
              errors={errors}
              placeholder="Optional"
            />
          </div>
        </FormSection>

        {truckNumber && (
          <FormSection title="Truck Inspection">
            <div className="bg-white rounded-lg p-4">
              {TRUCK_INSPECTION_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`truckInspection.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <TextInput
                label="Truck Odometer"
                name="truckOdometer"
                type="number"
                register={register}
                errors={errors}
                required
              />
              <TextInput
                label="Truck License Plate"
                name="truckLicensePlate"
                register={register}
                errors={errors}
                required
              />
            </div>
          </FormSection>
        )}

        {trailerNumber && (
          <FormSection title="Trailer Inspection">
            <div className="bg-white rounded-lg p-4">
              {TRAILER_INSPECTION_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`trailerInspection.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <TextInput
                label="Trailer License Plate"
                name="trailerLicensePlate"
                register={register}
                errors={errors}
                required
              />
              <SelectInput
                label="Trailer Type"
                name="trailerType"
                register={register}
                errors={errors}
                options={TRAILER_TYPES}
              />
            </div>
          </FormSection>
        )}

        <FormSection title="Notes">
          <TextArea
            label="Notes"
            name="notes"
            register={register}
            errors={errors}
            placeholder="Any additional notes..."
            maxLength={2000}
            rows={4}
          />
        </FormSection>

        <InfoBanner type="warning">
          If defects found and can't be corrected, enter into GeoTab
        </InfoBanner>

        {summary.total > 0 && (
          <FormSection title="Inspection Summary">
            <div className="bg-white rounded-lg p-4">
              <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{summary.pass}</div>
                  <div className="text-sm text-gray-500">Pass</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{summary.fail}</div>
                  <div className="text-sm text-gray-500">Fail</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{summary.na}</div>
                  <div className="text-sm text-gray-500">N/A</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
              <div className={`text-center p-3 rounded-lg font-semibold ${
                summary.fail === 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {summary.fail === 0
                  ? 'READY FOR ROAD CHECK'
                  : `${summary.fail} DEFECT(S) FOUND - ENTER IN GEOTAB`
                }
              </div>
            </div>
          </FormSection>
        )}

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default CVSARoadCheckPrep
