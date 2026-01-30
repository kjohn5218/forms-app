import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Success from './pages/Success'
import ForkliftInspection from './pages/ForkliftInspection'
import SafetyEvent from './pages/SafetyEvent'
import ObservationForms from './pages/ObservationForms'
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
import Reports from './pages/Reports'
import ReportScheduler from './pages/ReportScheduler'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/success" element={<Success />} />
          <Route path="/forklift-inspection" element={<ForkliftInspection />} />
          <Route path="/safety-event" element={<SafetyEvent />} />
          <Route path="/observation-forms" element={<ObservationForms />} />
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
          <Route path="/reports" element={<Reports />} />
          <Route path="/report-scheduler" element={<ReportScheduler />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
