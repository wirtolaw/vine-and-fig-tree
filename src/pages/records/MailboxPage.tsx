import { useState, useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { formatDate } from '../../utils/date'
import { fetchLetters, addLetter, deleteLetter } from '../../utils/supabase'
import type { LetterRow } from '../../utils/supabase'

type View = 'list' | 'write' | 'read'

export default function MailboxPage() {
  const fetcher = useCallback(() => fetchLetters(), [])
  const [letters, loading, refresh] = useSupabase<LetterRow[]>('vft_mailbox_cache', fetcher, [])

  const [view, setView] = useState<View>('list')
  const [readingLetter, setReadingLetter] = useState<LetterRow | null>(null)

  // Write form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const openRead = (letter: LetterRow) => {
    setReadingLetter(letter)
    setView('read')
  }

  const openWrite = () => {
    setTitle('')
    setContent('')
    setView('write')
  }

  const send = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      await addLetter(title.trim(), trimmed)
      await refresh()
      setView('list')
    } catch { /* offline */ }
    setSending(false)
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this letter?')) return
    try {
      await deleteLetter(id)
      await refresh()
      setView('list')
    } catch { /* offline */ }
  }

  // --- Write view ---
  if (view === 'write') {
    return (
      <div>
        <button
          onClick={() => setView('list')}
          style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {'\u2039'} Back
        </button>

        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)', marginBottom: 16 }}>
          {'\u{1F48C}'} Write to Noe
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)..."
          style={{
            width: '100%', background: 'var(--bg-input)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '10px 12px', fontSize: 14, marginBottom: 10,
            color: 'var(--text)',
          }}
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your letter..."
          rows={12}
          style={{
            width: '100%', background: 'var(--bg-input)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 14, lineHeight: 1.8,
            resize: 'vertical', marginBottom: 12,
            color: 'var(--text)',
          }}
        />

        <button
          className="btn btn-accent"
          onClick={send}
          disabled={sending || !content.trim()}
          style={{ width: '100%', fontSize: 15, padding: '12px 0' }}
        >
          {sending ? 'Sending...' : 'Send \u{1F48C}'}
        </button>
      </div>
    )
  }

  // --- Read view ---
  if (view === 'read' && readingLetter) {
    return (
      <div>
        <button
          onClick={() => setView('list')}
          style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {'\u2039'} Back
        </button>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '24px 20px',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            {formatDate(readingLetter.date)}
          </div>

          {readingLetter.title && (
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)', marginBottom: 16 }}>
              {readingLetter.title}
            </div>
          )}

          <div style={{
            fontSize: 15,
            lineHeight: 2,
            color: '#e0e0e0',
            whiteSpace: 'pre-wrap',
          }}>
            {readingLetter.content}
          </div>
        </div>

        <button
          onClick={() => remove(readingLetter.id)}
          style={{
            marginTop: 16, fontSize: 12, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          Delete this letter
        </button>
      </div>
    )
  }

  // --- List view ---
  return (
    <div>
      {/* Write button */}
      <button
        onClick={openWrite}
        style={{
          width: '100%', padding: '14px 0',
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent-dim)',
          borderRadius: 'var(--radius)',
          color: 'var(--accent)',
          fontSize: 15, fontWeight: 600,
          marginBottom: 20,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {'\u{270F}\u{FE0F}'} Write a new letter
      </button>

      {loading && letters.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
        </div>
      )}

      {letters.map((letter) => {
        const preview = letter.title || letter.content.slice(0, 20) + (letter.content.length > 20 ? '...' : '')
        return (
          <button
            key={letter.id}
            onClick={() => openRead(letter)}
            style={{
              width: '100%', textAlign: 'left',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: 8,
              cursor: 'pointer',
              display: 'block',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              {formatDate(letter.date)}
            </div>
            <div style={{
              fontSize: 14, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {'\u300C'}{preview}{'\u300D'}
            </div>
          </button>
        )
      })}

      {!loading && letters.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>{'\u{1F48C}'}</div>
          <div style={{ fontSize: 14 }}>No letters yet.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Write your first one.</div>
        </div>
      )}
    </div>
  )
}
