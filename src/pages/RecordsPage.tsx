import { NavLink, Outlet } from 'react-router-dom'

const subTabs = [
  { to: '/records/moments', label: "Noe's Moments" },
  { to: '/records/stones', label: 'Stones' },
  { to: '/records/milestones', label: 'Milestones' },
  { to: '/records/mailbox', label: 'Mailbox' },
  { to: '/records/private', label: 'Private' },
  { to: '/records/todo', label: 'Todo' },
]

const pillStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 20,
  fontSize: 13,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  transition: 'all 0.2s',
}

export default function RecordsPage() {
  return (
    <div className="page">
      <div className="page-title">Records</div>
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        marginBottom: 20,
        paddingBottom: 4,
      }}>
        {subTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              ...pillStyle,
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: isActive ? 'var(--accent-dim)' : 'var(--border)',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
