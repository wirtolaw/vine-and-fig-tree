import { useState, useEffect } from 'react'
import { NavLink, Outlet, useMatch, useLocation } from 'react-router-dom'
import { fetchUnreadCount } from '../utils/supabase'

const subTabs = [
  { to: '/records/moments', label: 'Moments', icon: '\u{1F419}', key: 'moments' },
  { to: '/records/stones', label: 'Stones', icon: '\u{1F48E}', key: 'stones' },
  { to: '/records/milestones', label: 'Milestones', icon: '\u{1F3D4}\u{FE0F}', key: 'milestones' },
  { to: '/records/mailbox', label: 'Mailbox', icon: '\u{1F48C}', key: 'mailbox' },
  { to: '/records/private', label: 'Private', icon: '\u2764\u{FE0F}\u200D\u{1F525}', key: 'private' },
  { to: '/records/todo', label: 'Todo', icon: '\u2705', key: 'todo' },
  { to: '/records/reading', label: 'Reading', icon: '\u{1F4DA}', key: 'reading' },
]

const LAST_VIEWED_KEY = 'vft_moments_last_viewed'

function getLastViewed(): string {
  return localStorage.getItem(LAST_VIEWED_KEY) || '2026-01-01T00:00:00Z'
}

function markViewed() {
  localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString())
}

const redDotStyle: React.CSSProperties = {
  position: 'absolute',
  top: 6,
  right: 6,
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#ff3b30',
}

export default function RecordsPage() {
  const isIndex = useMatch('/records')
  const location = useLocation()
  const showGrid = !!isIndex
  const [hasUnread, setHasUnread] = useState(false)

  // Check unread on mount and when navigating
  useEffect(() => {
    fetchUnreadCount(getLastViewed())
      .then((n) => setHasUnread(n > 0))
      .catch(() => {})
  }, [location.pathname])

  // Mark as viewed when entering Moments
  useEffect(() => {
    if (location.pathname.includes('/records/moments')) {
      markViewed()
      setHasUnread(false)
    }
  }, [location.pathname])

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
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 32 }}>{tab.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tab.label}</span>
              {tab.key === 'moments' && hasUnread && <div style={redDotStyle} />}
            </NavLink>
          ))}
        </div>
      ) : (
        <>
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
                  position: 'relative',
                })}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span style={{ fontSize: 10 }}>{tab.label}</span>
                {tab.key === 'moments' && hasUnread && (
                  <div style={{ ...redDotStyle, top: 2, right: 2, width: 6, height: 6 }} />
                )}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </>
      )}
    </div>
  )
}
