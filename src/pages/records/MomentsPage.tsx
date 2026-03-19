import { useState, useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { formatRelativeTime } from '../../utils/date'
import {
  fetchMoments, addMoment, likeMoment, deleteMoment,
} from '../../utils/supabase'
import type { MomentRow } from '../../utils/supabase'
import { format } from 'date-fns'

export default function MomentsPage() {
  const fetcher = useCallback(() => fetchMoments(), [])
  const [moments, loading, refresh] = useSupabase<MomentRow[]>('vft_moments_cache', fetcher, [])
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  const post = async () => {
    const trimmed = text.trim()
    if (!trimmed || posting) return
    setPosting(true)
    try {
      await addMoment({
        date: format(new Date(), 'yyyy-MM-dd'),
        text: trimmed,
        source: 'app',
      })
      setText('')
      await refresh()
    } catch { /* offline */ }
    setPosting(false)
  }

  const like = async (m: MomentRow) => {
    try {
      await likeMoment(m.id, m.likes)
      await refresh()
    } catch { /* offline */ }
  }

  const remove = async (id: number) => {
    try {
      await deleteMoment(id)
      await refresh()
    } catch { /* offline */ }
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
        <button className="btn btn-accent" onClick={post} disabled={posting} style={{ width: '100%' }}>
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {loading && moments.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
        </div>
      )}

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
                {formatRelativeTime(new Date(m.created_at).getTime())}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, whiteSpace: 'pre-wrap' }}>
            {m.text}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={() => like(m)}
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

      {!loading && moments.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No moments yet. Share your first thought.
        </div>
      )}
    </div>
  )
}
