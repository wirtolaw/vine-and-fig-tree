import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { LoveStone } from '../../types'

export default function StonesPage() {
  const [stones, setStones] = useLocalStorage<LoveStone[]>('vft_stones', [])
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [weight, setWeight] = useState('5')

  const sorted = [...stones].sort((a, b) => b.weight - a.weight)

  const add = () => {
    const s: LoveStone = {
      id: crypto.randomUUID(),
      number: stones.length + 1,
      weight: parseInt(weight) || 5,
      label: label.trim(),
      addedAt: Date.now(),
    }
    setStones((prev: LoveStone[]) => [...prev, s])
    setLabel('')
    setWeight('5')
    setShowForm(false)
  }

  const remove = (id: string) => {
    setStones((prev: LoveStone[]) => prev.filter((s: LoveStone) => s.id !== id))
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
              width: '100%',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: 14,
              marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Weight:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 14, color: 'var(--accent)', width: 20, textAlign: 'center' }}>
              {weight}
            </span>
          </div>
          <button className="btn btn-accent" onClick={add} style={{ width: '100%' }}>
            Add Stone
          </button>
        </div>
      )}

      {sorted.map((s) => (
        <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 24 + s.weight * 3,
            height: 24 + s.weight * 3,
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: 'var(--accent)',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            #{s.number}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>{s.label || '...'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              weight {s.weight}
            </div>
          </div>
          <button onClick={() => remove(s.id)} style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {'\u00D7'}
          </button>
        </div>
      ))}

      {stones.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No stones yet. Every little thing counts.
        </div>
      )}
    </div>
  )
}
