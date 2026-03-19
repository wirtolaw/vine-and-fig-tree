import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: '\u2302' },
  { to: '/records', label: 'Records', icon: '\u2661' },
  { to: '/habits', label: 'Habits', icon: '\u2713' },
  { to: '/calendar', label: 'Calendar', icon: '\u25A1' },
]

const barStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 'var(--tab-h)',
  background: '#0f0e0c',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingBottom: 'env(safe-area-inset-bottom)',
  zIndex: 100,
}

const linkBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  fontSize: '10px',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  padding: '6px 12px',
  transition: 'color 0.2s',
}

export default function BottomTabBar() {
  return (
    <nav style={barStyle}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={({ isActive }) => ({
            ...linkBase,
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          })}
        >
          <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
