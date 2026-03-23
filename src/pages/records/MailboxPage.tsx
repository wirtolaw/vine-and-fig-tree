import { useState, useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { formatDate } from '../../utils/date'
import { fetchLetters } from '../../utils/supabase'
import type { LetterRow } from '../../utils/supabase'

export default function MailboxPage() {
  const fetcher = useCallback(() => fetchLetters(), [])
  const [letters, loading] = useSupabase<LetterRow[]>('vft_mailbox_cache', fetcher, [])
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === String(id) ? null : String(id)))
  }

  return (
    <div>
      {loading && letters.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
        </div>
      )}

      {letters.map((letter) => {
        const isOpen = openId === String(letter.id)
        const preview = letter.content.split('\n').find((l) => l.trim().length > 0) || ''

        return (
          <div key={letter.id} className="card" style={{ marginBottom: 12 }}>
            <button
              onClick={() => toggle(letter.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 0,
                background: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                    {letter.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {letter.author} &middot; {formatDate(letter.date)}
                  </div>
                  {!isOpen && (
                    <div style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}>
                      {preview}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  marginLeft: 8,
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>
                  {'\u203A'}
                </span>
              </div>
            </button>

            {isOpen && (
              <div style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                fontSize: 14,
                lineHeight: 1.75,
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
              }}>
                {letter.content}
              </div>
            )}
          </div>
        )
      })}

      {!loading && letters.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No letters yet.
        </div>
      )}
    </div>
  )
}
