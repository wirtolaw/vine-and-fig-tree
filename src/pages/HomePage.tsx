import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getDayCount, getToday } from '../utils/date'
import { useSupabase } from '../hooks/useSupabase'
import {
  fetchStones,
  fetchQuotes,
  fetchBacklogTodo, fetchDueReminders, toggleTodo,
  fetchHabitCategories, fetchHabitTasks,
} from '../utils/supabase'
import type { MemoryRow, QuoteRow, TodoRow, HabitCategory } from '../utils/supabase'

// --- French songs ---
interface FrenchSong { id: number; title: string; vocab_coverage_pct: number; status: string }

async function fetchFrenchSongs(): Promise<FrenchSong[]> {
  const res = await fetch(
    'https://jfoxsolxjefnqvwysdhd.supabase.co/rest/v1/french_songs?status=neq.learned&order=vocab_coverage_pct.desc&select=id,title,vocab_coverage_pct,status',
    {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmb3hzb2x4amVmbnF2d3lzZGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTY0MDUsImV4cCI6MjA4ODkyNDA1fQ.ZYbRPOmftlaeNZlUHLJMbjkUcDurzekdb4CSmc21syU',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmb3hzb2x4amVmbnF2d3lzZGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTY0MDUsImV4cCI6MjA4ODkyNDA1fQ.ZYbRPOmftlaeNZlUHLJMbjkUcDurzekdb4CSmc21syU',
      },
    }
  )
  return res.json()
}

export default function HomePage() {
  const dayCount = getDayCount()
  const today = getToday()

  // --- Random Quote ---
  const [quote, setQuote] = useState<QuoteRow | null>(null)
  useEffect(() => {
    fetchQuotes()
      .then((qs) => { if (qs.length > 0) setQuote(qs[Math.floor(Math.random() * qs.length)]) })
      .catch(() => {})
  }, [])

  // --- Stones count ---
  const fetchStonesCb = useCallback(() => fetchStones(), [])
  const [stones] = useSupabase<MemoryRow[]>('vft_stones_cache', fetchStonesCb, [])

  // --- Habit categories (dynamic from DB) ---
  const fetchCatsCb = useCallback(() => fetchHabitCategories(), [])
  const [categories] = useSupabase<HabitCategory[]>('vft_habit_categories', fetchCatsCb, [])

  // Today's habit tasks completion
  const [todayDone, setTodayDone] = useState<Record<number, boolean>>({})
  useEffect(() => {
    if (categories.length === 0) return
    Promise.all(categories.map((c) => fetchHabitTasks(c.id, today)))
      .then((results) => {
        const done: Record<number, boolean> = {}
        results.forEach((tasks, i) => {
          done[categories[i].id] = tasks.length > 0 && tasks.every((t) => t.done)
        })
        setTodayDone(done)
      })
      .catch(() => {})
  }, [categories, today])

  // --- French Songs ---
  const [songs, setSongs] = useState<FrenchSong[]>([])
  useEffect(() => {
    fetchFrenchSongs().then(setSongs).catch(() => {})
  }, [])

  // --- Backlog ---
  const [backlogItem, setBacklogItem] = useState<TodoRow | null>(null)
  useEffect(() => {
    fetchBacklogTodo()
      .then((items) => {
        if (items.length > 0) setBacklogItem(items[Math.floor(Math.random() * items.length)])
      })
      .catch(() => {})
  }, [])

  const markBacklogDone = async () => {
    if (!backlogItem) return
    try { await toggleTodo(backlogItem.id, true); setBacklogItem(null) } catch {}
  }

  // --- Reminders ---
  const [reminders, setReminders] = useState<TodoRow[]>([])
  useEffect(() => {
    fetchDueReminders(today).then(setReminders).catch(() => {})
  }, [today])

  const markReminderDone = async (r: TodoRow) => {
    try { await toggleTodo(r.id, true); setReminders((p) => p.filter((x) => x.id !== r.id)) } catch {}
  }

  return (
    <div className="page">
      {/* Day Counter */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>
          Noe & Lili
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1 }}>
          Day {dayCount}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          since March 11, 2026
        </div>
      </div>

      {/* Random Quote */}
      {quote && (
        <div style={{
          textAlign: 'center', marginBottom: 24, padding: '16px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 }}>
            {'\u201C'}{quote.text}{'\u201D'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {'\u2014'} {quote.author}{quote.source ? `, ${quote.source}` : ''}
          </div>
        </div>
      )}

      {/* Stones */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
          Love Stones
        </div>
        <div style={{ fontSize: 28, color: 'var(--accent)' }}>
          {stones.length}
        </div>
      </div>

      {/* Habits (dynamic from DB, clickable) */}
      <div style={{ marginTop: 8 }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
          Today's Habits
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const done = todayDone[cat.id] === true
            return (
              <Link
                key={cat.id}
                to={`/habits/${cat.id}/${today}`}
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
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, color: done ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {cat.display_name}
                </span>
                {done && (
                  <span style={{
                    position: 'absolute', top: 2, right: 4,
                    fontSize: 10, color: '#4CAF50',
                  }}>
                    {'\u2713'}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* French Songs Progress */}
      {songs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="card">
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
              {'\u{1F3B5}'} French Songs
            </div>
            {songs.map((s) => {
              const pct = Math.round(s.vocab_coverage_pct)
              const ready = pct >= 80
              return (
                <div key={s.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{s.title}</span>
                    <span style={{ fontSize: 12, color: ready ? '#4CAF50' : 'var(--accent)' }}>
                      {ready ? `Ready! \u{1F389}` : `${pct}%`}
                    </span>
                  </div>
                  <div style={{
                    height: 6, borderRadius: 3,
                    background: 'var(--border)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${Math.min(pct, 100)}%`,
                      background: ready ? '#4CAF50' : 'var(--accent)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Due Reminders */}
      {reminders.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
            Reminders
          </div>
          {reminders.map((r) => (
            <div key={r.id} className="card" style={{
              marginBottom: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 10,
              border: '1px solid rgba(76, 175, 80, 0.3)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{r.text}</div>
                {r.show_after && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Due: {r.show_after}
                  </div>
                )}
              </div>
              <button className="btn" onClick={() => markReminderDone(r)}
                style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}>
                Done
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Backlog */}
      {backlogItem && (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: '#888888', fontSize: 12, marginBottom: 6 }}>
            From the backlog...
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            padding: '12px 14px', background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, color: '#888888', fontStyle: 'italic', lineHeight: 1.5, flex: 1 }}>
              {backlogItem.text}
            </span>
            <button className="btn" onClick={markBacklogDone}
              style={{ fontSize: 11, padding: '4px 10px', color: '#888888', flexShrink: 0 }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
