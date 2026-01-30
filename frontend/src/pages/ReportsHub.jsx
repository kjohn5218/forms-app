import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  ClipboardCheck,
  AlertTriangle,
  Eye,
  Package,
  FileSearch,
  Award,
  Building,
  AlertCircle,
  Truck,
  Wrench,
  Building2,
  Shield,
  Fuel,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar
} from 'lucide-react'

const reportCards = [
  {
    title: 'Forklift Inspection',
    description: 'View inspection results, failures by item, terminal, and forklift',
    route: '/reports/forklift-inspection',
    icon: ClipboardCheck,
    gradient: 'from-orange-500 to-orange-600',
    available: true
  },
  {
    title: 'Safety Event',
    description: 'Safety event reports and analytics',
    route: '/reports/safety-event',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600',
    available: false
  },
  {
    title: 'Observation Forms',
    description: 'Observation tracking and trends',
    route: '/reports/observation',
    icon: Eye,
    gradient: 'from-green-500 to-green-600',
    available: false
  },
  {
    title: 'Load Quality Exception',
    description: 'Load quality issues and patterns',
    route: '/reports/load-quality',
    icon: Package,
    gradient: 'from-purple-500 to-purple-600',
    available: false
  },
  {
    title: 'DVIR Audit',
    description: 'DVIR audit results and compliance',
    route: '/reports/dvir-audit',
    icon: FileSearch,
    gradient: 'from-blue-500 to-blue-600',
    available: false
  },
  {
    title: 'Forklift Operator Evaluation',
    description: 'Operator evaluation scores and progress',
    route: '/reports/forklift-operator',
    icon: Award,
    gradient: 'from-amber-500 to-amber-600',
    available: false
  },
  {
    title: 'Terminal Inspection',
    description: 'Terminal inspection results by location',
    route: '/reports/terminal-inspection',
    icon: Building,
    gradient: 'from-teal-500 to-teal-600',
    available: false
  },
  {
    title: 'Hazard Report',
    description: 'Hazard reporting trends and resolution',
    route: '/reports/hazard',
    icon: AlertCircle,
    gradient: 'from-yellow-500 to-yellow-600',
    available: false
  },
  {
    title: 'Driver Ride Along',
    description: 'Driver evaluation results and feedback',
    route: '/reports/driver-ride-along',
    icon: Truck,
    gradient: 'from-indigo-500 to-indigo-600',
    available: false
  },
  {
    title: 'Shop Inspection',
    description: 'Shop inspection compliance and issues',
    route: '/reports/shop-inspection',
    icon: Wrench,
    gradient: 'from-slate-500 to-slate-600',
    available: false
  },
  {
    title: 'Fleet Management Audit',
    description: 'Fleet audit results and findings',
    route: '/reports/fleet-management',
    icon: Building2,
    gradient: 'from-rose-500 to-rose-600',
    available: false
  },
  {
    title: 'CVSA Road Check Prep',
    description: 'Road check preparation compliance',
    route: '/reports/cvsa-road-check',
    icon: Shield,
    gradient: 'from-cyan-500 to-cyan-600',
    available: false
  },
  {
    title: 'Fuel Card Receipt',
    description: 'Fuel card usage and receipts',
    route: '/reports/fuel-card',
    icon: Fuel,
    gradient: 'from-emerald-500 to-emerald-600',
    available: false
  },
  {
    title: 'Pre-Trip Training',
    description: 'Training completion and results',
    route: '/reports/pre-trip-training',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-violet-600',
    available: false
  },
  {
    title: 'Red Binder Checklist',
    description: 'Red binder compliance tracking',
    route: '/reports/red-binder',
    icon: BookOpen,
    gradient: 'from-red-700 to-red-800',
    available: false
  },
  {
    title: 'Selection Grade Road Test',
    description: 'Road test results and scoring',
    route: '/reports/road-test',
    icon: ClipboardList,
    gradient: 'from-sky-500 to-sky-600',
    available: false
  }
]

const ReportsHub = () => {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-white/80 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <BarChart3 className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-lg font-semibold text-white">Reports</h1>
                <p className="text-xs text-white/70">Analytics & Reporting</p>
              </div>
            </div>
            <Link
              to="/report-scheduler"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Scheduler</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {reportCards.map(card => {
            const Icon = card.icon

            if (!card.available) {
              return (
                <div
                  key={card.route}
                  className="bg-gray-200 text-gray-400 rounded-xl p-4 shadow-md min-h-[120px] flex flex-col justify-between cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-8 h-8 opacity-50 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-sm leading-tight block">{card.title}</span>
                      <span className="text-xs mt-1 block opacity-75">Coming Soon</span>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={card.route}
                to={card.route}
                className={`bg-gradient-to-br ${card.gradient} text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] min-h-[120px] flex flex-col justify-between`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-8 h-8 opacity-90 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-sm leading-tight block">{card.title}</span>
                    <span className="text-xs mt-1 block opacity-80">{card.description}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReportsHub
