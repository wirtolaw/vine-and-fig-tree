import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { formatRelativeTime } from '../../utils/date'
import type { Moment } from '../../types'

export default function MomentsPage() {
  const [moments, setMoments] = useLocalStorage<Moment[]>('vft_moments', [])
  const [text, setText] = useState('')

  const post = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const m: Moment = {
      id: crypto.randomUUID(),
      text: trimmed,
      timestamp: Date.now(),
      likes: 0,
    }
    setMoments((prev: Moment[]) => [m, ...prev])
    setText('')
  }

  const like = (id: string) => {
    setMoments((prev: Moment[]) =>
      prev.map((m: Moment) => m.id === id ? { ...m, likes: m.likes + 1 } : m)
    )
  }

  const remove = (id: string) => {
    setMoments((prev: Moment[]) => prev.filter((m: Moment) => m.id !== id))
  }

  return (
    <div>
      {/* Composer */}
      <div className="card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind..."
          rows={3}
          style={{
            width: '100%',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            padding: 12,
            fontSize: 14,
            resize: 'none',
            marginBottom: 8,
          }}
        />
        <button className="btn btn-accent" onClick={post} style={{ width: '100%' }}>
          Post
        </button>
      </div>

      {/* Feed */}
      {moments.map((m) => (
        <div key={m.id} className="card">
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}>
              N
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Noe</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {formatRelativeTime(m.timestamp)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, whiteSpace: 'pre-wrap' }}>
            {m.text}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={() => like(m.id)}
              style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {'\u2661'} {m.likes > 0 && m.likes}
            </button>
            <button
              onClick={() => remove(m.id)}
              style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}
            >
              {'\u00D7'}
            </button>
          </div>
        </div>
      ))}

      {moments.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No moments yet. Share your first thought.
        </div>
      )}
    </div>
  )
}
