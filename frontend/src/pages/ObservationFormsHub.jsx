import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, Footprints, Truck, Anchor, GraduationCap, Dumbbell, ClipboardCheck, Package, AlertTriangle, Forklift, BoxSelect, Brain, KeyRound, Warehouse, Link2 } from 'lucide-react'

const observationForms = [
  {
    title: 'General Observation',
    description: 'General safety observations including unsafe acts, conditions, and hazards',
    route: '/observation-forms/general',
    icon: Eye,
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Slips, Trips & Falls',
    description: 'Observe safe behaviors for slip, trip, and fall prevention',
    route: '/observation-forms/slips-trips-falls',
    icon: Footprints,
    gradient: 'from-yellow-500 to-yellow-600'
  },
  {
    title: 'Driver On-Road',
    description: 'Observe driver behaviors and practices while on the road',
    route: '/observation-forms/driver-on-road',
    icon: Truck,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Dock Safety',
    description: 'Observe dock operations safety practices',
    route: '/observation-forms/dock-safety',
    icon: Anchor,
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    title: 'Slips, Trips & Falls Practical',
    description: 'Practical evaluation of slip, trip, and fall knowledge and skills',
    route: '/observation-forms/stf-practical',
    icon: GraduationCap,
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Lift, Push, Pull',
    description: 'Observe proper lifting, pushing, and pulling techniques',
    route: '/observation-forms/lift-push-pull',
    icon: Dumbbell,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Delivery Driver Pre-route',
    description: 'Pre-route preparation observation for delivery drivers',
    route: '/observation-forms/driver-pre-route',
    icon: ClipboardCheck,
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    title: 'Delivery Driver Post-route',
    description: 'Post-route completion observation for delivery drivers',
    route: '/observation-forms/driver-post-route',
    icon: ClipboardCheck,
    gradient: 'from-violet-500 to-violet-600'
  },
  {
    title: 'Driver Hazmat',
    description: 'Hazmat handling observation for drivers',
    route: '/observation-forms/driver-hazmat',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Forklift Operation',
    description: 'Observe forklift operator safety behaviors',
    route: '/observation-forms/forklift-operation',
    icon: Forklift,
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    title: 'Load Quality / Hazmat Loading',
    description: 'Observe load quality and hazmat loading practices',
    route: '/observation-forms/load-quality-hazmat',
    icon: BoxSelect,
    gradient: 'from-rose-500 to-rose-600'
  },
  {
    title: 'Five Seeing Habits',
    description: 'Interview drivers on the Five Seeing Habits',
    route: '/observation-forms/five-seeing-habits',
    icon: Brain,
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Seven Keys to Backing',
    description: 'Interview drivers on the Seven Keys to Backing',
    route: '/observation-forms/seven-keys-backing',
    icon: KeyRound,
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Yard Observation',
    description: 'Observe behaviors within terminal yards',
    route: '/observation-forms/yard-observation',
    icon: Warehouse,
    gradient: 'from-slate-500 to-slate-600'
  },
  {
    title: 'Truck & Trailer Coupling',
    description: 'Observe truck and trailer coupling procedures',
    route: '/observation-forms/coupling',
    icon: Link2,
    gradient: 'from-sky-500 to-sky-600'
  }
]

const ObservationFormsHub = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link to="/" className="mr-3 text-white hover:text-green-100">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Observation Forms</h1>
              <p className="text-xs text-white/80">Select an observation type</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form Cards Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {observationForms.map(form => {
            const Icon = form.icon
            return (
              <Link
                key={form.route}
                to={form.route}
                className={`bg-gradient-to-br ${form.gradient} text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-8 h-8 opacity-90 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-base leading-tight block">{form.title}</span>
                    <span className="text-xs text-white/80 mt-1 block">{form.description}</span>
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

export default ObservationFormsHub
