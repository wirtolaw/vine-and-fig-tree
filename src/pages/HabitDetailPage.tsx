import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupabase } from '../hooks/useSupabase'
import {
  fetchHabitCategories,
  fetchHabitTasks,
  addHabitTask,
  toggleHabitTask,
  deleteHabitTask,
  fetchHabitJournal,
  saveHabitJournal,
} from '../utils/supabase'
import type { HabitCategory, HabitTask } from '../utils/supabase'

export default function HabitDetailPage() {
  const { categoryId, date } = useParams<{ categoryId: string; date: string }>()
  const catId = Number(categoryId)
  const dateStr = date || ''

  // Category info
  const fetchCats = useCallback(() => fetchHabitCategories(), [])
  const [categories] = useSupabase<HabitCategory[]>('vft_habit_categories', fetchCats, [])
  const category = categories.find((c) => c.id === catId)

  // Tasks
  const fetchT = useCallback(() => fetchHabitTasks(catId, dateStr), [catId, dateStr])
  const [tasks, tasksLoading, refreshTasks] = useSupabase<HabitTask[]>(
    `vft_habit_tasks_${catId}_${dateStr}`, fetchT, [],
  )

  // Local optimistic overrides for done state
  const [localDone, setLocalDone] = useState<Record<number, boolean>>({})
  const getDone = (t: HabitTask): boolean => localDone[t.id] ?? t.done

  // New task input
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAddTask = async () => {
    const trimmed = newText.trim()
    if (!trimmed || adding) return
    setAdding(true)
    try {
      await addHabitTask({ category_id: catId, date: dateStr, text: trimmed })
      setNewText('')
      await refreshTasks()
    } catch { /* offline */ }
    setAdding(false)
  }

  const handleToggle = async (t: HabitTask) => {
    const newDone = !getDone(t)
    setLocalDone((prev) => ({ ...prev, [t.id]: newDone }))
    try {
      await toggleHabitTask(t.id, newDone)
      await refreshTasks()
      setLocalDone((prev) => {
        const next = { ...prev }
        delete next[t.id]
        return next
      })
    } catch { /* offline - keep local */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteHabitTask(id)
      await refreshTasks()
    } catch { /* offline */ }
  }

  // Journal
  const [journalContent, setJournalContent] = useState('')
  const [journalLoaded, setJournalLoaded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchHabitJournal(catId, dateStr)
      .then((j) => {
        if (!cancelled) {
          setJournalContent(j?.content || '')
          setJournalLoaded(true)
        }
      })
      .catch(() => { if (!cancelled) setJournalLoaded(true) })
    return () => { cancelled = true }
  }, [catId, dateStr])

  const handleJournalChange = (value: string) => {
    setJournalContent(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveHabitJournal(catId, dateStr, value).catch(() => {})
    }, 500)
  }

  // Completion stats
  const completedCount = tasks.filter((t) => getDone(t)).length
  const totalCount = tasks.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (!categoryId || !date) {
    return <div className="page"><div className="page-title">Invalid URL</div></div>
  }

  return (
    <div className="page">
      <Link to="/habits" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, display: 'block' }}>
        {'\u2039'} Back
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{category?.icon || ''}</span>
        <div>
          <div className="page-title" style={{ marginBottom: 0 }}>
            {category?.display_name || 'Loading...'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
        Tasks
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {tasksLoading && tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16, fontSize: 13 }}>
            Loading...
          </div>
        )}

        {tasks.map((t) => {
          const done = getDone(t)
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => handleToggle(t)}
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                  flexShrink: 0,
                  color: done ? '#4CAF50' : 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {done ? '\u2611' : '\u2610'}
              </button>
              <span style={{
                flex: 1,
                fontSize: 14,
                color: done ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: done ? 'line-through' : 'none',
                lineHeight: 1.5,
              }}>
                {t.text}
              </span>
              <button
                onClick={() => handleDelete(t.id)}
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
              >
                {'\u2715'}
              </button>
            </div>
          )
        })}

        {!tasksLoading && tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 12, fontSize: 13 }}>
            No tasks yet. Add one below.
          </div>
        )}

        {/* Add task input */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask() }}
            placeholder="Add a task..."
            style={{
              flex: 1,
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              fontSize: 13,
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          <button
            className="btn btn-accent"
            onClick={handleAddTask}
            disabled={adding}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Journal */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
        Journal
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <textarea
          value={journalContent}
          onChange={(e) => handleJournalChange(e.target.value)}
          placeholder={journalLoaded ? 'Write your notes...' : 'Loading...'}
          rows={5}
          style={{
            width: '100%',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            padding: 10,
            fontSize: 13,
            resize: 'vertical',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            lineHeight: 1.6,
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Auto-saves as you type &middot; Author: lili
        </div>
      </div>

      {/* Completion bar */}
      {totalCount > 0 && (
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {completedCount}/{totalCount} ({pct}%)
          </div>
          <div style={{
            height: 8,
            borderRadius: 4,
            background: 'var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, rgba(76,175,80,0.5), #4CAF50)`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
