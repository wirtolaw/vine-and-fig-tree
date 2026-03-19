import { useCallback } from 'react'
import { HABIT_CATEGORIES } from '../constants'
import { getToday } from '../utils/date'
import { format, subDays } from 'date-fns'
import { useSupabase } from '../hooks/useSupabase'
import { fetchHabits, checkInHabit, uncheckHabit } from '../utils/supabase'
import type { HabitRow } from '../utils/supabase'

// Map app keys <-> DB categories
const APP_TO_DB: Record<string, string> = { jobhunt: 'job' }
const DB_TO_APP: Record<string, string> = { job: 'jobhunt' }
function toDbCat(key: string): string { return APP_TO_DB[key] || key }
function toAppKey(cat: string): string { return DB_TO_APP[cat] || cat }

function getStreak(checkedDays: Set<string>, today: string): number {
  let streak = 0
  let d = new Date(today + 'T00:00:00')
  while (checkedDays.has(format(d, 'yyyy-MM-dd'))) {
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
  const fetcher = useCallback(() => fetchHabits(), [])
  const [habits, , refresh] = useSupabase<HabitRow[]>('vft_habits_cache', fetcher, [])
  const today = getToday()
  const last14 = getLast14()

  // Build per-category day sets
  const categoryDays: Record<string, Set<string>> = {}
  for (const h of habits) {
    const appKey = toAppKey(h.category)
    if (!categoryDays[appKey]) categoryDays[appKey] = new Set()
    categoryDays[appKey].add(h.date)
  }

  const toggle = async (key: string, day: string) => {
    const dbCat = toDbCat(key)
    const days = categoryDays[key] || new Set()
    try {
      if (days.has(day)) {
        await uncheckHabit(day, dbCat)
      } else {
        await checkInHabit({ date: day, category: dbCat })
      }
      await refresh()
    } catch { /* offline */ }
  }

  return (
    <div className="page">
      <div className="page-title">Habits</div>

      {HABIT_CATEGORIES.map((cat) => {
        const days = categoryDays[cat.key] || new Set<string>()
        const streak = getStreak(days, today)
        const total = days.size

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
                const done = days.has(day)
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
