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
  YesNoItem,
  SignaturePad,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const AUDIT_ITEMS = [
  { name: 'dvirCompletedBeforeTrip', label: 'DVIR completed before trip?' },
  { name: 'allSectionsCompleted', label: 'All required sections completed?' },
  { name: 'defectsDocumented', label: 'Defects properly documented?' },
  { name: 'preTripThorough', label: 'Pre-trip inspection thorough?' },
  { name: 'postTripCompleted', label: 'Post-trip inspection completed?' },
  { name: 'defectsReported', label: 'Defects reported to maintenance?' },
  { name: 'repairsDocumented', label: 'Repairs documented before next use?' },
  { name: 'driverSignature', label: 'Driver signature present?' },
  { name: 'mechanicSignature', label: 'Mechanic signature present (if repairs made)?' },
  { name: 'dvirLegible', label: 'DVIR legible and complete?' }
]

const COMPLIANCE_LEVELS = [
  'Compliant',
  'Minor Issues',
  'Major Issues',
  'Non-Compliant'
]

const DVIRAudit = () => {
  const navigate = useNavigate()
  const [auditorSignature, setAuditorSignature] = useState('')
  const [driverSignature, setDriverSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      auditDate: getTodayDate()
    }
  })

  const compliance = watch('overallCompliance')

  const onSubmit = async (data) => {
    if (!auditorSignature) {
      alert('Please provide auditor signature')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('DVR')

    const formData = {
      ...data,
      auditorSignature,
      driverSignature,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/dvir-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'DVIR Audit' }
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
      <FormHeader title="DVIR Audit" gradient="from-blue-500 to-blue-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Audit Information">
          <DateInput
            label="Audit Date"
            name="auditDate"
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
            label="Auditor Name"
            name="auditorName"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Auditor Employee ID"
            name="auditorEmployeeId"
            register={register}
            errors={errors}
            required
          />
        </FormSection>

        <FormSection title="DVIR Being Audited">
          <DateInput
            label="DVIR Date"
            name="dvirDate"
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
          <TextInput
            label="Truck Number"
            name="truckNumber"
            register={register}
            errors={errors}
            required
          />
          <TextInput
            label="Trailer Number"
            name="trailerNumber"
            register={register}
            errors={errors}
          />
        </FormSection>

        <FormSection title="Audit Checklist">
          <p className="text-sm text-gray-500 mb-4">Mark each item as Yes, No, or N/A</p>
          <div className="bg-white rounded-lg p-4">
            {AUDIT_ITEMS.map(item => (
              <YesNoItem
                key={item.name}
                label={item.label}
                name={`audit.${item.name}`}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Audit Results">
          <SelectInput
            label="Overall Compliance"
            name="overallCompliance"
            register={register}
            errors={errors}
            options={COMPLIANCE_LEVELS}
            required
          />
          <TextArea
            label="Deficiencies Found"
            name="deficienciesFound"
            register={register}
            errors={errors}
            placeholder="List any deficiencies found during the audit..."
            rows={4}
          />
          <TextArea
            label="Corrective Action Required"
            name="correctiveAction"
            register={register}
            errors={errors}
            placeholder="Describe required corrective actions..."
            rows={4}
          />
          {(compliance === 'Minor Issues' || compliance === 'Major Issues' || compliance === 'Non-Compliant') && (
            <DateInput
              label="Follow-up Date"
              name="followUpDate"
              register={register}
              errors={errors}
            />
          )}
        </FormSection>

        <FormSection title="Signatures">
          <SignaturePad
            label="Auditor Signature"
            signature={auditorSignature}
            setSignature={setAuditorSignature}
            required
          />
          <SignaturePad
            label="Driver Acknowledgment Signature (optional)"
            signature={driverSignature}
            setSignature={setDriverSignature}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default DVIRAudit
