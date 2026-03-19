import { useState, useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { fetchStones, addStone, deleteStone } from '../../utils/supabase'
import type { MemoryRow } from '../../utils/supabase'
import { format } from 'date-fns'
import { formatDate } from '../../utils/date'

function stars(w: number): string {
  return '\u{1F347}'.repeat(Math.max(1, Math.min(w, 5)))
}

export default function StonesPage() {
  const fetcher = useCallback(() => fetchStones(), [])
  const [stones, loading, refresh] = useSupabase<MemoryRow[]>('vft_stones_cache', fetcher, [])
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [weight, setWeight] = useState('5')
  const [openId, setOpenId] = useState<number | null>(null)

  const sorted = [...stones].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))

  const add = async () => {
    const trimmed = label.trim()
    if (!trimmed) return
    try {
      await addStone({
        date: format(new Date(), 'yyyy-MM-dd'),
        title: trimmed,
        summary: trimmed,
        weight: parseInt(weight) || 5,
      })
      setLabel('')
      setWeight('5')
      setShowForm(false)
      await refresh()
    } catch { /* offline */ }
  }

  const remove = async (id: number) => {
    try {
      await deleteStone(id)
      await refresh()
    } catch { /* offline */ }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {stones.length} stone{stones.length !== 1 ? 's' : ''} collected
        </span>
        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ fontSize: 13 }}>
          + Add
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What is this stone for..."
            style={{
              width: '100%', background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              fontSize: 14, marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Weight:</span>
            <input
              type="range" min="1" max="5" value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 14 }}>{stars(parseInt(weight) || 5)}</span>
          </div>
          <button className="btn btn-accent" onClick={add} style={{ width: '100%' }}>
            Add Stone
          </button>
        </div>
      )}

      {loading && stones.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
        </div>
      )}

      {sorted.map((s) => {
        const w = s.weight ?? 5
        const isOpen = openId === s.id
        return (
          <div key={s.id} className="card" style={{ marginBottom: 10 }}>
            <button
              onClick={() => setOpenId(isOpen ? null : s.id)}
              style={{ width: '100%', textAlign: 'left', padding: 0, background: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {s.title || '...'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {stars(w)} &middot; {formatDate(s.date)}
                  </div>
                </div>
                <span style={{
                  fontSize: 14, color: 'var(--text-muted)', marginLeft: 8,
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>
                  {'\u203A'}
                </span>
              </div>
            </button>

            {isOpen && (
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--border)',
                fontSize: 13, lineHeight: 1.7,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}>
                {s.summary || s.title}
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => remove(s.id)}
                    style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {!loading && stones.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No stones yet. Every little thing counts.
        </div>
      )}
    </div>
  )
}
