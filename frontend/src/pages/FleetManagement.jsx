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
  RatingItem,
  PhotoUpload,
  SignaturePad,
  FormNavigation,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

const SITE_WORK_ITEMS = [
  { name: 'surfaceDrainage', label: 'Surface Drainage' },
  { name: 'manholes', label: 'Manholes' },
  { name: 'ditches', label: 'Ditches adjacent to building' },
  { name: 'treesVegetation', label: 'Trees and vegetation on site' },
  { name: 'parkingArea', label: 'Parking Area' },
  { name: 'fences', label: 'Fences' },
  { name: 'fencePosts', label: 'Fence Posts' },
  { name: 'railings', label: 'Railings' },
  { name: 'buildingAccessibility', label: 'Building accessibility from parking area' },
  { name: 'pathwaysSidewalks', label: 'Pathways and Sidewalks ADA' },
  { name: 'curbs', label: 'Curbs' },
  { name: 'stairsSteps', label: 'Stairs and Steps' },
  { name: 'signs', label: 'Signs' }
]

const PLUMBING_ITEMS = [
  { name: 'waterSupply', label: 'Water Supply' },
  { name: 'faucets', label: 'Faucets' },
  { name: 'sinks', label: 'Sinks' },
  { name: 'fixtures', label: 'Fixtures (note Type)' },
  { name: 'toilets', label: 'Toilets' },
  { name: 'urinals', label: 'Urinals' },
  { name: 'septic', label: 'Septic' },
  { name: 'dispensers', label: 'Toilet Paper & Soap Dispensers' },
  { name: 'floorDrains', label: 'Floor Drains' }
]

const ELECTRICAL_ITEMS = [
  { name: 'electricalService', label: 'Electrical service' },
  { name: 'fixtures', label: 'Fixtures' },
  { name: 'forkliftChargers', label: 'Forklift Chargers' },
  { name: 'switches', label: 'Switches' },
  { name: 'sensors', label: 'Sensors' },
  { name: 'breakerPanel', label: 'Breaker panel' },
  { name: 'grounding', label: 'Grounding' }
]

const HVAC_ITEMS = [
  { name: 'furnaces', label: 'Furnace(s)' },
  { name: 'condensers', label: 'Condenser(s)' },
  { name: 'hrv', label: 'HRV' },
  { name: 'packageRtu', label: 'Package RTU' },
  { name: 'fhu', label: 'FHU' },
  { name: 'rhu', label: 'RHU' },
  { name: 'mau', label: 'MAU' },
  { name: 'exhaustFans', label: 'Exhaust Fans' }
]

const BUILDING_ENVELOPE_ITEMS = [
  { name: 'walls', label: 'Walls' },
  { name: 'roof', label: 'Roof' },
  { name: 'foundation', label: 'Foundation' },
  { name: 'siding', label: 'Siding' },
  { name: 'soffits', label: 'Soffits' },
  { name: 'windows', label: 'Windows' },
  { name: 'doors', label: 'Doors' }
]

const OFFICE_INTERIOR_ITEMS = [
  { name: 'walls', label: 'Walls' },
  { name: 'ceilings', label: 'Ceilings' },
  { name: 'windows', label: 'Windows' },
  { name: 'doors', label: 'Doors' },
  { name: 'floors', label: 'Floors' }
]

const DOCK_INTERIOR_ITEMS = [
  { name: 'walls', label: 'Walls' },
  { name: 'ceilings', label: 'Ceilings' },
  { name: 'windows', label: 'Windows' },
  { name: 'manDoors', label: 'Man Doors' },
  { name: 'dockDoors', label: 'Dock Doors' },
  { name: 'dockPlates', label: 'Dock Plates' }
]

const LOCATIONS = [...TERMINALS, 'Other']

const FleetManagement = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 8
  const [photos, setPhotos] = useState({
    siteWork: [],
    plumbing: [],
    electrical: [],
    hvac: [],
    buildingEnvelope: [],
    officeInterior: [],
    dockInterior: []
  })
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const location = watch('location')

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo(0, 0)
    }
  }

  const setPhotoSection = (section) => (newPhotos) => {
    setPhotos(prev => ({ ...prev, [section]: newPhotos }))
  }

  const calculateSummary = (data) => {
    let good = 0, fair = 0, poor = 0, na = 0
    const sections = ['siteWork', 'plumbing', 'electrical', 'hvac', 'buildingEnvelope', 'officeInterior', 'dockInterior']

    sections.forEach(section => {
      if (data[section]) {
        Object.values(data[section]).forEach(value => {
          if (value === 'Good') good++
          else if (value === 'Fair') fair++
          else if (value === 'Poor') poor++
          else if (value === 'N/A') na++
        })
      }
    })

    return { good, fair, poor, na, total: good + fair + poor + na }
  }

  const onSubmit = async (data) => {
    if (!signature) {
      alert('Please provide your signature')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('FAC')
    const summary = calculateSummary(data)

    const formData = {
      ...data,
      photos,
      signature,
      summary,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/fleet-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Fleet Management Audit' }
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

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <FormSection title="Inspector Information">
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="First Name"
                name="firstName"
                register={register}
                errors={errors}
                required
              />
              <TextInput
                label="Last Name"
                name="lastName"
                register={register}
                errors={errors}
                required
              />
            </div>
            <TextInput
              label="Email"
              name="email"
              type="email"
              register={register}
              errors={errors}
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
            <SelectInput
              label="Location"
              name="location"
              register={register}
              errors={errors}
              options={LOCATIONS}
              required
            />
            {location === 'Other' && (
              <TextInput
                label="Other Location"
                name="otherLocation"
                register={register}
                errors={errors}
                required
              />
            )}
          </FormSection>
        )
      case 2:
        return (
          <FormSection title="Site Work">
            <div className="bg-white rounded-lg p-4">
              {SITE_WORK_ITEMS.map(item => (
                <RatingItem
                  key={item.name}
                  label={item.label}
                  name={`siteWork.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <PhotoUpload
              label="Site Work Photos"
              name="siteWorkPhotos"
              photos={photos.siteWork}
              setPhotos={setPhotoSection('siteWork')}
              maxPhotos={6}
            />
            <TextArea
              label="Comments"
              name="siteWorkComments"
              register={register}
              errors={errors}
              rows={3}
            />
          </FormSection>
        )
      case 3:
        return (
          <FormSection title="Plumbing">
            <div className="bg-white rounded-lg p-4">
              {PLUMBING_ITEMS.map(item => (
                <RatingItem
                  key={item.name}
                  label={item.label}
                  name={`plumbing.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <PhotoUpload
              label="Plumbing Photos"
              name="plumbingPhotos"
              photos={photos.plumbing}
              setPhotos={setPhotoSection('plumbing')}
              maxPhotos={6}
            />
            <TextArea
              label="Comments"
              name="plumbingComments"
              register={register}
              errors={errors}
              rows={3}
            />
          </FormSection>
        )
      case 4:
        return (
          <FormSection title="Electrical Systems">
            <div className="bg-white rounded-lg p-4">
              {ELECTRICAL_ITEMS.map(item => (
                <RatingItem
                  key={item.name}
                  label={item.label}
                  name={`electrical.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <PhotoUpload
              label="Electrical Photos"
              name="electricalPhotos"
              photos={photos.electrical}
              setPhotos={setPhotoSection('electrical')}
              maxPhotos={6}
            />
            <TextArea
              label="Comments"
              name="electricalComments"
              register={register}
              errors={errors}
              rows={3}
            />
          </FormSection>
        )
      case 5:
        return (
          <FormSection title="HVAC Systems">
            <div className="bg-white rounded-lg p-4">
              {HVAC_ITEMS.map(item => (
                <RatingItem
                  key={item.name}
                  label={item.label}
                  name={`hvac.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <PhotoUpload
              label="HVAC Photos"
              name="hvacPhotos"
              photos={photos.hvac}
              setPhotos={setPhotoSection('hvac')}
              maxPhotos={6}
            />
            <TextArea
              label="Comments"
              name="hvacComments"
              register={register}
              errors={errors}
              rows={3}
            />
          </FormSection>
        )
      case 6:
        return (
          <FormSection title="Building Envelope">
            <div className="bg-white rounded-lg p-4">
              {BUILDING_ENVELOPE_ITEMS.map(item => (
                <RatingItem
                  key={item.name}
                  label={item.label}
                  name={`buildingEnvelope.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <PhotoUpload
              label="Building Envelope Photos"
              name="buildingEnvelopePhotos"
              photos={photos.buildingEnvelope}
              setPhotos={setPhotoSection('buildingEnvelope')}
              maxPhotos={6}
            />
            <TextArea
              label="Comments"
              name="buildingEnvelopeComments"
              register={register}
              errors={errors}
              rows={3}
            />
          </FormSection>
        )
      case 7:
        return (
          <FormSection title="Office Interior">
            <div className="bg-white rounded-lg p-4">
              {OFFICE_INTERIOR_ITEMS.map(item => (
                <RatingItem
                  key={item.name}
                  label={item.label}
                  name={`officeInterior.${item.name}`}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <PhotoUpload
              label="Office Interior Photos"
              name="officeInteriorPhotos"
              photos={photos.officeInterior}
              setPhotos={setPhotoSection('officeInterior')}
              maxPhotos={6}
            />
            <TextArea
              label="Comments"
              name="officeInteriorComments"
              register={register}
              errors={errors}
              rows={3}
            />
          </FormSection>
        )
      case 8:
        return (
          <>
            <FormSection title="Dock Interior">
              <div className="bg-white rounded-lg p-4">
                {DOCK_INTERIOR_ITEMS.map(item => (
                  <RatingItem
                    key={item.name}
                    label={item.label}
                    name={`dockInterior.${item.name}`}
                    register={register}
                    errors={errors}
                  />
                ))}
              </div>
              <PhotoUpload
                label="Dock Interior Photos"
                name="dockInteriorPhotos"
                photos={photos.dockInterior}
                setPhotos={setPhotoSection('dockInterior')}
                maxPhotos={6}
              />
              <TextArea
                label="Comments"
                name="dockInteriorComments"
                register={register}
                errors={errors}
                rows={3}
              />
            </FormSection>

            <FormSection title="Signature">
              <SignaturePad
                label="Inspector Signature"
                signature={signature}
                setSignature={setSignature}
                required
              />
            </FormSection>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <FormHeader title="Fleet Management Audit" gradient="from-rose-500 to-rose-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        {renderPage()}

        <FormNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isSubmitting={isSubmitting}
          canSubmit={currentPage === totalPages}
        />
      </FormContainer>
    </div>
  )
}

export default FleetManagement
