import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getToday } from '../utils/date'
import { format, subDays } from 'date-fns'
import { useSupabase } from '../hooks/useSupabase'
import { fetchHabitCategories, fetchHabitTasksRange } from '../utils/supabase'
import type { HabitCategory, HabitTask } from '../utils/supabase'

function get14Days(): string[] {
  const result: string[] = []
  const now = new Date()
  // 10 days back + today + 3 days forward = 14
  for (let i = 10; i >= -3; i--) {
    result.push(format(subDays(now, i), 'yyyy-MM-dd'))
  }
  return result
}

function getCompletionColor(pct: number): string {
  if (pct <= 0) return 'transparent'
  // Interpolate from transparent to #4CAF50 at 30% opacity
  const alpha = Math.min(pct, 1) * 0.4
  return `rgba(76, 175, 80, ${alpha})`
}

export default function HabitsPage() {
  const today = getToday()
  const last14 = get14Days()
  const startDate = last14[0]
  const endDate = last14[last14.length - 1]

  const fetchCats = useCallback(() => fetchHabitCategories(), [])
  const [categories] = useSupabase<HabitCategory[]>('vft_habit_categories', fetchCats, [])

  const fetchTasks = useCallback(() => fetchHabitTasksRange(startDate, endDate), [startDate, endDate])
  const [tasks] = useSupabase<HabitTask[]>('vft_habit_tasks_14d', fetchTasks, [])

  // Group tasks by category_id + date
  const taskMap: Record<string, { total: number; completed: number }> = {}
  for (const t of tasks) {
    const key = `${t.category_id}_${t.date}`
    if (!taskMap[key]) taskMap[key] = { total: 0, completed: 0 }
    taskMap[key].total++
    if (t.done) taskMap[key].completed++
  }

  // Category day sets for streak calculation (a day counts if there are tasks and all done, or at least one done)
  function getStreak(categoryId: number): number {
    let streak = 0
    let d = new Date(today + 'T00:00:00')
    while (true) {
      const dayStr = format(d, 'yyyy-MM-dd')
      const key = `${categoryId}_${dayStr}`
      const entry = taskMap[key]
      if (entry && entry.total > 0 && entry.completed > 0) {
        streak++
        d = subDays(d, 1)
      } else {
        break
      }
    }
    return streak
  }

  function getTotalDays(categoryId: number): number {
    const seen = new Set<string>()
    for (const t of tasks) {
      if (t.category_id === categoryId && t.done) {
        seen.add(t.date)
      }
    }
    return seen.size
  }

  return (
    <div className="page">
      <div className="page-title">Habits</div>

      {categories.map((cat) => {
        const streak = getStreak(cat.id)
        const totalDays = getTotalDays(cat.id)

        return (
          <Link
            key={cat.id}
            to={`/habits/${cat.id}/${today}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{cat.display_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div>{streak} day streak</div>
                    <div style={{ color: 'var(--text-muted)' }}>{totalDays} total</div>
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{'\u203A'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {last14.map((day) => {
                  const key = `${cat.id}_${day}`
                  const entry = taskMap[key]
                  const pct = entry && entry.total > 0 ? entry.completed / entry.total : 0
                  const isToday = day === today
                  return (
                    <Link
                      key={day}
                      to={`/habits/${cat.id}/${day}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          aspectRatio: '1',
                          borderRadius: 4,
                          border: isToday
                            ? '1.5px solid var(--accent)'
                            : `1px solid ${pct > 0 ? 'var(--accent-dim)' : 'var(--border)'}`,
                          background: getCompletionColor(pct),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: pct > 0 ? '#4CAF50' : 'var(--text-muted)',
                        }}
                      >
                        {day.slice(8)}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
