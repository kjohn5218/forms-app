import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Success from './pages/Success'
import ForkliftInspection from './pages/ForkliftInspection'
import SafetyEvent from './pages/SafetyEvent'
import ObservationFormsHub from './pages/ObservationFormsHub'
import GeneralObservation from './pages/GeneralObservation'
import LoadQualityException from './pages/LoadQualityException'
import DVIRAudit from './pages/DVIRAudit'
import ForkliftOperatorEvaluation from './pages/ForkliftOperatorEvaluation'
import TerminalInspection from './pages/TerminalInspection'
import HazardReport from './pages/HazardReport'
import DriverRideAlong from './pages/DriverRideAlong'
import ShopInspection from './pages/ShopInspection'
import FleetManagement from './pages/FleetManagement'
import CVSARoadCheckPrep from './pages/CVSARoadCheckPrep'
import FuelCardReceipt from './pages/FuelCardReceipt'
import PreTripTraining from './pages/PreTripTraining'
import RedBinderChecklist from './pages/RedBinderChecklist'
import SelectionGradeRoadTest from './pages/SelectionGradeRoadTest'
import ReportsHub from './pages/ReportsHub'
import ForkliftInspectionReports from './pages/ForkliftInspectionReports'
import ReportScheduler from './pages/ReportScheduler'

// Observation Form Types
import SlipsTripsAndFalls from './pages/observation/SlipsTripsAndFalls'
import DriverOnRoad from './pages/observation/DriverOnRoad'
import DockSafety from './pages/observation/DockSafety'
import STFPractical from './pages/observation/STFPractical'
import LiftPushPull from './pages/observation/LiftPushPull'
import DriverPreRoute from './pages/observation/DriverPreRoute'
import DriverPostRoute from './pages/observation/DriverPostRoute'
import DriverHazmat from './pages/observation/DriverHazmat'
import ForkliftOperation from './pages/observation/ForkliftOperation'
import LoadQualityHazmat from './pages/observation/LoadQualityHazmat'
import FiveSeeingHabits from './pages/observation/FiveSeeingHabits'
import SevenKeysBacking from './pages/observation/SevenKeysBacking'
import YardObservation from './pages/observation/YardObservation'
import TruckTrailerCoupling from './pages/observation/TruckTrailerCoupling'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/success" element={<Success />} />
          <Route path="/forklift-inspection" element={<ForkliftInspection />} />
          <Route path="/safety-event" element={<SafetyEvent />} />
          <Route path="/observation-forms" element={<ObservationFormsHub />} />
          <Route path="/observation-forms/general" element={<GeneralObservation />} />
          <Route path="/observation-forms/slips-trips-falls" element={<SlipsTripsAndFalls />} />
          <Route path="/observation-forms/driver-on-road" element={<DriverOnRoad />} />
          <Route path="/observation-forms/dock-safety" element={<DockSafety />} />
          <Route path="/observation-forms/stf-practical" element={<STFPractical />} />
          <Route path="/observation-forms/lift-push-pull" element={<LiftPushPull />} />
          <Route path="/observation-forms/driver-pre-route" element={<DriverPreRoute />} />
          <Route path="/observation-forms/driver-post-route" element={<DriverPostRoute />} />
          <Route path="/observation-forms/driver-hazmat" element={<DriverHazmat />} />
          <Route path="/observation-forms/forklift-operation" element={<ForkliftOperation />} />
          <Route path="/observation-forms/load-quality-hazmat" element={<LoadQualityHazmat />} />
          <Route path="/observation-forms/five-seeing-habits" element={<FiveSeeingHabits />} />
          <Route path="/observation-forms/seven-keys-backing" element={<SevenKeysBacking />} />
          <Route path="/observation-forms/yard-observation" element={<YardObservation />} />
          <Route path="/observation-forms/coupling" element={<TruckTrailerCoupling />} />
          <Route path="/load-quality-exception" element={<LoadQualityException />} />
          <Route path="/dvir-audit" element={<DVIRAudit />} />
          <Route path="/forklift-operator-evaluation" element={<ForkliftOperatorEvaluation />} />
          <Route path="/terminal-inspection" element={<TerminalInspection />} />
          <Route path="/hazard-report" element={<HazardReport />} />
          <Route path="/driver-ride-along" element={<DriverRideAlong />} />
          <Route path="/shop-inspection" element={<ShopInspection />} />
          <Route path="/fleet-management" element={<FleetManagement />} />
          <Route path="/cvsa-road-check-prep" element={<CVSARoadCheckPrep />} />
          <Route path="/fuel-card-receipt" element={<FuelCardReceipt />} />
          <Route path="/pre-trip-training" element={<PreTripTraining />} />
          <Route path="/red-binder-checklist" element={<RedBinderChecklist />} />
          <Route path="/selection-grade-road-test" element={<SelectionGradeRoadTest />} />
          <Route path="/reports" element={<ReportsHub />} />
          <Route path="/reports/forklift-inspection" element={<ForkliftInspectionReports />} />
          <Route path="/report-scheduler" element={<ReportScheduler />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
