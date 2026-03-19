import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { HABIT_CATEGORIES } from '../constants'
import { getToday } from '../utils/date'
import { formatDate } from '../utils/date'
import { format, subDays } from 'date-fns'
import { useSupabase } from '../hooks/useSupabase'
import {
  fetchHabits, checkInHabit, uncheckHabit,
  fetchHabitLogs, addHabitLog,
} from '../utils/supabase'
import type { HabitRow, HabitLogRow } from '../utils/supabase'

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

export default function HabitDetailPage() {
  const { key } = useParams<{ key: string }>()
  const cat = HABIT_CATEGORIES.find((c) => c.key === key)
  const today = getToday()
  const last14 = getLast14()
  const dbCat = toDbCat(key || '')

  // Habits
  const fetchH = useCallback(() => fetchHabits(), [])
  const [habits, , refreshHabits] = useSupabase<HabitRow[]>('vft_habits_cache', fetchH, [])

  const days = new Set(
    habits.filter((h) => toAppKey(h.category) === key).map((h) => h.date)
  )
  const streak = getStreak(days, today)
  const total = days.size

  const toggle = async (day: string) => {
    try {
      if (days.has(day)) {
        await uncheckHabit(day, dbCat)
      } else {
        await checkInHabit({ date: day, category: dbCat })
      }
      await refreshHabits()
    } catch { /* offline */ }
  }

  // Logs
  const fetchL = useCallback(() => fetchHabitLogs(dbCat), [dbCat])
  const [logs, logsLoading, refreshLogs] = useSupabase<HabitLogRow[]>(`vft_habitlogs_${key}`, fetchL, [])
  const [logText, setLogText] = useState('')
  const [posting, setPosting] = useState(false)

  const postLog = async () => {
    const trimmed = logText.trim()
    if (!trimmed || posting) return
    setPosting(true)
    try {
      await addHabitLog({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: dbCat,
        content: trimmed,
        author: 'lili',
      })
      setLogText('')
      await refreshLogs()
    } catch { /* offline */ }
    setPosting(false)
  }

  if (!cat) {
    return <div className="page"><div className="page-title">Not found</div></div>
  }

  return (
    <div className="page">
      <Link to="/habits" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, display: 'block' }}>
        {'\u2039'} Back
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{cat.icon}</span>
        <div>
          <div className="page-title" style={{ marginBottom: 0 }}>{cat.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {streak} day streak &middot; {total} total
          </div>
        </div>
      </div>

      {/* 14-day grid */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {last14.map((day) => {
            const done = days.has(day)
            const isToday = day === today
            return (
              <button
                key={day}
                onClick={() => toggle(day)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 6,
                  border: isToday
                    ? '2px solid var(--accent)'
                    : `1px solid ${done ? 'var(--accent-dim)' : 'var(--border)'}`,
                  background: done ? 'var(--accent-glow)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: done ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: isToday ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {day.slice(8)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Logs */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
        Logs
      </div>

      {/* Add log */}
      <div className="card" style={{ marginBottom: 12 }}>
        <textarea
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          placeholder="Add a log entry..."
          rows={2}
          style={{
            width: '100%', background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)', padding: 10,
            fontSize: 13, resize: 'none', marginBottom: 6,
          }}
        />
        <button className="btn btn-accent" onClick={postLog} disabled={posting}
          style={{ width: '100%', fontSize: 13 }}>
          {posting ? 'Saving...' : 'Add Log'}
        </button>
      </div>

      {logsLoading && logs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: 13 }}>
          Loading...
        </div>
      )}

      {logs.map((l) => (
        <div key={l.id} className="card" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            {formatDate(l.date)}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {l.content}
          </div>
        </div>
      ))}

      {!logsLoading && logs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: 13 }}>
          No logs yet.
        </div>
      )}
    </div>
  )
}
