import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, SlidersHorizontal, CloudSun, History, Users, BookOpen, Info, Sprout, BarChart3 } from 'lucide-react'

const workspaceItems = [
  { to: '/', label: 'Market Overview', icon: LayoutDashboard },
  { to: '/historical-data', label: 'Mandi Explorer', icon: Map },
  { to: '/simulator', label: 'Price Simulator', icon: SlidersHorizontal },
  { to: '/policy-lab', label: 'Climate Insights', icon: CloudSun },
  { to: '/historical-crisis', label: 'Crisis Monitor', icon: History },
  { to: '/farmer-behaviour', label: 'Supply Behaviour', icon: Users },
]

const learnItems = [
  { to: '/how-it-works', label: 'How it works', icon: BookOpen },
  { to: '/about', label: 'Data & methodology', icon: Info },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-mark">
          <Sprout size={20} />
        </div>
        <div>
          <div className="brand-name">KrishiPulse</div>
          <div className="brand-sub">Climate × Commodity Intelligence</div>
        </div>
      </div>

      {/* Workspace Menu */}
      <div className="sidebar-section">
        <div className="sidebar-label">WORKSPACE</div>
        {workspaceItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Learn Menu */}
      <div className="sidebar-section">
        <div className="sidebar-label">LEARN</div>
        {learnItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer Info Card */}
      <div className="sidebar-bottom">
        <div className="source-card">
          <div className="source-icon">
            <BarChart3 size={16} />
          </div>
          <div>
            <b>India market layer</b>
            <span>Agmarknet + IMD</span>
          </div>
        </div>
        <div className="sidebar-footer">Prototype • SIH 2026</div>
      </div>
    </aside>
  )
}
