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
  InspectionItem,
  RatingItem,
  PhotoUpload,
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const SHOP_TYPES = [
  'Maintenance',
  'Body Shop',
  'Tire Shop',
  'Wash Bay'
]

const SAFETY_ITEMS = [
  { name: 'fireExtinguishers', label: 'Fire Extinguishers (in-date)' },
  { name: 'firstAidKit', label: 'First Aid Kit (stocked)' },
  { name: 'eyeWashStation', label: 'Eye Wash Station (functional)' },
  { name: 'emergencyShower', label: 'Emergency Shower (if applicable)' },
  { name: 'spillKit', label: 'Spill Kit' },
  { name: 'ppeStorage', label: 'PPE Storage' }
]

const WORK_AREA_ITEMS = [
  { name: 'floorCondition', label: 'Floor Condition' },
  { name: 'lighting', label: 'Lighting' },
  { name: 'ventilation', label: 'Ventilation' },
  { name: 'housekeeping', label: 'Housekeeping' },
  { name: 'toolOrganization', label: 'Tool Organization' },
  { name: 'partsStorage', label: 'Parts Storage' },
  { name: 'wasteDisposal', label: 'Waste Disposal' }
]

const EQUIPMENT_ITEMS = [
  { name: 'liftsJacks', label: 'Lifts/Jacks' },
  { name: 'airCompressor', label: 'Air Compressor' },
  { name: 'weldingEquipment', label: 'Welding Equipment' },
  { name: 'diagnosticEquipment', label: 'Diagnostic Equipment' },
  { name: 'handTools', label: 'Hand Tools' },
  { name: 'powerTools', label: 'Power Tools' },
  { name: 'safetyGuards', label: 'Safety Guards' }
]

const HAZMAT_ITEMS = [
  { name: 'sdsSheets', label: 'SDS Sheets Available' },
  { name: 'properStorage', label: 'Proper Storage' },
  { name: 'labeling', label: 'Labeling' },
  { name: 'secondaryContainment', label: 'Secondary Containment' },
  { name: 'disposalProcedures', label: 'Disposal Procedures' }
]

const DOCUMENTATION_ITEMS = [
  { name: 'equipmentInspectionRecords', label: 'Equipment Inspection Records Current' },
  { name: 'trainingRecords', label: 'Training Records Available' },
  { name: 'lockoutTagoutPosted', label: 'Lockout/Tagout Procedures Posted' },
  { name: 'emergencyProceduresPosted', label: 'Emergency Procedures Posted' }
]

const ShopInspection = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const onSubmit = async (data) => {
    if (!signature) {
      alert('Please provide your signature')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('SHP')

    const formData = {
      ...data,
      photos,
      signature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/shop-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Shop Inspection' }
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
      <FormHeader title="Shop Inspection" gradient="from-slate-500 to-slate-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Inspection Information">
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
            label="Inspector Name"
            name="inspectorName"
            register={register}
            errors={errors}
            required
          />
          <SelectInput
            label="Shop Type"
            name="shopType"
            register={register}
            errors={errors}
            options={SHOP_TYPES}
            required
          />
        </FormSection>

        <FormSection title="Safety Equipment">
          <p className="text-sm text-gray-500 mb-4">Mark each item as Present, Missing, or N/A</p>
          <div className="bg-white rounded-lg p-4">
            {SAFETY_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`safety.${item.name}`}
                register={register}
                errors={errors}
                options={['Present', 'Missing', 'N/A']}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Work Area">
          <div className="bg-white rounded-lg p-4">
            {WORK_AREA_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`workArea.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Equipment Condition">
          <div className="bg-white rounded-lg p-4">
            {EQUIPMENT_ITEMS.map(item => (
              <RatingItem
                key={item.name}
                label={item.label}
                name={`equipment.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Hazardous Materials">
          <div className="bg-white rounded-lg p-4">
            {HAZMAT_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`hazmat.${item.name}`}
                register={register}
                errors={errors}
                options={['Compliant', 'Non-Compliant', 'N/A']}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Documentation">
          <div className="bg-white rounded-lg p-4">
            {DOCUMENTATION_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`documentation.${item.name}`}
                register={register}
                errors={errors}
                options={['Yes', 'No', 'N/A']}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Findings">
          <TextArea
            label="Deficiencies Found"
            name="deficienciesFound"
            register={register}
            errors={errors}
            placeholder="List any deficiencies found..."
            rows={4}
          />
          <TextArea
            label="Corrective Actions Required"
            name="correctiveActions"
            register={register}
            errors={errors}
            placeholder="List required corrective actions..."
            rows={4}
          />
        </FormSection>

        <FormSection title="Photos & Signature">
          <PhotoUpload
            label="Photos"
            name="photos"
            photos={photos}
            setPhotos={setPhotos}
            maxPhotos={10}
          />
          <SignaturePad
            label="Inspector Signature"
            signature={signature}
            setSignature={setSignature}
            required
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default ShopInspection
