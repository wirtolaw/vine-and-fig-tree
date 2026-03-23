import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../hooks/useSupabase'
import { fetchBooks, fetchReadingProgress } from '../../utils/supabase'
import type { BookRow } from '../../utils/supabase'
import { useState, useEffect } from 'react'

function BookCard({ book }: { book: BookRow }) {
  const navigate = useNavigate()
  const [progressPct, setProgressPct] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchReadingProgress(book.id).then((p) => {
      if (cancelled) return
      if (p && book.total_paragraphs > 0) {
        setProgressPct(Math.round((p.current_paragraph / book.total_paragraphs) * 100))
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [book.id, book.total_paragraphs])

  return (
    <div
      onClick={() => navigate(`/records/reading/${book.id}/1`)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{book.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{book.author}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{progressPct}% read</div>
      <div style={{
        marginTop: 6,
        height: 4,
        borderRadius: 2,
        background: 'var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progressPct}%`,
          height: '100%',
          background: 'var(--accent)',
          borderRadius: 2,
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}

export default function BookshelfPage() {
  const navigate = useNavigate()
  const fetcher = useCallback(() => fetchBooks(), [])
  const [books, loading] = useSupabase<BookRow[]>('vft_books_cache', fetcher, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{'\u{1F4DA}'} Bookshelf</div>
        <button
          onClick={() => navigate('/records/reading/upload')}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text)',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>

      {loading && books.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</div>
      )}

      {!loading && books.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          No books yet. Tap + to upload one.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {books.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
  )
}
