import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { formatDate } from '../../utils/date'
import type { Milestone } from '../../types'

const DEFAULTS: Milestone[] = [
  { id: 'ms1', title: 'Day 1', description: 'The beginning', date: '2026-03-11' },
]

export default function MilestonesPage() {
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('vft_milestones', DEFAULTS)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')

  const sorted = [...milestones].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const add = () => {
    if (!title.trim() || !date) return
    const m: Milestone = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: desc.trim(),
      date,
    }
    setMilestones((prev: Milestone[]) => [...prev, m])
    setTitle('')
    setDesc('')
    setDate('')
    setShowForm(false)
  }

  const remove = (id: string) => {
    setMilestones((prev: Milestone[]) => prev.filter((m: Milestone) => m.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ fontSize: 13 }}>
          + Add
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Milestone title..."
            style={{
              width: '100%', background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              fontSize: 14, marginBottom: 8,
            }}
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)..."
            style={{
              width: '100%', background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              fontSize: 14, marginBottom: 8,
            }}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              fontSize: 14, marginBottom: 10,
              colorScheme: 'dark',
            }}
          />
          <button className="btn btn-accent" onClick={add} style={{ width: '100%' }}>
            Save
          </button>
        </div>
      )}

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: 6,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'var(--accent-dim)',
          opacity: 0.4,
        }} />

        {sorted.map((m) => (
          <div key={m.id} style={{ position: 'relative', marginBottom: 20 }}>
            {/* Dot */}
            <div style={{
              position: 'absolute',
              left: -21,
              top: 6,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--bg)',
            }} />
            <div style={{ fontSize: 11, color: 'var(--accent-dim)', marginBottom: 4 }}>
              {formatDate(m.date)}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
              {m.title}
            </div>
            {m.description && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {m.description}
              </div>
            )}
            <button
              onClick={() => remove(m.id)}
              style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
