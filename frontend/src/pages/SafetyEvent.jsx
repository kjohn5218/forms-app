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
  RadioGroup,
  CheckboxGroup,
  PhotoUpload,
  SubmitButton,
  TERMINALS,
  getTodayDate,
  getCurrentTime,
  generateFormId
} from '../components/FormComponents'

const EVENT_TYPES = [
  'Dock Incident',
  'DOT Inspection',
  'Hazardous materials spilled',
  'Illness or injury to self',
  'Injuries to others involved',
  'Law enforcement or emergency services called',
  'Property damage (other than vehicles)',
  'Other vehicles involved',
  'Vehicle(s) towed',
  'Other'
]

const EVENT_LOCATIONS = ['Terminal', 'Other']

const VEHICLE_DAMAGE_OPTIONS = ['Tractor/Power Unit', 'Trailer 1', 'Trailer 2']

const PACKAGING_DESCRIPTIONS = [
  'Drum',
  'Cylinder',
  'Carton',
  'Pail',
  'Tote',
  'Tank',
  'Other'
]

const DOT_INSPECTION_LEVELS = ['Level I', 'Level II', 'Level III']

const CHARACTER_OF_ROAD = ['Straight', 'Curve', 'Level', 'Grade', 'Hill crest']

const ROAD_SURFACE_CONDITIONS = [
  'Dry', 'Wet', 'Muddy', 'Snowy', 'Icy', 'Concrete', 'Blacktop', 'Gravel', 'Other'
]

const WEATHER_CONDITIONS = [
  'Clear/Dry', 'Clear/Wet', 'Snow/Ice', 'High Wind', 'Raining', 'Fog', 'Overcast'
]

const LIGHT_CONDITIONS = ['Daylight', 'Dark', 'Dusk', 'Dawn', 'Street Lights']

const CONTROL_DEVICES = ['None', 'Signal', 'Stop Sign', 'Work Zone', 'Other']

const COLLISION_TYPES = [
  'Hit Stationary Object', 'Rear End', 'Intersection/Turning', 'Loss of Control/Jack-knife',
  'Loss of Control/Sideswipe', 'Head-on', 'Cargo Related', 'Animal Strike'
]

const HIGHWAY_TYPES = [
  'Interstate', '4-Lane', '2-Lane', 'Intersection', 'Non-Highway (Other)', 'Terminal Yard', 'Dock'
]

const SPEED_OPTIONS = [
  'Parked/Stopped', 'Less than 25 mph', '25-35 mph', '36-45 mph',
  '45-55 mph', '56-65 mph', '66-75 mph', '76+ mph'
]

const EMPLOYEE_DEPARTMENTS = [
  'Driving', 'Dock', 'Office', 'Maintenance', 'Management', 'Other'
]

const WORK_STATUS_OPTIONS = ['Full-time', 'Part-time', 'Temporary', 'Seasonal']

const WORK_DAY_PARTS = [
  'Entering or leaving work', 'During normal work activities', 'During break',
  'During meal period', 'Working overtime', 'Other'
]

const BODY_AREAS_FRONT = [
  { value: '1', label: 'Head (Left Front)' },
  { value: '2', label: 'Head (Right Front)' },
  { value: '3', label: 'Neck (Front)' },
  { value: '4', label: 'Right Shoulder/Chest' },
  { value: '5', label: 'Left Shoulder/Chest' },
  { value: '6', label: 'Right Upper Arm' },
  { value: '7', label: 'Left Upper Arm' },
  { value: '8', label: 'Right Forearm' },
  { value: '9', label: 'Left Forearm' },
  { value: '10', label: 'Right Hand' },
  { value: '11', label: 'Left Hand' },
  { value: '12', label: 'Right Upper Abdomen' },
  { value: '13', label: 'Left Upper Abdomen' },
  { value: '14', label: 'Right Lower Abdomen' },
  { value: '15', label: 'Left Lower Abdomen' },
  { value: '16', label: 'Groin' },
  { value: '17', label: 'Right Upper Leg' },
  { value: '18', label: 'Left Upper Leg' },
  { value: '19', label: 'Right Lower Leg' },
  { value: '20', label: 'Left Lower Leg' },
  { value: '21', label: 'Right Foot' },
  { value: '22', label: 'Left Foot' }
]

const BODY_AREAS_BACK = [
  { value: '23', label: 'Head (Left Back)' },
  { value: '24', label: 'Head (Right Back)' },
  { value: '25', label: 'Neck (Back)' },
  { value: '26', label: 'Right Shoulder (Back)' },
  { value: '27', label: 'Left Shoulder (Back)' },
  { value: '28', label: 'Right Upper Arm (Back)' },
  { value: '29', label: 'Left Upper Arm (Back)' },
  { value: '30', label: 'Right Forearm (Back)' },
  { value: '31', label: 'Left Forearm (Back)' },
  { value: '32', label: 'Right Hand (Back)' },
  { value: '33', label: 'Left Hand (Back)' },
  { value: '34', label: 'Upper Back (Right)' },
  { value: '35', label: 'Upper Back (Left)' },
  { value: '36', label: 'Mid Back (Right)' },
  { value: '37', label: 'Mid Back (Left)' },
  { value: '38', label: 'Right Buttock' },
  { value: '39', label: 'Left Buttock' },
  { value: '40', label: 'Right Upper Leg (Back)' },
  { value: '41', label: 'Left Upper Leg (Back)' },
  { value: '42', label: 'Right Lower Leg (Back)' },
  { value: '43', label: 'Left Lower Leg (Back)' },
  { value: '44', label: 'Right Heel' },
  { value: '45', label: 'Left Heel' }
]

const INJURY_NATURE = [
  'Abrasions, Scrapes', 'Broken bone', 'Bruise', 'Burn (Heat)', 'Burn (Chemical)',
  'Concussion (to the head)', 'Crushing injury', 'Cut, laceration, puncture',
  'Hernia', 'Illness', 'Sprain, Strain', 'Damage to a body system', 'Other'
]

const UNSAFE_CONDITIONS = [
  'Safety device is defective', 'Tool or equipment defective', 'Insufficient lighting',
  'Insufficient ventilation', 'Lack of needed personal protective equipment',
  'Lack of appropriate equipment/Tools', 'Unsafe clothing',
  'No training or insufficient training', 'Other'
]

const UNSAFE_ACTS = [
  'Operating without permission', 'Operating at unsafe speed', 'Using defective equipment',
  'Using equipment in an unapproved way', 'Unsafe lifting', 'Taking an unsafe position or posture',
  'Distraction, teasing, horseplay', 'Failure to wear personal protective equipment',
  'Failure to use available equipment/Tools', 'Other'
]

const SafetyEvent = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [dotPhotos, setDotPhotos] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      dateOfEvent: getTodayDate(),
      timeOfEvent: getCurrentTime()
    }
  })

  const eventTypes = watch('eventTypes') || []
  const eventLocation = watch('eventLocation')
  const supervisorContacted = watch('supervisorContacted')
  const soughtMedicalTreatment = watch('soughtMedicalTreatment')
  const factorsEncouraged = watch('factorsEncouraged')

  // Helper to check if array includes a value (handles both array and single value)
  const hasEventType = (type) => Array.isArray(eventTypes) ? eventTypes.includes(type) : eventTypes === type

  // Event type checks
  const hasDockIncident = hasEventType('Dock Incident')
  const hasDOTInspection = hasEventType('DOT Inspection')
  const hasHazmat = hasEventType('Hazardous materials spilled')
  const hasInjury = hasEventType('Illness or injury to self')
  const hasInjuriesToOthers = hasEventType('Injuries to others involved')
  const hasLawEnforcement = hasEventType('Law enforcement or emergency services called')
  const hasPropertyDamage = hasEventType('Property damage (other than vehicles)')
  const hasOtherVehicles = hasEventType('Other vehicles involved')
  const hasVehicleTowed = hasEventType('Vehicle(s) towed')
  const hasOther = hasEventType('Other')

  // Additional watched fields for conditional logic
  const isDriverOwner = watch('isDriverOwner')
  const leftWorkDueToInjury = watch('leftWorkDueToInjury')
  const unsafeConditions = watch('unsafeConditions') || []
  const unsafeActs = watch('unsafeActs') || []

  // Show Company Vehicle Information - shown for vehicle-related events
  // Per screenshots: Law enforcement, Other vehicles, Vehicle towed, Property damage, Injuries to others, DOT Inspection
  const showVehicleInfo = hasLawEnforcement || hasOtherVehicles || hasVehicleTowed ||
    hasPropertyDamage || hasInjuriesToOthers || hasDOTInspection

  // Show Other Vehicle (#2) Information - shown for law enforcement, other vehicles, vehicle towed, OR injuries to others
  const showOtherVehicleInfo = hasLawEnforcement || hasOtherVehicles || hasVehicleTowed || hasInjuriesToOthers

  // Show Shipment Information (Pro Number, Shipper Name) - shown for Hazardous materials
  const showShipmentInfo = hasHazmat

  // Show Witness Information - shown for ALL event types including Dock Incident
  // Per screenshot: Dock Incident shows Witness Info
  const showWitnessInfo = hasDockIncident || hasLawEnforcement || hasInjury || hasInjuriesToOthers ||
    hasPropertyDamage || hasOtherVehicles || hasVehicleTowed || hasOther || hasDOTInspection || hasHazmat

  // Show Scene Conditions (Analysis) - for vehicle/accident related events
  // Per screenshots: Law enforcement, Other vehicles, Vehicle towed, Other, Property damage, Injuries to others
  // NOT shown for: Dock Incident alone, Illness/injury to self alone, DOT Inspection alone, Hazmat alone
  const showSceneConditions = hasLawEnforcement || hasOtherVehicles || hasVehicleTowed ||
    hasOther || hasPropertyDamage || hasInjuriesToOthers

  // Show Incident Description - shown for ALL event types including Dock Incident
  // Per screenshot: Dock Incident shows Incident Description
  const showIncidentDescription = hasDockIncident || hasLawEnforcement || hasInjury || hasInjuriesToOthers ||
    hasOtherVehicles || hasPropertyDamage || hasVehicleTowed || hasOther || hasDOTInspection || hasHazmat

  // Show Event Evaluation section - only for injury events
  const showEventEvaluation = hasInjury || hasInjuriesToOthers

  // Show "Why did unsafe conditions/acts exist?" - only when unsafe conditions or acts are selected
  const hasUnsafeConditionsSelected = Array.isArray(unsafeConditions) && unsafeConditions.length > 0
  const hasUnsafeActsSelected = Array.isArray(unsafeActs) && unsafeActs.length > 0
  const showWhyUnsafe = hasUnsafeConditionsSelected || hasUnsafeActsSelected

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('SAF')

    const formData = {
      ...data,
      photos,
      dotPhotos,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/safety-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Safety Event Report' }
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
      <FormHeader title="Safety Event Report" gradient="from-red-500 to-red-600" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        {/* Employee/Contractor Information */}
        <FormSection title="Employee/Contractor Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            label="Employee Number (If applicable)"
            name="employeeNumber"
            register={register}
            errors={errors}
          />
          <TextInput
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            register={register}
            errors={errors}
            required
            placeholder="Please enter a valid phone number"
          />
        </FormSection>

        {/* Event Information */}
        <FormSection title="Event Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label="Date of Event"
              name="dateOfEvent"
              register={register}
              errors={errors}
              required
            />
            <TimeInput
              label="Time of Event"
              name="timeOfEvent"
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
          <RadioGroup
            label="Event Location"
            name="eventLocation"
            register={register}
            errors={errors}
            options={EVENT_LOCATIONS}
            required
          />
          {eventLocation === 'Other' && (
            <TextInput
              label="Specify Location"
              name="otherLocation"
              register={register}
              errors={errors}
              required
            />
          )}
        </FormSection>

        {/* Event Type Selection */}
        <FormSection title="Please check all that apply">
          <CheckboxGroup
            label="Event Types"
            name="eventTypes"
            register={register}
            options={EVENT_TYPES}
          />
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium text-sm">
              If you were injured and physically able please work with your supervisor to complete
              your state required first report of injury within 12 hours of the event.
            </p>
          </div>
        </FormSection>

        {/* Vehicle Information - Conditional */}
        {showVehicleInfo && (
          <FormSection title="Company Vehicle Information">
            <TextInput
              label="Tractor Number (Power Unit)"
              name="tractorNumber"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Trailer Number (Trailer 1)"
              name="trailerNumber"
              register={register}
              errors={errors}
            />
            <RadioGroup
              label="Vehicle towed from scene"
              name="vehicleTowed"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
            <CheckboxGroup
              label="Vehicle Damage"
              name="vehicleDamage"
              register={register}
              options={VEHICLE_DAMAGE_OPTIONS}
            />
            <TextInput
              label="Vehicle can be seen at"
              name="vehicleLocation"
              register={register}
              errors={errors}
            />
          </FormSection>
        )}

        {/* Shipment Information - Conditional (for Hazmat) */}
        {showShipmentInfo && (
          <FormSection title="Shipment Information">
            <TextInput
              label="Pro Number"
              name="proNumber"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Shipper Name"
              name="shipperName"
              register={register}
              errors={errors}
            />
          </FormSection>
        )}

        {/* Hazardous Materials Section - Conditional */}
        {hasHazmat && (
          <FormSection title="Hazardous Materials Information">
            <TextInput
              label="ID Number"
              name="hazmatIdNumber"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Proper Shipping Name"
              name="properShippingName"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Technical Name"
              name="technicalName"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Hazard Class"
              name="hazardClass"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Packaging Group"
              name="packagingGroup"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Quantity Released (Be as specific as you can. Include unit of measure.)"
              name="quantityReleased"
              register={register}
              errors={errors}
            />
            <SelectInput
              label="Packaging Description"
              name="packagingDescription"
              register={register}
              errors={errors}
              options={PACKAGING_DESCRIPTIONS}
            />
          </FormSection>
        )}

        {/* Supervisor Contact */}
        <FormSection title="Supervisor Contact">
          <RadioGroup
            label="Was the supervisor or manager immediately contacted?"
            name="supervisorContacted"
            register={register}
            errors={errors}
            options={['Yes', 'No']}
            required
          />
          {supervisorContacted === 'Yes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Supervisor First Name"
                name="supervisorFirstName"
                register={register}
                errors={errors}
              />
              <TextInput
                label="Supervisor Last Name"
                name="supervisorLastName"
                register={register}
                errors={errors}
              />
            </div>
          )}
          {supervisorContacted === 'No' && (
            <TextArea
              label="Please explain why the supervisor or manager was not immediately contacted"
              name="supervisorNotContactedReason"
              register={register}
              errors={errors}
              required
              rows={3}
            />
          )}
          <RadioGroup
            label="Did the supervisor or manager contact CURA?"
            name="curaContacted"
            register={register}
            errors={errors}
            options={['Yes', 'No', 'Unknown']}
          />
        </FormSection>

        {/* DOT Inspection Section - Conditional */}
        {hasDOTInspection && (
          <FormSection title="DOT Inspection Details">
            <RadioGroup
              label="DOT Inspection Level"
              name="dotInspectionLevel"
              register={register}
              errors={errors}
              options={DOT_INSPECTION_LEVELS}
              required
            />
            <TextInput
              label="# of Violations"
              name="numberOfViolations"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <RadioGroup
              label="Was the driver or equipment placed Out of Service at the time of inspection?"
              name="outOfService"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
              required
            />
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium text-sm">
                Photograph each page of the DOT inspection with the zoom capturing only the page so it
                can be read when submitted. The original inspection must be turned into the terminal
                manager and submitted to the safety department.
              </p>
            </div>
            <PhotoUpload
              label="DOT Inspection Photos"
              name="dotPhotos"
              photos={dotPhotos}
              setPhotos={setDotPhotos}
              maxPhotos={10}
            />
          </FormSection>
        )}

        {/* Other Vehicle Information - Conditional */}
        {showOtherVehicleInfo && (
          <FormSection title="Other Vehicle (#2) Information">
            <TextInput
              label="Vehicle #2 Make/Model"
              name="vehicle2MakeModel"
              register={register}
              errors={errors}
            />
            <TextInput
              label="License # and State"
              name="vehicle2License"
              register={register}
              errors={errors}
            />
            <TextInput
              label="VIN #"
              name="vehicle2Vin"
              register={register}
              errors={errors}
            />
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Driver Information</h4>
            <TextInput
              label="Driver Name"
              name="vehicle2DriverName"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Driver License #"
              name="vehicle2DriverLicense"
              register={register}
              errors={errors}
            />
            <TextInput
              label="State"
              name="vehicle2DriverState"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Driver Phone Number"
              name="vehicle2DriverPhone"
              type="tel"
              register={register}
              errors={errors}
            />
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Driver Address</h4>
            <TextInput
              label="Street Address"
              name="vehicle2DriverStreet"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Street Address Line 2"
              name="vehicle2DriverStreet2"
              register={register}
              errors={errors}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="City"
                name="vehicle2DriverCity"
                register={register}
                errors={errors}
              />
              <TextInput
                label="State/Province"
                name="vehicle2DriverStateProvince"
                register={register}
                errors={errors}
              />
              <TextInput
                label="Postal/Zip Code"
                name="vehicle2DriverZip"
                register={register}
                errors={errors}
              />
            </div>
            <TextInput
              label="Insurance Company"
              name="vehicle2InsuranceCompany"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Insurance Policy #"
              name="vehicle2InsurancePolicy"
              register={register}
              errors={errors}
            />
            <RadioGroup
              label="Is the driver the vehicle owner?"
              name="isDriverOwner"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
            {isDriverOwner === 'No' && (
              <>
                <h4 className="font-medium text-gray-700 mt-4 mb-2">Vehicle #2 Owner Information</h4>
                <TextInput
                  label="Owner/Company Name"
                  name="vehicle2OwnerName"
                  register={register}
                  errors={errors}
                />
                <TextInput
                  label="Owner Phone Number"
                  name="vehicle2OwnerPhone"
                  type="tel"
                  register={register}
                  errors={errors}
                />
                <TextInput
                  label="Owner Street Address"
                  name="vehicle2OwnerStreet"
                  register={register}
                  errors={errors}
                />
              </>
            )}
          </FormSection>
        )}

        {/* Property Damage Section - Conditional */}
        {hasPropertyDamage && (
          <FormSection title="Property Damage Information">
            <TextInput
              label="Property Owner"
              name="propertyOwner"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Phone #"
              name="propertyOwnerPhone"
              type="tel"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Insurance Company"
              name="propertyInsuranceCompany"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Insurance Policy #"
              name="propertyInsurancePolicy"
              register={register}
              errors={errors}
            />
            <TextArea
              label="Property Damage - Describe Damage"
              name="propertyDamageDescription"
              register={register}
              errors={errors}
              rows={4}
            />
          </FormSection>
        )}

        {/* Witness Information - Conditional */}
        {showWitnessInfo && (
          <FormSection title="Witness Information">
            <TextInput
              label="Witness"
              name="witnessName"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Witness Phone"
              name="witnessPhone"
              type="tel"
              register={register}
              errors={errors}
            />
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Address</h4>
            <TextInput
              label="Street Address"
              name="witnessStreet"
              register={register}
              errors={errors}
            />
            <TextInput
              label="Street Address Line 2"
              name="witnessStreet2"
              register={register}
              errors={errors}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="City"
                name="witnessCity"
                register={register}
                errors={errors}
              />
              <TextInput
                label="State/Province"
                name="witnessState"
                register={register}
                errors={errors}
              />
              <TextInput
                label="Postal/Zip Code"
                name="witnessZip"
                register={register}
                errors={errors}
              />
            </div>
          </FormSection>
        )}

        {/* Road and Scene Conditions - Conditional */}
        {showSceneConditions && (
          <FormSection title="Analysis">
            <CheckboxGroup
              label="Character of Road"
              name="characterOfRoad"
              register={register}
              options={CHARACTER_OF_ROAD}
            />
            <CheckboxGroup
              label="Road Surface Condition"
              name="roadSurfaceCondition"
              register={register}
              options={ROAD_SURFACE_CONDITIONS}
            />
            <CheckboxGroup
              label="Weather"
              name="weather"
              register={register}
              options={WEATHER_CONDITIONS}
            />
            <CheckboxGroup
              label="Light"
              name="lightConditions"
              register={register}
              options={LIGHT_CONDITIONS}
            />
            <CheckboxGroup
              label="Control Device"
              name="controlDevice"
              register={register}
              options={CONTROL_DEVICES}
            />
            <CheckboxGroup
              label="Type of Collision"
              name="collisionType"
              register={register}
              options={COLLISION_TYPES}
            />
            <CheckboxGroup
              label="Highway Type"
              name="highwayType"
              register={register}
              options={HIGHWAY_TYPES}
            />
            <RadioGroup
              label="Speed at the time of event"
              name="speedAtEvent"
              register={register}
              errors={errors}
              options={SPEED_OPTIONS}
            />
          </FormSection>
        )}

        {/* Incident Description - Conditional */}
        {showIncidentDescription && (
          <FormSection title="Incident Description">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                Please provide a detailed description of what occurred (include people, equipment type,
                how the incident occurred, if any reckless behavior was observed, how hazardous materials
                were cleaned up, etc. Be as detailed as possible).
              </p>
            </div>
            <TextArea
              label="Employee Written Statement (or record statement below)"
              name="employeeStatement"
              register={register}
              errors={errors}
              required
              rows={6}
              minLength={50}
              placeholder="Please provide a detailed description of the event..."
            />
          </FormSection>
        )}

        {/* Photos - Conditional */}
        {showIncidentDescription && (
          <FormSection title="Photos">
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 text-sm">
                Document any vehicle or property damage, along with scene and company equipment involved.
                A minimum of five photos are required.
              </p>
            </div>
            <PhotoUpload
              label="Event Photos"
              name="photos"
              photos={photos}
              setPhotos={setPhotos}
              maxPhotos={20}
            />
          </FormSection>
        )}

        {/* First Report of Injury - Conditional */}
        {hasInjury && (
          <>
            <FormSection title="First Report of Injury">
              <RadioGroup
                label="Employee Sex"
                name="employeeSex"
                register={register}
                errors={errors}
                options={['Male', 'Female']}
              />
              <SelectInput
                label="Employee Department"
                name="employeeDepartment"
                register={register}
                errors={errors}
                options={EMPLOYEE_DEPARTMENTS}
              />
              <SelectInput
                label="This employee works"
                name="employeeWorkStatus"
                register={register}
                errors={errors}
                options={WORK_STATUS_OPTIONS}
              />
              <TextInput
                label="Employee months with this employer"
                name="monthsWithEmployer"
                type="number"
                register={register}
                errors={errors}
              />
              <TextInput
                label="Employee Job Title at Time of Event"
                name="jobTitleAtEvent"
                register={register}
                errors={errors}
              />
              <TextInput
                label="Employee months in this job"
                name="monthsInJob"
                type="number"
                register={register}
                errors={errors}
              />
              <RadioGroup
                label="During what part of the employee's work day did the event occur?"
                name="workDayPart"
                register={register}
                errors={errors}
                options={WORK_DAY_PARTS}
              />
            </FormSection>

            {/* Body Diagram Section */}
            <FormSection title="Body Areas Affected">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Please select all areas of the body affected. Refer to the body diagram where
                  areas 1-22 are the front of the body and areas 23-45 are the back.
                </p>
              </div>

              {/* Body Diagram Visual Reference */}
              <div className="mb-6 flex flex-col md:flex-row gap-8 justify-center">
                <div className="text-center">
                  <h4 className="font-medium text-gray-700 mb-2">Front View</h4>
                  <div className="inline-block bg-gray-100 p-4 rounded-lg">
                    <svg viewBox="0 0 200 400" className="w-48 h-96">
                      {/* Head */}
                      <ellipse cx="100" cy="30" rx="25" ry="30" fill="#e5e7eb" stroke="#9ca3af" />
                      <line x1="100" y1="0" x2="100" y2="60" stroke="#9ca3af" strokeDasharray="2,2" />
                      <text x="85" y="25" fontSize="10" fill="#6b7280">1</text>
                      <text x="105" y="25" fontSize="10" fill="#6b7280">2</text>
                      {/* Neck */}
                      <rect x="90" y="55" width="20" height="15" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="95" y="67" fontSize="8" fill="#6b7280">3</text>
                      {/* Torso */}
                      <rect x="55" y="70" width="45" height="50" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="100" y="70" width="45" height="50" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="72" y="95" fontSize="10" fill="#6b7280">4</text>
                      <text x="117" y="95" fontSize="10" fill="#6b7280">5</text>
                      {/* Arms */}
                      <rect x="20" y="75" width="35" height="45" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="145" y="75" width="35" height="45" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="32" y="100" fontSize="10" fill="#6b7280">6</text>
                      <text x="157" y="100" fontSize="10" fill="#6b7280">7</text>
                      {/* Forearms */}
                      <rect x="15" y="120" width="30" height="50" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="155" y="120" width="30" height="50" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="25" y="148" fontSize="10" fill="#6b7280">8</text>
                      <text x="165" y="148" fontSize="10" fill="#6b7280">9</text>
                      {/* Hands */}
                      <rect x="10" y="170" width="25" height="30" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="165" y="170" width="25" height="30" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="17" y="188" fontSize="8" fill="#6b7280">10</text>
                      <text x="172" y="188" fontSize="8" fill="#6b7280">11</text>
                      {/* Mid torso */}
                      <rect x="55" y="120" width="45" height="35" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="100" y="120" width="45" height="35" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="70" y="140" fontSize="8" fill="#6b7280">12</text>
                      <text x="115" y="140" fontSize="8" fill="#6b7280">13</text>
                      {/* Lower torso */}
                      <rect x="55" y="155" width="45" height="35" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="100" y="155" width="45" height="35" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="70" y="175" fontSize="8" fill="#6b7280">14</text>
                      <text x="115" y="175" fontSize="8" fill="#6b7280">15</text>
                      {/* Groin */}
                      <rect x="75" y="190" width="50" height="25" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="93" y="207" fontSize="8" fill="#6b7280">16</text>
                      {/* Upper legs */}
                      <rect x="55" y="215" width="45" height="70" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="100" y="215" width="45" height="70" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="70" y="255" fontSize="8" fill="#6b7280">17</text>
                      <text x="115" y="255" fontSize="8" fill="#6b7280">18</text>
                      {/* Lower legs */}
                      <rect x="55" y="285" width="45" height="70" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="100" y="285" width="45" height="70" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="70" y="325" fontSize="8" fill="#6b7280">19</text>
                      <text x="115" y="325" fontSize="8" fill="#6b7280">20</text>
                      {/* Feet */}
                      <rect x="50" y="355" width="50" height="25" fill="#e5e7eb" stroke="#9ca3af" />
                      <rect x="100" y="355" width="50" height="25" fill="#e5e7eb" stroke="#9ca3af" />
                      <text x="68" y="372" fontSize="8" fill="#6b7280">21</text>
                      <text x="118" y="372" fontSize="8" fill="#6b7280">22</text>
                    </svg>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-medium text-gray-700 mb-2">Back View</h4>
                  <div className="inline-block bg-gray-100 p-4 rounded-lg">
                    <svg viewBox="0 0 200 400" className="w-48 h-96">
                      {/* Head */}
                      <ellipse cx="100" cy="30" rx="25" ry="30" fill="#d1d5db" stroke="#9ca3af" />
                      <line x1="100" y1="0" x2="100" y2="60" stroke="#9ca3af" strokeDasharray="2,2" />
                      <text x="82" y="25" fontSize="8" fill="#6b7280">23</text>
                      <text x="105" y="25" fontSize="8" fill="#6b7280">24</text>
                      {/* Neck */}
                      <rect x="90" y="55" width="20" height="15" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="93" y="67" fontSize="8" fill="#6b7280">25</text>
                      {/* Shoulders */}
                      <rect x="55" y="70" width="45" height="30" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="70" width="45" height="30" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="70" y="90" fontSize="8" fill="#6b7280">26</text>
                      <text x="115" y="90" fontSize="8" fill="#6b7280">27</text>
                      {/* Upper arms */}
                      <rect x="20" y="75" width="35" height="45" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="145" y="75" width="35" height="45" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="30" y="100" fontSize="8" fill="#6b7280">28</text>
                      <text x="155" y="100" fontSize="8" fill="#6b7280">29</text>
                      {/* Forearms */}
                      <rect x="15" y="120" width="30" height="50" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="155" y="120" width="30" height="50" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="23" y="148" fontSize="8" fill="#6b7280">30</text>
                      <text x="163" y="148" fontSize="8" fill="#6b7280">31</text>
                      {/* Hands */}
                      <rect x="10" y="170" width="25" height="30" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="165" y="170" width="25" height="30" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="15" y="188" fontSize="8" fill="#6b7280">32</text>
                      <text x="170" y="188" fontSize="8" fill="#6b7280">33</text>
                      {/* Upper back */}
                      <rect x="55" y="100" width="45" height="40" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="100" width="45" height="40" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="70" y="125" fontSize="8" fill="#6b7280">34</text>
                      <text x="115" y="125" fontSize="8" fill="#6b7280">35</text>
                      {/* Mid back */}
                      <rect x="55" y="140" width="45" height="40" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="140" width="45" height="40" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="70" y="165" fontSize="8" fill="#6b7280">36</text>
                      <text x="115" y="165" fontSize="8" fill="#6b7280">37</text>
                      {/* Buttocks */}
                      <rect x="55" y="180" width="45" height="40" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="180" width="45" height="40" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="70" y="205" fontSize="8" fill="#6b7280">38</text>
                      <text x="115" y="205" fontSize="8" fill="#6b7280">39</text>
                      {/* Upper legs back */}
                      <rect x="55" y="220" width="45" height="70" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="220" width="45" height="70" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="70" y="260" fontSize="8" fill="#6b7280">40</text>
                      <text x="115" y="260" fontSize="8" fill="#6b7280">41</text>
                      {/* Lower legs back */}
                      <rect x="55" y="290" width="45" height="70" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="290" width="45" height="70" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="70" y="330" fontSize="8" fill="#6b7280">42</text>
                      <text x="115" y="330" fontSize="8" fill="#6b7280">43</text>
                      {/* Heels */}
                      <rect x="50" y="360" width="50" height="25" fill="#d1d5db" stroke="#9ca3af" />
                      <rect x="100" y="360" width="50" height="25" fill="#d1d5db" stroke="#9ca3af" />
                      <text x="68" y="377" fontSize="8" fill="#6b7280">44</text>
                      <text x="118" y="377" fontSize="8" fill="#6b7280">45</text>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Front (Areas 1-22)</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {BODY_AREAS_FRONT.map((area) => (
                      <label key={area.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          value={area.value}
                          {...register('bodyAreasFront')}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Area {area.value}:</span> {area.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Back (Areas 23-45)</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {BODY_AREAS_BACK.map((area) => (
                      <label key={area.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          value={area.value}
                          {...register('bodyAreasBack')}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Area {area.value}:</span> {area.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Nature of Injury */}
            <FormSection title="Nature of Injury">
              <CheckboxGroup
                label="Nature of the injury (most serious one)"
                name="injuryNature"
                register={register}
                options={INJURY_NATURE}
              />
            </FormSection>
          </>
        )}

        {/* Event Evaluation - Conditional (for injuries) */}
        {showEventEvaluation && (
          <FormSection title="Event Evaluation">
            <CheckboxGroup
              label="Unsafe work condition(s) (Check all that apply)"
              name="unsafeConditions"
              register={register}
              options={UNSAFE_CONDITIONS}
            />
            <CheckboxGroup
              label="Unsafe act(s) by people (Check all that apply)"
              name="unsafeActs"
              register={register}
              options={UNSAFE_ACTS}
            />
            {/* Show these fields only when unsafe conditions or acts are selected */}
            {showWhyUnsafe && (
              <>
                <TextArea
                  label="Why did the unsafe conditions/acts exist?"
                  name="whyUnsafeExist"
                  register={register}
                  errors={errors}
                  rows={4}
                />
                <RadioGroup
                  label='Are there factors (such as "the job can be done more quickly" or "the product is less likely to be damaged") that may have encouraged the unsafe conditions or acts?'
                  name="factorsEncouraged"
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
                {factorsEncouraged === 'Yes' && (
                  <TextArea
                    label="Please describe"
                    name="factorsDescription"
                    register={register}
                    errors={errors}
                    rows={3}
                  />
                )}
                <RadioGroup
                  label="Were the unsafe acts or conditions reported prior to the event?"
                  name="priorReported"
                  register={register}
                  errors={errors}
                  options={['Yes', 'No', 'Unknown']}
                />
                <RadioGroup
                  label="Have there been similar events or near misses prior to this one?"
                  name="similarEventsPrior"
                  register={register}
                  errors={errors}
                  options={['Yes', 'No', 'Unknown']}
                />
              </>
            )}
          </FormSection>
        )}

        {/* Treatment Information - Conditional */}
        {hasInjury && (
          <FormSection title="Treatment Information">
            <RadioGroup
              label="Did the injured employee seek medical treatment?"
              name="soughtMedicalTreatment"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
            {soughtMedicalTreatment === 'Yes' && (
              <>
                <TextInput
                  label="Where did the employee go for treatment?"
                  name="treatmentLocation"
                  register={register}
                  errors={errors}
                />
                <TextInput
                  label="Medical Facility Name"
                  name="medicalFacilityName"
                  register={register}
                  errors={errors}
                />
                <TextInput
                  label="Medical Facility Address"
                  name="medicalFacilityAddress"
                  register={register}
                  errors={errors}
                />
              </>
            )}
            {soughtMedicalTreatment === 'No' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Refusal of Medical Treatment:</h4>
                <p className="text-yellow-700 text-sm">
                  I have been advised by my supervisor/manager that I should seek medical attention
                  for my injury. I understand that I have the right to seek medical treatment at any time.
                  At this time, I am choosing to decline medical treatment.
                </p>
                <div className="mt-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('acknowledgedRefusal')}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-yellow-800 font-medium">
                      I acknowledge and understand the above statement
                    </span>
                  </label>
                </div>
              </div>
            )}
            <RadioGroup
              label="Did the employee leave work due to the injury?"
              name="leftWorkDueToInjury"
              register={register}
              errors={errors}
              options={['Yes', 'No']}
            />
            {leftWorkDueToInjury === 'Yes' && (
              <TextInput
                label="When is the employee expected to return?"
                name="expectedReturnDate"
                register={register}
                errors={errors}
              />
            )}
          </FormSection>
        )}

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default SafetyEvent
