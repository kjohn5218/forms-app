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
  InspectionItem,
  SignaturePad,
  SubmitButton,
  InfoBanner,
  TERMINALS,
  getTodayDate,
  getCurrentTime,
  generateFormId
} from '../components/FormComponents'

// Weather conditions
const WEATHER_CONDITIONS = [
  'Clear/Sunny',
  'Cloudy',
  'Light Rain',
  'Heavy Rain',
  'Snow',
  'Fog',
  'Windy'
]

// Route types
const ROUTE_TYPES = [
  'Urban',
  'Suburban',
  'Highway',
  'Mixed'
]

// Equipment types
const EQUIPMENT_TYPES = [
  'Tractor-Trailer',
  'Straight Truck',
  'Day Cab',
  'Sleeper Cab'
]

// DL Classes
const DL_CLASSES = ['Class A', 'Class B', 'Class C']

// Endorsements
const ENDORSEMENTS = ['H - Hazmat', 'N - Tank', 'P - Passenger', 'S - School Bus', 'T - Doubles/Triples', 'X - Hazmat + Tank']

// Salted defect items
const SALTED_DEFECTS = [
  { id: 'S01', name: 'passengerHoodLatch', label: 'S-01: Passenger Side Hood Latch Unlatched', category: 'CRITICAL SAFETY', indicator: 'Global Attention - Full walkaround' },
  { id: 'S02', name: 'looseFuelCap', label: 'S-02: Loose Fuel Cap (Driver Side)', category: 'Environmental/Safety', indicator: 'Tactile Verification - Touch vs. look' },
  { id: 'S03', name: 'foreignObjectDualTires', label: 'S-03: Foreign Object Between Dual Tires', category: 'CRITICAL SAFETY', indicator: 'Depth of Scan - Bends/crouches to check' },
  { id: 'S04', name: 'airLineDisconnected', label: 'S-04: Air Line Gladhand Disconnected (Service Line)', category: 'CRITICAL FUNCTIONALITY', indicator: 'System Logic - Checks rear before cab' },
  { id: 'S05', name: 'washerFluidEmpty', label: 'S-05: Washer Fluid Reservoir Empty', category: 'Non-Critical', indicator: 'Detail Orientation - "Small stuff"' }
]

// Phase 1: Standard Pre-Trip Behaviors
const PRETRIP_BEHAVIORS = [
  { name: 'walkedAroundVehicle', label: '* Did candidate physically walk around ENTIRE vehicle (both sides)?', critical: true },
  { name: 'touchedComponents', label: '* Did candidate physically TOUCH components (not just visual scan)?', critical: true },
  { name: 'bendCrouchInspect', label: '* Did candidate bend/crouch to inspect undercarriage and tire areas?', critical: true },
  { name: 'checkedFifthWheel', label: '* Did candidate check coupling device (fifth wheel) thoroughly?', critical: true },
  { name: 'verifiedAirBrakes', label: '* Did candidate verify air brake system integrity before entering cab?', critical: true },
  { name: 'checkedAllLights', label: 'Did candidate check ALL lights (turn signals, brake lights, markers)?', critical: false },
  { name: 'inspectedSuspension', label: 'Did candidate inspect suspension components?', critical: false },
  { name: 'checkedCargoSecurement', label: 'Did candidate check cargo securement devices?', critical: false },
  { name: 'verifiedEmergencyEquip', label: 'Did candidate verify emergency equipment present (triangles, extinguisher)?', critical: false }
]

// Phase 2: Commentary Assessment
const COMMENTARY_ITEMS = [
  { name: 'activeScanning', label: '* Active Scanning: Did driver verbalize hazards BEFORE physically reacting to them?', critical: true },
  { name: 'intersectionClearing', label: '* Intersection Clearing: Did driver verbally confirm "Left Clear, Right Clear, Left Clear" at EVERY intersection?', critical: true },
  { name: 'bridgeClearance', label: '* Bridge/Overhead Clearance: Did driver verbalize clearance heights when present?', critical: true },
  { name: 'spaceManagement', label: 'Space Management: Did driver verbalize following distance (counting seconds) when traffic slowed?', critical: false },
  { name: 'laneChangePrep', label: 'Lane Change Preparation: Did driver verbalize mirror checks and blind spot assessment?', critical: false },
  { name: 'predictiveCommentary', label: '* Predictive Commentary: Were statements predictive ("car might...") rather than purely descriptive?', critical: true },
  { name: 'maintainedCommentary', label: '* Maintained Commentary: Did driver continue talking during moderate traffic complexity?', critical: true },
  { name: 'speedAdaptation', label: 'Speed Adaptation: Did driver verbalize speed adjustments for conditions?', critical: false },
  { name: 'signalAwareness', label: 'Signal Awareness: Did driver call out traffic signal status ("stale green", "fresh red")?', critical: false }
]

// Cognitive Overload Indicators
const COGNITIVE_OVERLOAD_INDICATORS = [
  { value: 'laneDrift', label: 'Lane drift or speed fluctuation while attempting commentary' },
  { value: 'completeSilence', label: 'Complete silence during traffic complexity (cognitive saturation)' },
  { value: 'purelyDescriptive', label: 'Commentary became purely vehicle-state descriptive ("I am driving straight")' },
  { value: 'missedShift', label: 'Missed shift or vehicle control error during verbalization' }
]

// Phase 3A: Restricted Route Trap
const TRAP_A_ITEMS = [
  { name: 'identifiedRestriction', label: '* Did driver verbally identify the restriction sign?', critical: true },
  { name: 'abortedTurn', label: '* Did driver abort the turn WITHOUT examiner intervention?', critical: true },
  { name: 'verbalizedConflict', label: 'Did driver verbalize the conflict ("GPS says X, but sign says Y")?', critical: false }
]

// Phase 3B: GOAL Backing Trap
const TRAP_B_ITEMS = [
  { name: 'stoppedSetBrakes', label: '* Did driver stop vehicle and set brakes before exiting?', critical: true },
  { name: 'exitedCheckedRear', label: '* Did driver physically exit cab and check rear clearance (GOAL)?', critical: true },
  { name: 'usedHorn', label: 'Did driver use horn before backing?', critical: false },
  { name: 'usedFlashers', label: 'Did driver use 4-way flashers during backing operation?', critical: false }
]

// Phase 3C: Cognitive Saturation Trap
const TRAP_C_ITEMS = [
  { name: 'deferredQuestion', label: '* Did driver defer the question ("Stand by" or ignore until maneuver complete)?', critical: true },
  { name: 'maintainedLanePosition', label: '* Did driver maintain proper lane position during/after question?', critical: true },
  { name: 'maintainedSpeed', label: '* Did driver maintain appropriate speed during/after question?', critical: true },
  { name: 'completedMirrorChecks', label: '* Did driver complete required mirror/blind spot checks during maneuver?', critical: true }
]

// Phase 4: Vehicle Control
const VEHICLE_CONTROL_ITEMS = [
  { name: 'fastenedSeatbelt', label: '* Fastened seat belt upon entering vehicle?', critical: true },
  { name: 'properLanePosition', label: 'Maintained proper lane position throughout test?', critical: false },
  { name: 'properGearSelection', label: 'Used proper gear selection and smooth shifting? *manual only*', critical: false },
  { name: 'appropriateSpeed', label: 'Maintained appropriate speed for conditions?', critical: false },
  { name: 'smoothBraking', label: 'Demonstrated smooth braking without excessive fanning?', critical: false },
  { name: 'gradeControl', label: 'Stopped and restarted on grade without rollback?', critical: false }
]

// Phase 4: Traffic Operations
const TRAFFIC_OPERATIONS_ITEMS = [
  { name: 'obeyedSignals', label: '* Obeyed all traffic signals?', critical: true },
  { name: 'obeyedSigns', label: '* Obeyed all traffic signs?', critical: true },
  { name: 'yieldedRightOfWay', label: '* Yielded right-of-way appropriately?', critical: true },
  { name: 'signaledIntentions', label: 'Signaled intentions in advance of turns/lane changes?', critical: false },
  { name: 'completedTurns', label: 'Completed turns without encroaching on other lanes?', critical: false },
  { name: 'safeFollowingDistance', label: 'Maintained safe following distance?', critical: false },
  { name: 'checkedMirrors', label: 'Checked mirrors before and during lane changes?', critical: false }
]

// Phase 4: Parking and Securing
const PARKING_ITEMS = [
  { name: 'setParkingBrake', label: '* Set parking brake when stopped?', critical: true },
  { name: 'properGearParked', label: 'Placed transmission in proper gear when parked?', critical: false },
  { name: 'chockedWheels', label: 'Chocked wheels when required?', critical: false },
  { name: 'securedVehicle', label: '* Secured vehicle properly (engine off, keys removed, doors locked)?', critical: true }
]

const SelectionGradeRoadTest = () => {
  const navigate = useNavigate()
  const [evaluatorSignature, setEvaluatorSignature] = useState('')
  const [certificationSignature, setCertificationSignature] = useState('')
  const [driverAcknowledgmentSignature, setDriverAcknowledgmentSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      testDate: getTodayDate(),
      testStartTime: getCurrentTime()
    }
  })

  const overallResult = watch('overallResult')

  const onSubmit = async (data) => {
    if (!evaluatorSignature) {
      alert('Please provide the evaluator signature')
      return
    }

    setIsSubmitting(true)
    const submissionId = generateFormId('SRT')

    const formData = {
      ...data,
      evaluatorSignature,
      certificationSignature: overallResult === 'Pass' ? certificationSignature : null,
      driverAcknowledgmentSignature: overallResult === 'Pass' ? driverAcknowledgmentSignature : null,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/selection-grade-road-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Selection Grade Road Test' }
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
      <FormHeader title="Selection Grade Road Test" gradient="from-blue-600 to-blue-700" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <InfoBanner type="info">
          <p className="text-sm font-medium">High-Fidelity Job Simulation & Cognitive Assessment</p>
          <p className="text-xs mt-1">This assessment evaluates job-essential cognitive functions and safety-critical behaviors required for commercial vehicle operation.</p>
        </InfoBanner>

        {/* Driver Information */}
        <FormSection title="Driver Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Driver's Name"
              name="driverName"
              register={register}
              errors={errors}
              required
            />
            <DateInput
              label="Today's Date"
              name="testDate"
              register={register}
              errors={errors}
              required
              defaultValue={getTodayDate()}
            />
          </div>
          <TextInput
            label="Address"
            name="driverAddress"
            register={register}
            errors={errors}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="City, State, Zip"
              name="cityStateZip"
              register={register}
              errors={errors}
              required
            />
            <TextInput
              label="License #"
              name="licenseNumber"
              register={register}
              errors={errors}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="DL State/Class"
              name="dlStateClass"
              register={register}
              errors={errors}
              options={DL_CLASSES}
              required
            />
            <DateInput
              label="DOT Medical Card Exp"
              name="dotMedicalCardExp"
              register={register}
              errors={errors}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckboxGroup
              label="Endorsements"
              name="endorsements"
              register={register}
              options={ENDORSEMENTS}
              errors={errors}
            />
            <div>
              <TextInput
                label="Evaluator"
                name="evaluatorName"
                register={register}
                errors={errors}
                required
              />
              <SelectInput
                label="Type of Equipment"
                name="equipmentType"
                register={register}
                errors={errors}
                options={EQUIPMENT_TYPES}
                required
              />
            </div>
          </div>
        </FormSection>

        {/* Test Conditions */}
        <FormSection title="Test Conditions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Tractor Unit #"
              name="tractorUnit"
              register={register}
              errors={errors}
              required
            />
            <TextInput
              label="Trailer Unit #"
              name="trailerUnit"
              register={register}
              errors={errors}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Starting Odometer"
              name="startingOdometer"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <TextInput
              label="Ending Odometer"
              name="endingOdometer"
              type="number"
              register={register}
              errors={errors}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Weather Conditions"
              name="weatherConditions"
              register={register}
              errors={errors}
              options={WEATHER_CONDITIONS}
              required
            />
            <SelectInput
              label="Route Type"
              name="routeType"
              register={register}
              errors={errors}
              options={ROUTE_TYPES}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeInput
              label="Test Start Time"
              name="testStartTime"
              register={register}
              errors={errors}
              required
              defaultValue={getCurrentTime()}
            />
            <TimeInput
              label="Test End Time"
              name="testEndTime"
              register={register}
              errors={errors}
            />
          </div>
        </FormSection>

        {/* Phase 1: Salted Pre-Trip Inspection */}
        <FormSection title="Phase 1: Salted Pre-Trip Inspection">
          <InfoBanner type="warning">
            <p className="text-xs"><strong>Passing Standard:</strong> Detection of 100% of CRITICAL salted defects and 75% of NON-CRITICAL salted defects.</p>
          </InfoBanner>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Salted Defect Manifest</h4>
            <p className="text-xs text-gray-500 mb-3">Mark Y (Yes - Detected) or N (No - Not Detected)</p>
            <div className="bg-white rounded-lg p-4">
              {SALTED_DEFECTS.map(defect => (
                <div key={defect.name} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                  <InspectionItem
                    label={defect.label}
                    name={`saltedDefects.${defect.name}`}
                    register={register}
                    errors={errors}
                    options={['Yes', 'No']}
                  />
                  <p className="text-xs text-gray-400 ml-2 mt-1">
                    <span className={`font-medium ${defect.category.includes('CRITICAL') ? 'text-red-500' : 'text-gray-500'}`}>{defect.category}</span> | {defect.indicator}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Standard Pre-Trip Inspection Behaviors</h4>
            <p className="text-xs text-gray-500 mb-3">* Items marked with asterisk are CRITICAL - A 'NO' results in automatic disqualification</p>
            <div className="bg-white rounded-lg p-4">
              {PRETRIP_BEHAVIORS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`preTripBehaviors.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
            </div>
          </div>
        </FormSection>

        {/* Phase 2: Commentary Driving */}
        <FormSection title="Phase 2: Commentary Driving ('Spoken Thoughts')">
          <InfoBanner type="info">
            <p className="text-xs"><strong>Instructions:</strong> Candidate must verbalize hazards. Silence or purely descriptive speech constitutes failure. Predictive speech required ("Car on right might pull out").</p>
          </InfoBanner>

          <div className="mt-4 bg-white rounded-lg p-4">
            {COMMENTARY_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`commentaryDriving.${item.name}`}
                register={register}
                errors={errors}
                options={['Yes', 'No']}
              />
            ))}
          </div>

          <div className="mt-4">
            <CheckboxGroup
              label="Cognitive Overload Indicators (Check all that apply)"
              name="cognitiveOverloadIndicators"
              register={register}
              options={COGNITIVE_OVERLOAD_INDICATORS}
              errors={errors}
            />
            <p className="text-xs text-red-500 mt-1">Any checked box indicates insufficient Executive Reserve for safe operation.</p>
          </div>
        </FormSection>

        {/* Phase 3: Forced Failure Scenarios */}
        <FormSection title="Phase 3: Forced Failure Scenarios (Job Simulation Traps)">
          <InfoBanner type="warning">
            <p className="text-xs"><strong>Objective:</strong> Test Automation Bias, Risk Acceptance, and Task Prioritization through job-relevant simulations of common accident precursors.</p>
          </InfoBanner>

          {/* Trap A */}
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-red-700">Trap A: Restricted Route (GPS vs. Signage)</h4>
            <p className="text-xs text-gray-500 mb-3">Tests: Automation Bias — the tendency to trust GPS/authority over visual reality.</p>
            <div className="bg-white rounded-lg p-4">
              {TRAP_A_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`trapA.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
              <div className="mt-3 pt-3 border-t">
                <InspectionItem
                  label="FAIL CONDITION: Examiner intervention required?"
                  name="trapA.examinerIntervention"
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              </div>
            </div>
          </div>

          {/* Trap B */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-2 text-red-700">Trap B: Mandatory GOAL Backing Scenario</h4>
            <p className="text-xs text-gray-500 mb-3">Tests: Risk Acceptance — willingness to proceed without complete visual information.</p>
            <div className="bg-white rounded-lg p-4">
              {TRAP_B_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`trapB.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
              <p className="text-xs text-red-500 mt-3">FAIL CONDITION: Driver attempted to complete backing using ONLY mirrors without GOAL exit.</p>
            </div>
          </div>

          {/* Trap C */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-2 text-red-700">Trap C: Cognitive Saturation Event (Distraction Injection)</h4>
            <p className="text-xs text-gray-500 mb-3">Tests: Task Prioritization — ability to shed extraneous cognitive load to focus on safety-critical tasks.</p>
            <div className="bg-white rounded-lg p-4">
              {TRAP_C_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`trapC.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
              <p className="text-xs text-red-500 mt-3">FAIL CONDITION: Driver attempted immediate answer AND exhibited: lane drift, speed fluctuation, or missed safety check.</p>
            </div>
          </div>
        </FormSection>

        {/* Phase 4: Standard Driving Competencies */}
        <FormSection title="Phase 4: Standard Driving Competencies">
          {/* Vehicle Control */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Vehicle Control</h4>
            <div className="bg-white rounded-lg p-4">
              {VEHICLE_CONTROL_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`vehicleControl.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
            </div>
          </div>

          {/* Traffic Operations */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Traffic Operations</h4>
            <div className="bg-white rounded-lg p-4">
              {TRAFFIC_OPERATIONS_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`trafficOperations.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
            </div>
          </div>

          {/* Parking and Securing */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Parking and Securing</h4>
            <div className="bg-white rounded-lg p-4">
              {PARKING_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`parkingSecuring.${item.name}`}
                  register={register}
                  errors={errors}
                  options={['Yes', 'No']}
                />
              ))}
            </div>
          </div>
        </FormSection>

        {/* Final Scoring Summary */}
        <FormSection title="Final Scoring Summary">
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <InspectionItem
                label="Phase 1: Salted Pre-Trip"
                name="phaseResults.phase1"
                register={register}
                errors={errors}
                options={['Pass', 'Fail']}
              />
              <InspectionItem
                label="Phase 2: Commentary Driving"
                name="phaseResults.phase2"
                register={register}
                errors={errors}
                options={['Pass', 'Fail']}
              />
              <InspectionItem
                label="Phase 3A: Restricted Route Trap"
                name="phaseResults.phase3a"
                register={register}
                errors={errors}
                options={['Pass', 'Fail']}
              />
              <InspectionItem
                label="Phase 3B: GOAL Backing Trap"
                name="phaseResults.phase3b"
                register={register}
                errors={errors}
                options={['Pass', 'Fail']}
              />
              <InspectionItem
                label="Phase 3C: Cognitive Saturation Trap"
                name="phaseResults.phase3c"
                register={register}
                errors={errors}
                options={['Pass', 'Fail']}
              />
              <InspectionItem
                label="Phase 4: Standard Competencies"
                name="phaseResults.phase4"
                register={register}
                errors={errors}
                options={['Pass', 'Fail']}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Minimum Passing Criteria</h4>
            <ol className="text-xs text-gray-600 list-decimal ml-4 space-y-1">
              <li>Receive 'YES' on ALL critical items marked with asterisk (*) in every phase</li>
              <li>Detect 100% of CRITICAL salted defects (S-01, S-03, S-04) and at least 1 of 2 non-critical defects</li>
              <li>Have no more than 2 'NO' ratings on non-critical items in any single phase</li>
              <li>Not trigger any FAIL CONDITION in the Forced Failure Scenarios</li>
            </ol>
          </div>

          <div className="mt-4">
            <RadioGroup
              label="OVERALL RESULT"
              name="overallResult"
              register={register}
              errors={errors}
              options={['Pass', 'Fail']}
              required
            />
          </div>
        </FormSection>

        {/* Comments */}
        <FormSection title="Comments / Behavioral Observations">
          <InfoBanner type="warning">
            <p className="text-xs font-medium">*3 Comments Minimum Required*</p>
          </InfoBanner>
          <TextArea
            label="Comments"
            name="comments"
            register={register}
            errors={errors}
            required
            rows={6}
            placeholder="Enter behavioral observations (minimum 3 comments required)..."
            minLength={50}
          />
        </FormSection>

        {/* Evaluator Certification */}
        <FormSection title="Evaluator Certification">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-xs text-gray-700">
              I certify that I am qualified to administer this Selection-Grade Road Test as defined by 49 CFR 391.31(b) and
              company policy. I further certify that the above-named driver was given a road test under my supervision, that
              all behavioral markers were objectively observed and recorded, and that the salted defects were properly
              staged prior to the candidate's arrival.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Print Name"
              name="evaluatorPrintName"
              register={register}
              errors={errors}
              required
            />
            <TextInput
              label="Title"
              name="evaluatorTitle"
              register={register}
              errors={errors}
              required
            />
          </div>
          <SignaturePad
            label="Evaluator's Signature"
            signature={evaluatorSignature}
            setSignature={setEvaluatorSignature}
            required
          />
        </FormSection>

        {/* Certification of Successful Road Test (Only if Pass) */}
        {overallResult === 'Pass' && (
          <FormSection title="Certification of Successful Road Test">
            <InfoBanner type="success">
              <p className="text-xs">Complete this section ONLY if the overall result is PASS.</p>
            </InfoBanner>
            <div className="p-4 bg-green-50 rounded-lg mb-4">
              <p className="text-xs text-gray-700">
                It is my considered opinion that this driver possesses sufficient driving skill, cognitive capacity, and conscientiousness
                to operate safely the type of commercial motor vehicle listed above. The candidate has demonstrated adequate
                Executive Function through the Commentary Driving protocol and adequate Diligence through the Salted Inspection protocol.
              </p>
            </div>
            <SignaturePad
              label="Evaluator's Signature (Certification of Pass)"
              signature={certificationSignature}
              setSignature={setCertificationSignature}
              required
            />
            <SignaturePad
              label="Driver's Signature (Acknowledgment)"
              signature={driverAcknowledgmentSignature}
              setSignature={setDriverAcknowledgmentSignature}
              required
            />
          </FormSection>
        )}

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default SelectionGradeRoadTest
