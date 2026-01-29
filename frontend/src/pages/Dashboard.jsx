import { Link } from 'react-router-dom'
import {
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
  GraduationCap
} from 'lucide-react'

const formCards = [
  {
    title: 'Forklift Inspection',
    route: '/forklift-inspection',
    icon: ClipboardCheck,
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Safety Event Report',
    route: '/safety-event',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Observation Forms',
    route: '/observation-forms',
    icon: Eye,
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Load Quality Exception',
    route: '/load-quality-exception',
    icon: Package,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'DVIR Audit',
    route: '/dvir-audit',
    icon: FileSearch,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Forklift Operator Evaluation',
    route: '/forklift-operator-evaluation',
    icon: Award,
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    title: 'Terminal Inspection',
    route: '/terminal-inspection',
    icon: Building,
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    title: 'Report a Hazard',
    route: '/hazard-report',
    icon: AlertCircle,
    gradient: 'from-yellow-500 to-yellow-600'
  },
  {
    title: 'Driver Ride Along',
    route: '/driver-ride-along',
    icon: Truck,
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    title: 'Shop Inspection',
    route: '/shop-inspection',
    icon: Wrench,
    gradient: 'from-slate-500 to-slate-600'
  },
  {
    title: 'Fleet Management Audit',
    route: '/fleet-management',
    icon: Building2,
    gradient: 'from-rose-500 to-rose-600'
  },
  {
    title: 'CVSA Road Check Prep',
    route: '/cvsa-road-check-prep',
    icon: Shield,
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Fuel Card Receipt',
    route: '/fuel-card-receipt',
    icon: Fuel,
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Pre-Trip Training',
    route: '/pre-trip-training',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-violet-600'
  }
]

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-ccfs-primary text-white p-4 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <img src="/ccfs-logo.png" alt="CCFS Logo" className="h-10 w-auto" onError={(e) => e.target.style.display = 'none'} />
          <div className="text-center">
            <h1 className="text-2xl font-bold">CCFS Forms</h1>
            <p className="text-sm text-white/80">Safety & Compliance</p>
          </div>
        </div>
      </div>

      {/* Form Cards Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {formCards.map(card => {
            const Icon = card.icon
            return (
              <Link
                key={card.route}
                to={card.route}
                className={`bg-gradient-to-br ${card.gradient} text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] min-h-[90px] flex flex-col justify-center`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-8 h-8 opacity-90 flex-shrink-0" />
                  <span className="font-semibold text-sm leading-tight">{card.title}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 text-center">
        <p className="text-xs text-gray-500">CCFS LTL Logistics Safety Management System</p>
      </div>
    </div>
  )
}

export default Dashboard
