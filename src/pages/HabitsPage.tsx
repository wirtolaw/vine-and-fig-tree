import { useLocalStorage } from '../hooks/useLocalStorage'
import { HABIT_CATEGORIES } from '../constants'
import { getToday } from '../utils/date'
import { format, subDays } from 'date-fns'
import type { HabitCheckins } from '../types'

function getStreak(days: string[], today: string): number {
  let streak = 0
  let d = new Date(today + 'T00:00:00')
  const sorted = new Set(days)
  while (sorted.has(format(d, 'yyyy-MM-dd'))) {
    streak++
    d = subDays(d, 1)
  }
  return streak
}

function getLast14(): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    result.push(format(subDays(now, i), 'yyyy-MM-dd'))
  }
  return result
}

export default function HabitsPage() {
  const [checkins, setCheckins] = useLocalStorage<HabitCheckins>('vft_habits', {})
  const today = getToday()
  const last14 = getLast14()

  const toggle = (key: string, day: string) => {
    setCheckins((prev: HabitCheckins) => {
      const days = prev[key] || []
      if (days.includes(day)) {
        return { ...prev, [key]: days.filter((d: string) => d !== day) }
      }
      return { ...prev, [key]: [...days, day] }
    })
  }

  return (
    <div className="page">
      <div className="page-title">Habits</div>

      {HABIT_CATEGORIES.map((cat) => {
        const days = checkins[cat.key] || []
        const streak = getStreak(days, today)
        const total = days.length

        return (
          <div key={cat.key} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{cat.label}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
                <div>{streak} day streak</div>
                <div style={{ color: 'var(--text-muted)' }}>{total} total</div>
              </div>
            </div>

            {/* 14-day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {last14.map((day) => {
                const done = days.includes(day)
                const isToday = day === today
                return (
                  <button
                    key={day}
                    onClick={() => toggle(cat.key, day)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 4,
                      border: isToday
                        ? '1.5px solid var(--accent)'
                        : `1px solid ${done ? 'var(--accent-dim)' : 'var(--border)'}`,
                      background: done ? 'var(--accent-glow)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: done ? 'var(--accent)' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {day.slice(8)}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
