import { useState, useEffect, useCallback } from 'react'
import { HABIT_CATEGORIES } from '../constants'
import { getDayCount, getToday } from '../utils/date'
import { useSupabase } from '../hooks/useSupabase'
import {
  fetchKisses, updateKisses,
  fetchStones,
  fetchHabits, checkInHabit, uncheckHabit,
} from '../utils/supabase'
import type { MemoryRow, HabitRow } from '../utils/supabase'

// Map app habit keys to DB category names
const HABIT_KEY_TO_DB: Record<string, string> = {
  jobhunt: 'job',
}
function toDbCategory(key: string): string {
  return HABIT_KEY_TO_DB[key] || key
}
function toAppKey(dbCat: string): string {
  if (dbCat === 'job') return 'jobhunt'
  return dbCat
}

export default function HomePage() {
  const dayCount = getDayCount()
  const today = getToday()

  // --- Kisses ---
  const [kissCount, setKissCount] = useState<number>(() => {
    try {
      const c = localStorage.getItem('vft_kiss')
      return c ? parseInt(c, 10) || 0 : 0
    } catch { return 0 }
  })
  const [kissLoading, setKissLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchKisses()
      .then((v) => { if (!cancelled) { setKissCount(v); localStorage.setItem('vft_kiss', String(v)) } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setKissLoading(false) })
    return () => { cancelled = true }
  }, [])

  const addKisses = async (n: number) => {
    const next = kissCount + n
    setKissCount(next)
    localStorage.setItem('vft_kiss', String(next))
    try { await updateKisses(next) } catch { /* offline, local updated */ }
  }

  // --- Stones count ---
  const fetchStonesCb = useCallback(() => fetchStones(), [])
  const [stones] = useSupabase<MemoryRow[]>('vft_stones_cache', fetchStonesCb, [])

  // --- Habits ---
  const fetchHabitsCb = useCallback(() => fetchHabits(), [])
  const [habits, , refreshHabits] = useSupabase<HabitRow[]>('vft_habits_cache', fetchHabitsCb, [])

  // Build a set of today's checked-in habit keys
  const todayCheckedKeys = new Set(
    habits
      .filter((h) => h.date === today)
      .map((h) => toAppKey(h.category)),
  )

  const toggleHabit = async (key: string) => {
    const dbCat = toDbCategory(key)
    try {
      if (todayCheckedKeys.has(key)) {
        await uncheckHabit(today, dbCat)
      } else {
        await checkInHabit({ date: today, category: dbCat })
      }
      await refreshHabits()
    } catch { /* offline */ }
  }

  return (
    <div className="page">
      {/* Day Counter */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>
          Noe & Lili
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
        <div style={{ fontSize: 36, color: 'var(--accent)', fontWeight: 600, marginBottom: 12, opacity: kissLoading ? 0.5 : 1 }}>
          {kissCount}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn" onClick={() => addKisses(1)}
            style={{ fontSize: 16, padding: '8px 24px' }}>
            +1
          </button>
          <button className="btn" onClick={() => addKisses(3)}
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
            const done = todayCheckedKeys.has(h.key)
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
