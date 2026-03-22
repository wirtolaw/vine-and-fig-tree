import { useState, useCallback, useEffect } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { formatRelativeTime } from '../../utils/date'
import {
  fetchMoments, addMoment, likeMoment, deleteMoment,
  fetchMomentReplies, addMomentReply,
} from '../../utils/supabase'
import type { MomentRow, MomentReply } from '../../utils/supabase'
import { format } from 'date-fns'

function ReplySection({ momentId }: { momentId: number }) {
  const [replies, setReplies] = useState<MomentReply[]>([])
  const [expanded, setExpanded] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [count, setCount] = useState(0)

  const loadReplies = useCallback(async () => {
    try {
      const r = await fetchMomentReplies(momentId)
      setReplies(r)
      setCount(r.length)
    } catch { /* offline */ }
  }, [momentId])

  useEffect(() => { loadReplies() }, [loadReplies])

  const send = async () => {
    const trimmed = replyText.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      await addMomentReply(momentId, trimmed)
      setReplyText('')
      await loadReplies()
    } catch { /* offline */ }
    setSending(false)
  }

  return (
    <div style={{ marginTop: 8 }}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          padding: '4px 0',
          cursor: 'pointer',
        }}
      >
        {'\u{1F4AC}'} {count > 0 ? count : ''}
      </button>

      {expanded && (
        <div style={{ marginTop: 8 }}>
          {/* Reply list */}
          {replies.map((r) => {
            const isNoe = r.author === 'noe'
            return (
              <div
                key={r.id}
                style={{
                  padding: '8px 10px',
                  marginBottom: 6,
                  borderRadius: 'var(--radius-sm)',
                  background: isNoe ? 'var(--accent-glow)' : 'rgba(200, 130, 168, 0.1)',
                  borderLeft: `3px solid ${isNoe ? 'var(--accent-dim)' : '#c882a8'}`,
                }}
              >
                <div style={{
                  fontSize: 11,
                  color: isNoe ? 'var(--accent)' : '#c882a8',
                  fontWeight: 600,
                  marginBottom: 4,
                }}>
                  {isNoe ? 'Noe' : 'Lili'}
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                    {formatRelativeTime(new Date(r.created_at).getTime())}
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                  {r.text}
                </div>
              </div>
            )
          })}

          {/* Reply input */}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              placeholder="Reply..."
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                fontSize: 13,
                color: 'var(--text)',
              }}
            />
            <button
              onClick={send}
              disabled={sending}
              className="btn btn-accent"
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
        author: 'lili',
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
    if (!window.confirm('Delete this moment?')) return
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
      {moments.map((m) => {
        const isLili = m.author === 'lili'
        const avatarLetter = isLili ? 'L' : 'N'
        const avatarName = isLili ? 'Lili' : 'Noe'
        const avatarBg = isLili ? 'rgba(200, 130, 168, 0.15)' : 'var(--accent-glow)'
        const avatarBorder = isLili ? 'rgba(200, 130, 168, 0.5)' : 'var(--accent-dim)'
        const avatarColor = isLili ? '#c882a8' : 'var(--accent)'
        return (
        <div key={m.id} className="card">
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: avatarBg, border: `1px solid ${avatarBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: avatarColor, fontWeight: 700, fontSize: 16, flexShrink: 0,
            }}>
              {avatarLetter}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{avatarName}</div>
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

          {/* Replies */}
          <ReplySection momentId={m.id} />
        </div>
        )
      })}

      {!loading && moments.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No moments yet. Share your first thought.
        </div>
      )}
    </div>
  )
}
