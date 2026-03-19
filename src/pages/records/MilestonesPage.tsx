import { useState, useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { formatDate } from '../../utils/date'
import { fetchMilestones, addMilestone, deleteMilestone } from '../../utils/supabase'
import type { MemoryRow } from '../../utils/supabase'

export default function MilestonesPage() {
  const fetcher = useCallback(() => fetchMilestones(), [])
  const [milestones, loading, refresh] = useSupabase<MemoryRow[]>('vft_milestones_cache', fetcher, [])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')

  // Milestones come sorted asc from API; reverse for display (newest first)
  const sorted = [...milestones].reverse()

  const add = async () => {
    if (!title.trim() || !date) return
    // Store title + description in the text field separated by newline
    const text = desc.trim() ? `${title.trim()}\n${desc.trim()}` : title.trim()
    try {
      await addMilestone({ date, text })
      setTitle('')
      setDesc('')
      setDate('')
      setShowForm(false)
      await refresh()
    } catch { /* offline */ }
  }

  const remove = async (id: number) => {
    try {
      await deleteMilestone(id)
      await refresh()
    } catch { /* offline */ }
  }

  // Parse title/description from text field
  function parseTitle(text: string): string {
    const idx = text.indexOf('\n')
    return idx >= 0 ? text.slice(0, idx) : text
  }
  function parseDesc(text: string): string {
    const idx = text.indexOf('\n')
    return idx >= 0 ? text.slice(idx + 1) : ''
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

      {loading && milestones.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
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

        {sorted.map((m) => {
          const mTitle = parseTitle(m.text)
          const mDesc = parseDesc(m.text)
          return (
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
                {mTitle}
              </div>
              {mDesc && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {mDesc}
                </div>
              )}
              <button
                onClick={() => remove(m.id)}
                style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}
              >
                remove
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
