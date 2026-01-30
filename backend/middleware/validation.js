const Joi = require('joi')

const TERMINALS = [
  'ABQ', 'BIL', 'BIS', 'BOI', 'BTM', 'BYI', 'BZN', 'CPR', 'DEN', 'DFW',
  'DIK', 'DOD', 'DRO', 'DSM', 'DUL', 'ELP', 'FAR', 'GAR', 'GFK', 'GJT', 'GRI',
  'GTF', 'HAY', 'HLN', 'HLN LIQUOR DI', 'HOU', 'IDA', 'KCY', 'KSP', 'LAS', 'LQR',
  'MOT', 'MSO', 'MSP', 'NCS', 'NPL', 'OMA', 'PHX', 'PIE', 'PUB', 'RNO', 'ROW', 'RPC',
  'SAL', 'SAT', 'SCB', 'SGF', 'SGU', 'SLC', 'STL', 'SXF', 'TUS', 'WIC', 'WTT'
]

// Base schema with common fields
const baseSchema = {
  submissionId: Joi.string().required(),
  terminal: Joi.string().valid(...TERMINALS).required(),
  photos: Joi.array().items(Joi.string()).optional(),
  signature: Joi.string().optional()
}

// Form-specific validation schemas
const schemas = {
  'forklift-inspection': Joi.object({
    ...baseSchema,
    date: Joi.string().required(),
    operatorName: Joi.string().required(),
    forkliftId: Joi.string().required(),
    shift: Joi.string().valid('Day', 'Night').required(),
    hourMeter: Joi.number().required(),
    inspection: Joi.object().required(),
    defectsFound: Joi.string().allow('').optional(),
    safeToOperate: Joi.string().valid('Yes', 'No').required(),
    signature: Joi.string().required()
  }),

  'safety-event': Joi.object({
    ...baseSchema,
    dateOfEvent: Joi.string().required(),
    timeOfEvent: Joi.string().required(),
    reporterName: Joi.string().required(),
    reporterEmail: Joi.string().email().required(),
    eventType: Joi.string().required(),
    locationWithinFacility: Joi.string().required(),
    eventDescription: Joi.string().min(50).required(),
    immediateActions: Joi.string().required(),
    witnesses: Joi.string().allow('').optional(),
    injuredPersonName: Joi.string().allow('').optional(),
    bodyPartAffected: Joi.string().allow('').optional(),
    natureOfInjury: Joi.string().allow('').optional(),
    firstAidProvided: Joi.string().allow('').optional(),
    medicalTreatmentRequired: Joi.string().allow('').optional(),
    contributingFactors: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).optional(),
    correctiveActions: Joi.string().allow('').optional()
  }),

  'observation': Joi.object({
    ...baseSchema,
    date: Joi.string().required(),
    time: Joi.string().allow('').optional(),
    observerName: Joi.string().required(),
    // General observation fields (optional for specialized forms)
    observationType: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    riskLevel: Joi.string().allow('').optional(),
    actionTaken: Joi.string().allow('').optional(),
    followUpRequired: Joi.string().optional(),
    // Safe behavior recognition fields
    recognizedEmployeeName: Joi.string().allow('').optional(),
    specificBehavior: Joi.string().allow('').optional(),
    recognitionRecommendation: Joi.string().allow('').optional(),
    // PPE compliance fields
    ppeTypes: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).optional(),
    ppeCompliant: Joi.string().allow('').optional(),
    // Chemical safety fields
    chemicalName: Joi.string().allow('').optional(),
    sdsAvailable: Joi.string().allow('').optional(),
    properStorage: Joi.string().allow('').optional(),
    // Specialized observation form fields
    formSubtype: Joi.string().allow('').optional(),
    result: Joi.string().allow('', null).optional(),
    observation: Joi.object().optional(),
    practical: Joi.object().optional(),
    habits: Joi.object().optional(),
    keys: Joi.object().optional(),
    comments: Joi.string().allow('').optional(),
    // Observer email field (for PDF notification)
    observerEmail: Joi.string().email().allow('').optional(),
    // Employee/Driver fields
    employeeObserved: Joi.string().allow('').optional(),
    driverName: Joi.string().allow('').optional(),
    operatorName: Joi.string().allow('').optional(),
    employeeName: Joi.string().allow('').optional(),
    evaluatorName: Joi.string().allow('').optional(),
    interviewerName: Joi.string().allow('').optional(),
    // Equipment fields
    truckNumber: Joi.string().allow('').optional(),
    trailerNumber: Joi.string().allow('').optional(),
    tractorNumber: Joi.string().allow('').optional(),
    forkliftId: Joi.string().allow('').optional(),
    equipmentNumber: Joi.string().allow('').optional(),
    routeNumber: Joi.string().allow('').optional(),
    // Load quality/hazmat fields
    manifestNumber: Joi.string().allow('').optional(),
    loadedAtTerminal: Joi.string().allow('').optional(),
    loadPhoto: Joi.array().items(Joi.string()).optional(),
    // STF Practical fields
    tasksRequiringTraining: Joi.array().items(Joi.string()).optional(),
    additionalNotes: Joi.string().allow('').optional()
  }),

  'load-quality-exception': Joi.object({
    ...baseSchema,
    terminal: Joi.string().valid(...TERMINALS).optional(), // Override base - this form uses reportingServiceCenter
    reportingServiceCenter: Joi.string().valid(...TERMINALS).required(),
    date: Joi.string().required(),
    employeeReportingName: Joi.string().required(),
    loadType: Joi.string().valid('Linehaul', 'P&D', 'City', 'Relay').required(),
    loadedAtServiceCenter: Joi.string().valid(...TERMINALS).required(),
    trailerNumber: Joi.string().required(),
    doorOpenedPhoto: Joi.string().required(),
    additionalPhotos: Joi.array().items(Joi.string()).optional(),
    exceptionTypes: Joi.alternatives().try(
      Joi.array().items(Joi.string()).min(1),
      Joi.string()
    ).required(),
    comments: Joi.string().allow('').optional(),
    affectedProNumbers: Joi.array().items(Joi.string()).min(1).required()
  }),

  'dvir-audit': Joi.object({
    ...baseSchema,
    auditDate: Joi.string().required(),
    auditorName: Joi.string().required(),
    auditorEmployeeId: Joi.string().required(),
    dvirDate: Joi.string().required(),
    driverName: Joi.string().required(),
    truckNumber: Joi.string().required(),
    trailerNumber: Joi.string().allow('').optional(),
    audit: Joi.object().required(),
    overallCompliance: Joi.string().required(),
    deficienciesFound: Joi.string().allow('').optional(),
    correctiveAction: Joi.string().allow('').optional(),
    followUpDate: Joi.string().allow('').optional(),
    auditorSignature: Joi.string().required(),
    driverSignature: Joi.string().allow('').optional()
  }),

  'forklift-operator-evaluation': Joi.object({
    ...baseSchema,
    evaluationDate: Joi.string().required(),
    operatorName: Joi.string().required(),
    employeeId: Joi.string().required(),
    evaluationType: Joi.string().required(),
    forkliftType: Joi.string().required(),
    evaluatorName: Joi.string().required(),
    evaluatorTitle: Joi.string().required(),
    testScore: Joi.number().min(0).max(100).allow('').optional(),
    passingScore: Joi.number().optional(),
    testPassed: Joi.boolean().optional(),
    practical: Joi.object().required(),
    overallResult: Joi.string().required(),
    areasNeedingImprovement: Joi.string().allow('').optional(),
    restrictions: Joi.string().allow('').optional(),
    reEvaluationRequired: Joi.string().optional(),
    reEvaluationDate: Joi.string().allow('').optional(),
    certificationValidUntil: Joi.string().allow('').optional(),
    operatorSignature: Joi.string().required(),
    evaluatorSignature: Joi.string().required()
  }),

  'terminal-inspection': Joi.object({
    ...baseSchema,
    inspectionDate: Joi.string().required(),
    inspectorName: Joi.string().required(),
    inspectionType: Joi.string().required(),
    exterior: Joi.object().optional(),
    dock: Joi.object().optional(),
    office: Joi.object().optional(),
    safety: Joi.object().optional(),
    security: Joi.object().optional(),
    exteriorComments: Joi.string().allow('').optional(),
    dockComments: Joi.string().allow('').optional(),
    officeComments: Joi.string().allow('').optional(),
    safetyComments: Joi.string().allow('').optional(),
    securityComments: Joi.string().allow('').optional(),
    signature: Joi.string().required()
  }),

  'hazard-report': Joi.object({
    ...baseSchema,
    dateReported: Joi.string().required(),
    reporterName: Joi.string().required(),
    anonymousReport: Joi.boolean().optional(),
    reporterContact: Joi.string().allow('').optional(),
    dateOfObservation: Joi.string().required(),
    timeOfObservation: Joi.string().required(),
    location: Joi.string().required(),
    hazardType: Joi.string().required(),
    hazardCategory: Joi.string().required(),
    description: Joi.string().min(25).required(),
    whoAtRisk: Joi.string().allow('').optional(),
    potentialSeverity: Joi.string().optional(),
    frequencyOfExposure: Joi.string().optional(),
    immediateActions: Joi.string().allow('').optional(),
    suggestedCorrectiveAction: Joi.string().required()
  }),

  'driver-ride-along': Joi.object({
    ...baseSchema,
    date: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    driverName: Joi.string().required(),
    driverEmployeeId: Joi.string().required(),
    yearsOfExperience: Joi.number().allow('').optional(),
    cdlNumber: Joi.string().allow('').optional(),
    cdlExpirationDate: Joi.string().allow('').optional(),
    evaluatorName: Joi.string().required(),
    evaluatorTitle: Joi.string().required(),
    truckNumber: Joi.string().required(),
    trailerNumber: Joi.string().allow('').optional(),
    routeDestination: Joi.string().allow('').optional(),
    preTrip: Joi.object().optional(),
    driving: Joi.object().optional(),
    customer: Joi.object().optional(),
    delivery: Joi.object().optional(),
    strengths: Joi.string().allow('').optional(),
    areasForImprovement: Joi.string().allow('').optional(),
    trainingRecommendations: Joi.string().allow('').optional(),
    overallRating: Joi.string().required(),
    driverSignature: Joi.string().required(),
    evaluatorSignature: Joi.string().required()
  }),

  'shop-inspection': Joi.object({
    ...baseSchema,
    date: Joi.string().required(),
    inspectorName: Joi.string().required(),
    shopType: Joi.string().required(),
    safety: Joi.object().optional(),
    workArea: Joi.object().optional(),
    equipment: Joi.object().optional(),
    hazmat: Joi.object().optional(),
    documentation: Joi.object().optional(),
    deficienciesFound: Joi.string().allow('').optional(),
    correctiveActions: Joi.string().allow('').optional(),
    signature: Joi.string().required()
  }),

  'fleet-management': Joi.object({
    ...baseSchema,
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    date: Joi.string().required(),
    location: Joi.string().required(),
    otherLocation: Joi.string().allow('').optional(),
    siteWork: Joi.object().optional(),
    plumbing: Joi.object().optional(),
    electrical: Joi.object().optional(),
    hvac: Joi.object().optional(),
    buildingEnvelope: Joi.object().optional(),
    officeInterior: Joi.object().optional(),
    dockInterior: Joi.object().optional(),
    siteWorkComments: Joi.string().allow('').optional(),
    plumbingComments: Joi.string().allow('').optional(),
    electricalComments: Joi.string().allow('').optional(),
    hvacComments: Joi.string().allow('').optional(),
    buildingEnvelopeComments: Joi.string().allow('').optional(),
    officeInteriorComments: Joi.string().allow('').optional(),
    dockInteriorComments: Joi.string().allow('').optional(),
    photos: Joi.object().optional(),
    summary: Joi.object().optional(),
    signature: Joi.string().required()
  }),

  'cvsa-road-check-prep': Joi.object({
    ...baseSchema,
    dateCompleted: Joi.string().required(),
    inspectedBy: Joi.string().required(),
    truckNumber: Joi.string().allow('').optional(),
    trailerNumber: Joi.string().allow('').optional(),
    truckInspection: Joi.object().optional(),
    trailerInspection: Joi.object().optional(),
    truckOdometer: Joi.number().allow('').optional(),
    truckLicensePlate: Joi.string().allow('').optional(),
    trailerLicensePlate: Joi.string().allow('').optional(),
    trailerType: Joi.string().allow('').optional(),
    notes: Joi.string().max(2000).allow('').optional(),
    summary: Joi.object().optional()
  }),

  'fuel-card-receipt': Joi.object({
    ...baseSchema,
    date: Joi.string().required(),
    driverName: Joi.string().required(),
    driverEmployeeId: Joi.string().required(),
    email: Joi.string().email().required(),
    transactionDate: Joi.string().required(),
    fuelCardLast4: Joi.string().length(4).pattern(/^\d{4}$/).required(),
    truckNumber: Joi.string().required(),
    odometerReading: Joi.number().required(),
    fuelType: Joi.string().required(),
    gallons: Joi.number().positive().required(),
    pricePerGallon: Joi.number().positive().required(),
    totalAmount: Joi.string().required(),
    stationName: Joi.string().required(),
    stationCity: Joi.string().required(),
    stationState: Joi.string().length(2).required(),
    photos: Joi.array().items(Joi.string()).min(1).required(),
    additionalNotes: Joi.string().allow('').optional()
  }),

  'pre-trip-training': Joi.object({
    ...baseSchema,
    date: Joi.string().required(),
    traineeName: Joi.string().required(),
    traineeEmployeeId: Joi.string().required(),
    trainingType: Joi.string().required(),
    trainerName: Joi.string().required(),
    trainerEmployeeId: Joi.string().required(),
    truckNumber: Joi.string().required(),
    trailerNumber: Joi.string().allow('').optional(),
    vehicleType: Joi.string().required(),
    preTripInspection: Joi.object().optional(),
    drivingSkills: Joi.object().optional(),
    knowledge: Joi.object().optional(),
    overallScore: Joi.number().min(0).max(100).allow('').optional(),
    readyForSolo: Joi.string().required(),
    additionalTrainingAreas: Joi.string().allow('').optional(),
    trainerComments: Joi.string().allow('').optional(),
    followUpDate: Joi.string().allow('').optional(),
    traineeSignature: Joi.string().required(),
    trainerSignature: Joi.string().required()
  }),

  'red-binder-checklist': Joi.object({
    submissionId: Joi.string().required(),
    terminal: Joi.string().required(),
    date: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    inspectorEmail: Joi.string().email().required(),
    truckNumber: Joi.string().allow('').optional(),
    otherTruckNumber: Joi.string().allow('').optional(),
    checklist: Joi.object().required(),
    westRegion: Joi.object().optional(),
    southRegion: Joi.object().optional(),
    eastRegion: Joi.object().optional(),
    notes: Joi.string().allow('').optional()
  }),

  'selection-grade-road-test': Joi.object({
    ...baseSchema,
    driverName: Joi.string().required(),
    employeeId: Joi.string().allow('').optional(),
    hiringTerminal: Joi.string().valid(...TERMINALS).required(),
    evaluationDate: Joi.string().required(),
    drivingExperience: Joi.string().required(),
    vehicleType: Joi.string().required(),
    truckNumber: Joi.string().required(),
    trailerNumber: Joi.string().allow('').optional(),
    weatherConditions: Joi.string().required(),
    trafficConditions: Joi.string().required(),
    routeType: Joi.string().required(),
    evaluatorName: Joi.string().required(),
    evaluatorTitle: Joi.string().required(),
    phase1: Joi.object().optional(),
    phase2: Joi.object().optional(),
    phase3: Joi.object().optional(),
    phase4: Joi.object().optional(),
    finalScore: Joi.number().min(0).max(100).allow('').optional(),
    passFailStatus: Joi.string().valid('Pass', 'Fail').required(),
    comment1: Joi.string().min(10).required(),
    comment2: Joi.string().min(10).required(),
    comment3: Joi.string().min(10).required(),
    evaluatorSignature: Joi.string().required(),
    driverSignature: Joi.string().required(),
    certificationDate: Joi.string().allow('').optional(),
    certificationNotes: Joi.string().allow('').optional()
  })
}

const validateForm = (formType) => {
  return (req, res, next) => {
    const schema = schemas[formType]

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: `Unknown form type: ${formType}`
      })
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      })
    }

    req.validatedBody = value
    next()
  }
}

module.exports = {
  validateForm,
  schemas,
  TERMINALS
}
