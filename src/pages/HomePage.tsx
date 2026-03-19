import { useLocalStorage } from '../hooks/useLocalStorage'
import { INITIAL_KISS_COUNT, HABIT_CATEGORIES } from '../constants'
import { getDayCount, getToday } from '../utils/date'
import type { LoveStone, HabitCheckins } from '../types'

export default function HomePage() {
  const dayCount = getDayCount()
  const [kissCount, setKissCount] = useLocalStorage('vft_kiss', INITIAL_KISS_COUNT)
  const [stones] = useLocalStorage<LoveStone[]>('vft_stones', [])
  const [checkins, setCheckins] = useLocalStorage<HabitCheckins>('vft_habits', {})
  const today = getToday()

  const toggleHabit = (key: string) => {
    setCheckins((prev: HabitCheckins) => {
      const days = prev[key] || []
      if (days.includes(today)) {
        return { ...prev, [key]: days.filter((d: string) => d !== today) }
      }
      return { ...prev, [key]: [...days, today] }
    })
  }

  return (
    <div className="page">
      {/* Day Counter */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>
          Noe & P
        </div>
        <div style={{
          fontSize: 56,
          fontWeight: 700,
          color: 'var(--accent)',
          lineHeight: 1.1,
        }}>
          Day {dayCount}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          since March 11, 2026
        </div>
      </div>

      {/* Kiss Counter */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
          Kisses
        </div>
        <div style={{ fontSize: 36, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>
          {kissCount}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn" onClick={() => setKissCount((p: number) => p + 1)}
            style={{ fontSize: 16, padding: '8px 24px' }}>
            +1
          </button>
          <button className="btn" onClick={() => setKissCount((p: number) => p + 3)}
            style={{ fontSize: 16, padding: '8px 24px' }}>
            +3
          </button>
        </div>
      </div>

      {/* Stones */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
          Love Stones
        </div>
        <div style={{ fontSize: 28, color: 'var(--accent)' }}>
          {stones.length}
        </div>
      </div>

      {/* Quick Habit Check-in */}
      <div style={{ marginTop: 8 }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
          Today's Habits
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {HABIT_CATEGORIES.map((h) => {
            const done = (checkins[h.key] || []).includes(today)
            return (
              <button
                key={h.key}
                onClick={() => toggleHabit(h.key)}
                style={{
                  flex: '1 1 auto',
                  minWidth: 60,
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                  background: done ? 'var(--accent-glow)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 20 }}>{h.icon}</span>
                <span style={{
                  fontSize: 11,
                  color: done ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {h.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
