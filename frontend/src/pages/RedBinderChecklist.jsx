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
  SubmitButton,
  getTodayDate,
  generateFormId
} from '../components/FormComponents'

// Terminal list for Red Binder Checklist
const TERMINALS = [
  'ABQ', 'BIL', 'BIS', 'BOI', 'BTM', 'BYI', 'BZN', 'CPR', 'DEN', 'DFW',
  'DIK', 'DOD', 'DRO', 'DSM', 'DUL', 'ELP', 'FAR', 'GAR', 'GFK', 'GJT',
  'GRI', 'GTF', 'HAY', 'HLN LIQUOR DI', 'IDA', 'KCY', 'KSP', 'LAS', 'LQR',
  'MOT', 'MSO', 'MSP', 'NCS', 'NPL', 'OMA', 'PHX', 'PIE', 'PUB', 'RNO',
  'ROW', 'RPC', 'SAL', 'SAT', 'SCB', 'SGF', 'SGU', 'SLC', 'STL', 'SXF',
  'TUS', 'WIC', 'WTT'
]

// Truck options by terminal
const TRUCK_OPTIONS = {
  'ABQ': ['130056', '160014', '160020', '160024', '160094', '160377', '170175', '222771', '423335', '423829', 'R1004', 'R1099', 'R2137', 'R2150', 'R2169', 'R2173', 'R2180', 'R3163', 'Other'],
  'BIL': ['4146', '5176', '130004', '170079', '210991', '210992', '423879', '5016847', 'A4268', 'L5419', 'M5402', 'M5411', 'M5421', 'Other'],
  'BIS': ['1242', '1340', '1544', '1648', '2760', '2823', '2825', '2915', '12010', '21348', '22060', '216004', '424677', 'Other'],
  'BOI': ['423922', 'A4278', 'A758', 'A866', 'Other'],
  'BTM': ['4148', '130002', '210022', 'A4207', 'A786', 'M500', 'M5401', '423009', 'Other'],
  'BYI': ['A4279', 'A768', 'Other'],
  'BZN': ['4155', '5190', '5191', '5199', '5201', '5203', '170330', 'M5421', 'Other'],
  'CPR': ['A4264', 'A845', 'M5423', 'R2178', 'Other'],
  'DEN': ['437', '494', '537', '1193', '4153', '5183', '5193', '5196', '11946', '12014', '81952', '81955', '130029', '130050', '130051', '130052', '130053', '130055', '160854', '170610', '223833', '223834', '423013', '423221', '423223', '423327', '423420', '423702', '5016377', '5016534', '5016640', '5016748', '5016777', '5016851', '5119096', '5119636', '5119640', '5119975', '5119976', '154P', 'A4265', 'A820', 'A946', 'M446', 'M5400', 'M5403', 'M5407', 'R1055', 'R1074', 'R2127', 'R2131', 'R2135', 'R2177', 'R3145', 'R3156', 'RS141', 'RS147', 'RS151', 'Other'],
  'DFW': ['130024', '130025', '130057', '130059', '170275', '5119780', 'Other'],
  'DIK': ['1541', '1554', '1555', '2826', '11473', '11851', '21928', 'M460', 'Other'],
  'DOD': ['223835', 'Other'],
  'DRO': ['160002', '160021', '160084', '4016868', '423425', '5016807', 'A757', 'A759', 'R2160', 'Other'],
  'DSM': ['189', '11477', '11854', '130009', '130013', '144151', '423328', '423329', '423423', '423430', 'A4260', 'Other'],
  'DUL': ['21932', '22101', '160001', '423917', 'Other'],
  'ELP': ['160013', '160016', '160023', '160025', '160069', '423227', '423334', '423421', '423911', '423916', 'R2172', 'Other'],
  'FAR': ['1428', '1431', '1547', '1704', '2631', '2779', '2784', '11357', '11440', '11951', '12104', '22102', '22103', '130006', '170001', '210993', '210994', '223829', '417420', '417520', '423222', '423324', '423426', '423505', '423833', '424678', 'RS163', 'Other'],
  'GAR': ['179', '183', '185', '1413', '130020', '160872', '160890', '417566', '5016551', 'Other'],
  'GFK': ['1236', '1543', '2744', '2817', '2819', '11923', '11926', '12011', '12013', '21476', '210002', 'Other'],
  'GJT': ['5194', '130054', '150310', '150313', '160003', '160004', '160932', '170182', '170185', '5016566', '5016902', 'A947', 'R2140', 'R2163', 'R2164', 'R2168', 'R2181', 'R3157', 'Other'],
  'GRI': ['431', '432', '445', '465', '1113', '2752', '11479', '11481', '12107', '21120', '130026', '130027', '216001', '423501', '168P', '185P', 'Other'],
  'GTF': ['5173', '5188', '5197', '180467', '210021', 'M5425', 'Other'],
  'HAY': ['174', '176', '177', '178', '182', '253', '130064', 'Other'],
  'HLN LIQUOR DI': ['L5412', 'L5413', 'L5414', 'L5415', 'L5416', 'L5417', 'L5418', 'L5419', 'L5420', 'M529', 'M582', 'M746', 'Other'],
  'IDA': ['140014', '150008', '222775', 'A754', 'Other'],
  'KCY': ['169', '172', '180', '254', '256', '263', '264', '267', '11365', '11366', '11941', '11948', '12108', '21434', '100001', '100010', '110002', '130017', '130018', '130033', '130034', '130040', '130049', '130058', '130063', '140005', '140006', '140019', '210024', '219066', '187P', 'P15', 'Other'],
  'KSP': ['4130', '4152', '5182', '5204', '5205', '3017666', '5016633', 'M402', 'Other'],
  'LAS': ['4130', '4152', '5182', '5204', '5205', '3017666', '5016633', 'M402', 'Other'],
  'MOT': ['1202', '1207', '1234', '1548', '1649', '2824', '11921', '21931', '130005', '170101', '417460', 'Other'],
  'MSO': ['5131', '5184', '5198', '5200', '130003', '160331', '170667', '210989', '210990', '423831', '3014496', '5016633', 'M402', 'Other'],
  'MSP': ['1639', '1640', '1641', '1642', '1647', '1701', '1709', '1710', '2751', '11201', '11347', '11853', '11949', '12012', '22061', '130008', '130010', '130011', '140013', '140018', '163953', '172901', '210996', '417222', '417474', '423220', '423230', '423330', '423422', '424680', '424681', 'Other'],
  'NCS': ['2086', '2132', '2138', '160005', '160007', '160222', '160370', '170183', '170781', '5016848', 'A4261', 'A4262', 'A843', 'A935', 'R2124', 'R2157', 'R2162', 'Other'],
  'NPL': ['21475', '160005', '160007', '160222', '160370', '170183', '170781', '5016848', 'A4261', 'A4262', 'A843', 'A935', 'R2124', 'R2157', 'R2162', 'Other'],
  'OMA': ['446', '469', '11478', '11480', '12015', '12106', '21658', '130007', '130015', '130016', '130028', '223828', '223830', '423331', '423332', '423333', '423424', '423914', '164P', '180C', 'Other'],
  'PHX': ['2133', '130021', '140012', '423229', 'A4263', 'A4274', 'A4276', 'A783', 'A842', 'A849', 'A852', 'A855', 'A921', 'A922', 'A930', 'A932', 'A934', 'A938', 'A939', 'A942', 'A944', 'A948', 'A949', 'Other'],
  'PIE': ['222490', 'Other'],
  'PUB': ['5172', '160006', '160009', '160010', '160012', '160390', '170181', '5016769', '5016850', 'A824', 'R1003', 'R1091', 'R2154', 'R2158', 'R3164', 'Other'],
  'RNO': ['130031', 'A4266', 'A850', 'A925', 'A926', 'A929', 'A931', 'A952', 'A953', 'Other'],
  'ROW': ['160015', '160018', '160019', '160608', '170033', '423431', 'R2175', 'Other'],
  'RPC': ['1235', '1414', '1707', '2643', '11924', '21930', '130001', '210023', '5016096', 'M5404', 'Other'],
  'SAL': ['173', '181', '186', '255', '168748', '168750', '223836', '417408', '423226', 'Other'],
  'SCB': ['257', '392', '4164', '11121', '110001', '417466', '179P', 'M1', 'SS6', 'Other'],
  'SGF': ['160', '130032', '130035', '130041', '130046', '150003', 'Other'],
  'SGU': ['1239', '121833', '423827', 'A4212', 'A723', 'A743', 'A753', 'A941', 'Other'],
  'SLC': ['1201', '150006', '150007', '194474', '210001', '423011', '423012', '423228', '423802', '423920', 'A1010', 'A4251', 'A4269', 'A4272', 'A4275', 'A755', 'A781', 'A784', 'A860', 'A861', 'A900', 'A909', 'A915', 'A916', 'A919', 'A927', 'A936', 'A937', 'A940', 'A945', 'A950', 'M497', 'M499', 'M5406', 'M5408', 'M5410', 'M5422', 'Other'],
  'STL': ['11368', '100004', '100006', '130037', '130038', '130039', '130042', '130045', '130047', '130048', '140019', '15', 'Other'],
  'SXF': ['1208', '1341', '1644', '1702', '1703', '1708', '11355', '11441', '11443', '11444', '11925', '12007', '12008', '12105', '130000', '130022', '160855', '210999', '216000', '222476', '423822', '423823', 'Other'],
  'TUS': ['423876', 'A4229', 'A4271', 'A727', 'A744', 'A836', 'A928', 'A943', 'Other'],
  'WIC': ['76', '171', '175', '184', '262', '265', '266', '268', '11364', '11367', '122024', '130019', '130060', '130061', '130062', '140007', '160815', '223832', '417451', '417558', '423224', '423225', '423427', '423428', '423429', '423836', '423872', '423874', '1221632', '5016880', '187b', '188B', 'A717', 'A733', 'A749', 'A826', 'A847', 'P14', 'P3', 'P69', 'R2148', 'Other'],
  'WTT': ['1429', '1645', '11356', '11950', '222486', '423824', 'Other']
}

// Main binder checklist items
const BINDER_CHECKLIST_ITEMS = [
  { name: 'coverSheet', label: 'Cover Sheet with Unit#' },
  { name: 'registration', label: 'Registration' },
  { name: 'leaseMemorandum', label: 'Lease Memorandum (Name should CrossCountry Freight Solutions, Inc dba CCFS)' },
  { name: 'insuranceCard', label: 'Insurance Card' },
  { name: 'iftaPermit', label: 'IFTA Permit (if applicable answer next question)' },
  { name: 'iftaDecals', label: '2024 Red IFTA Decals on driver and passenger side door' },
  { name: 'federalHazmatCertificate', label: 'Federal Hazmat Certificate' },
  { name: 'annualDotInspection', label: 'Annual Federal DOT Inspection' },
  { name: 'safetyEventWorkflow', label: 'Safety Event Workflow' },
  { name: 'safetyEventReport', label: 'Safety Event Report' },
  { name: 'driverPropertyExchange', label: 'Driver & Property Exchange Form' },
  { name: 'handheldInformation', label: 'Handheld Information' },
  { name: 'geotabInstructions', label: 'Geotab instructions – "Log into Geotab"' },
  { name: 'geotabQuickReference', label: 'Geotab Quick Reference Guide' },
  { name: 'geotabShipmentNumber', label: 'Geotab Adding shipment number instructions' },
  { name: 'claimingUnassignedTrips', label: 'Claiming Unassigned Trips' },
  { name: 'adverseDrivingConditions', label: 'Adverse Driving Conditions Exemption' },
  { name: 'prohibitedItemsCard', label: 'Prohibited Items card' },
  { name: 'hazmatSegregationChart', label: 'Hazardous Materials Load and Segregation Chart' },
  { name: 'ergPocketbook', label: 'Red bag with ERG Pocketbook' },
  { name: 'eldBackupLogs', label: 'ELD Backup Logs (8 blank sheets)' },
  { name: 'proBook', label: 'Pro book' }
]

// West region additional items
const WEST_REGION_ITEMS = [
  { name: 'idahoHazmatPermit', label: 'Idaho Hazmat Permit (if applicable)' },
  { name: 'nevadaHazmatPermit', label: 'Nevada Hazmat Permit (if applicable)' },
  { name: 'californiaHazmatPermit', label: 'California Hazmat Permit (if applicable)' },
  { name: 'azLvcPermit', label: 'AZ LVC Permit (if applicable)' },
  { name: 'idExtraLengthPermit', label: 'ID Extra-length/Excess Weight Permit (if applicable)' },
  { name: 'mt95DoublesPermit', label: 'MT 95\' Doubles Permit (if applicable)' },
  { name: 'mt100DoublePermit', label: 'MT 100\' Double Permit (if applicable)' },
  { name: 'mtTriplesPermit', label: 'MT Triples Permit (if applicable)' },
  { name: 'ndDoublesPermitWest', label: 'ND Doubles Permit (if applicable)' },
  { name: 'utOverweightPermitWest', label: 'UT Overweight / Oversize Permit (if applicable)' },
  { name: 'wyIntrastateAuthWest', label: 'WY Intrastate Operating Authority Certificate (if applicable)' }
]

// South region additional items
const SOUTH_REGION_ITEMS = [
  { name: 'coloradoHazmatPermit', label: 'Colorado Hazmat Permit (if applicable)' },
  { name: 'coLvcFleetTransport', label: 'CO LVC Fleet Transport Permit (if applicable)' },
  { name: 'coLvcTransport', label: 'CO LVC Transport Permit (if applicable)' },
  { name: 'coLvcOverweightDivisible', label: 'CO LVC Overweight Divisible Permit (if applicable)' },
  { name: 'commerceCityPermit', label: 'Commerce City Permit (if applicable)' },
  { name: 'mesaCountyPermit', label: 'Mesa County (if applicable)' },
  { name: 'ksOversizePermit', label: 'KS Oversize Permit (if applicable)' },
  { name: 'nmWeightDistancePermit', label: 'NM Weight Distance Permit (if applicable)' },
  { name: 'utOverweightPermitSouth', label: 'UT Overweight / Oversize Permit (if applicable)' },
  { name: 'wyIntrastateAuthSouth', label: 'WY Intrastate Operating Authority Certificate (if applicable)' }
]

// East region additional items
const EAST_REGION_ITEMS = [
  { name: 'ndDoublesPermitEast', label: 'ND Doubles Permit (if applicable)' }
]

// Terminal regions
const WEST_TERMINALS = ['HLN LIQUOR DI', 'TUS', 'SLC', 'SGU', 'SCB', 'RPC', 'RNO', 'PHX', 'MSO', 'LAS', 'KSP', 'IDA', 'GTF', 'CPR', 'BZN', 'BYI', 'BTM', 'BOI', 'BIL']
const SOUTH_TERMINALS = ['WIC', 'WTT', 'STL', 'SGF', 'SAL', 'ROW', 'PUB', 'NPL', 'NCS', 'KCY', 'HAY', 'GAR', 'GJT', 'ELP', 'DRO', 'DOD', 'DEN', 'ABQ']
const EAST_TERMINALS = ['SXF', 'MOT', 'GFK', 'FAR', 'DIK', 'BIS']

// Checklist options
const CHECKLIST_OPTIONS = ['In Binder', 'Missing/Expired', 'N/A']

const RedBinderChecklist = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate()
    }
  })

  const selectedTerminal = watch('terminal')
  const selectedTruck = watch('truckNumber')

  // Determine which regional items to show
  const showWestRegion = WEST_TERMINALS.includes(selectedTerminal)
  const showSouthRegion = SOUTH_TERMINALS.includes(selectedTerminal)
  const showEastRegion = EAST_TERMINALS.includes(selectedTerminal)

  // Get truck options for selected terminal
  const truckOptions = selectedTerminal ? (TRUCK_OPTIONS[selectedTerminal] || []) : []

  // Show "Other" text input when "Other" is selected
  const showOtherTruckInput = selectedTruck === 'Other'

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const submissionId = generateFormId('RBC')

    const formData = {
      ...data,
      submissionId
    }

    try {
      const response = await fetch('/api/forms/red-binder-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/success', {
          state: { submissionId, formType: 'Red Binder Checklist' }
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
      <FormHeader title="Red Binder Checklist" gradient="from-red-700 to-red-800" />

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Terminal"
              name="terminal"
              register={register}
              errors={errors}
              options={TERMINALS}
              required
              placeholder="Please Select"
            />
            <DateInput
              label="Date"
              name="date"
              register={register}
              errors={errors}
              required
              defaultValue={getTodayDate()}
            />
          </div>

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
            label="Inspector or Terminal Email"
            name="inspectorEmail"
            type="email"
            register={register}
            errors={errors}
            required
            placeholder="example@example.com"
          />
        </FormSection>

        {selectedTerminal && truckOptions.length > 0 && (
          <FormSection title="Truck Selection">
            <SelectInput
              label={`${selectedTerminal} Trucks`}
              name="truckNumber"
              register={register}
              errors={errors}
              options={truckOptions}
              required
              placeholder="Please Select"
            />

            {showOtherTruckInput && (
              <TextInput
                label="Enter Truck #"
                name="otherTruckNumber"
                register={register}
                errors={errors}
                required
              />
            )}
          </FormSection>
        )}

        <FormSection title="Select a response for each binder item">
          <p className="text-sm text-gray-500 mb-4">Mark each item as In Binder, Missing/Expired, or N/A</p>
          <div className="bg-white rounded-lg p-4">
            {BINDER_CHECKLIST_ITEMS.map(item => (
              <InspectionItem
                key={item.name}
                label={item.label}
                name={`checklist.${item.name}`}
                register={register}
                errors={errors}
                options={CHECKLIST_OPTIONS}
              />
            ))}
          </div>
        </FormSection>

        {showWestRegion && (
          <FormSection title="Check for additional items (West)">
            <p className="text-sm text-gray-500 mb-4">Additional permits for West region terminals</p>
            <div className="bg-white rounded-lg p-4">
              {WEST_REGION_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`westRegion.${item.name}`}
                  register={register}
                  errors={errors}
                  options={CHECKLIST_OPTIONS}
                />
              ))}
            </div>
          </FormSection>
        )}

        {showSouthRegion && (
          <FormSection title="Check for additional items (South)">
            <p className="text-sm text-gray-500 mb-4">Additional permits for South region terminals</p>
            <div className="bg-white rounded-lg p-4">
              {SOUTH_REGION_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`southRegion.${item.name}`}
                  register={register}
                  errors={errors}
                  options={CHECKLIST_OPTIONS}
                />
              ))}
            </div>
          </FormSection>
        )}

        {showEastRegion && (
          <FormSection title="Check for additional items (East)">
            <p className="text-sm text-gray-500 mb-4">Additional permits for East region terminals</p>
            <div className="bg-white rounded-lg p-4">
              {EAST_REGION_ITEMS.map(item => (
                <InspectionItem
                  key={item.name}
                  label={item.label}
                  name={`eastRegion.${item.name}`}
                  register={register}
                  errors={errors}
                  options={CHECKLIST_OPTIONS}
                />
              ))}
            </div>
          </FormSection>
        )}

        <FormSection title="Additional Notes">
          <TextArea
            label="Notes"
            name="notes"
            register={register}
            errors={errors}
            placeholder="Enter any additional notes here..."
            rows={5}
          />
        </FormSection>

        <SubmitButton isSubmitting={isSubmitting} />
      </FormContainer>
    </div>
  )
}

export default RedBinderChecklist
