import { NavLink, Outlet, useMatch } from 'react-router-dom'

const subTabs = [
  { to: '/records/moments', label: 'Moments', icon: '\u{1F419}' },
  { to: '/records/stones', label: 'Stones', icon: '\u{1F48E}' },
  { to: '/records/milestones', label: 'Milestones', icon: '\u{1F3D4}\u{FE0F}' },
  { to: '/records/mailbox', label: 'Mailbox', icon: '\u{1F48C}' },
  { to: '/records/private', label: 'Private', icon: '\u{1F512}' },
  { to: '/records/todo', label: 'Todo', icon: '\u2705' },
]

export default function RecordsPage() {
  const isIndex = useMatch('/records')

  // Show grid when on /records index, show sub-page otherwise
  const showGrid = !!isIndex

  return (
    <div className="page">
      <div className="page-title">Records</div>

      {showGrid ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}>
          {subTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                aspectRatio: '1',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 32 }}>{tab.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      ) : (
        <>
          {/* Compact nav when inside a sub-page */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 20,
          }}>
            {subTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  padding: '8px 4px',
                  background: isActive ? 'var(--accent-glow)' : 'var(--bg-card)',
                  border: `1px solid ${isActive ? 'var(--accent-dim)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                })}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span style={{ fontSize: 10 }}>{tab.label}</span>
              </NavLink>
            ))}
          </div>
          <Outlet />
        </>
      )}
    </div>
  )
}
