import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchBooks,
  fetchBookPage,
  fetchPageAnnotations,
  fetchBookMaxPage,
  addAnnotation,
  updateReadingProgress,
} from '../../utils/supabase'
import type { BookRow, BookParagraphRow, AnnotationRow } from '../../utils/supabase'

export default function BookReaderPage() {
  const { bookId, page } = useParams<{ bookId: string; page: string }>()
  const navigate = useNavigate()
  const bId = Number(bookId)
  const pageNum = Number(page)

  const [book, setBook] = useState<BookRow | null>(null)
  const [paragraphs, setParagraphs] = useState<BookParagraphRow[]>([])
  const [annotations, setAnnotations] = useState<AnnotationRow[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null)
  const [annotationText, setAnnotationText] = useState('')
  const [sending, setSending] = useState(false)

  const loadPage = useCallback(async () => {
    setLoading(true)
    try {
      const [books, paras, maxPage] = await Promise.all([
        fetchBooks(),
        fetchBookPage(bId, pageNum),
        fetchBookMaxPage(bId),
      ])
      const foundBook = books.find((b) => b.id === bId) || null
      setBook(foundBook)
      setParagraphs(paras)
      setTotalPages(maxPage)

      if (paras.length > 0) {
        const paraIds = paras.map((p) => p.id)
        const annots = await fetchPageAnnotations(bId, paraIds)
        setAnnotations(annots)
      } else {
        setAnnotations([])
      }

      // update reading progress
      if (paras.length > 0) {
        const lastPara = paras[paras.length - 1]
        updateReadingProgress(bId, lastPara.paragraph_index).catch(() => {})
      }
    } catch (err) {
      console.error('Failed to load page:', err)
    } finally {
      setLoading(false)
    }
  }, [bId, pageNum])

  useEffect(() => {
    loadPage()
    setActiveParagraph(null)
    setAnnotationText('')
  }, [loadPage])

  const handleAnnotation = async (paragraphId: number) => {
    if (!annotationText.trim() || sending) return
    setSending(true)
    try {
      await addAnnotation(bId, paragraphId, annotationText.trim())
      setAnnotationText('')
      setActiveParagraph(null)
      // reload annotations
      const paraIds = paragraphs.map((p) => p.id)
      const annots = await fetchPageAnnotations(bId, paraIds)
      setAnnotations(annots)
    } catch (err) {
      console.error('Failed to add annotation:', err)
    } finally {
      setSending(false)
    }
  }

  const goPage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      navigate(`/records/reading/${bId}/${p}`, { replace: true })
    }
  }

  if (loading && !book) {
    return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => navigate('/records/reading')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', padding: 0 }}
        >{'\u2190'}</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{book?.title || ''}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Page {pageNum} / {totalPages}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        background: '#1a1816',
        borderRadius: 'var(--radius)',
        padding: 20,
        marginBottom: 16,
      }}>
        {paragraphs.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No content on this page.</div>
        )}

        {paragraphs.map((para) => {
          const paraAnnotations = annotations.filter((a) => a.paragraph_id === para.id)
          const isActive = activeParagraph === para.id

          return (
            <div key={para.id} style={{ marginBottom: 20 }}>
              {/* Paragraph text */}
              <div
                onClick={() => {
                  setActiveParagraph(isActive ? null : para.id)
                  setAnnotationText('')
                }}
                style={{
                  color: '#e0e0e0',
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1.8,
                  fontSize: 15,
                  cursor: 'pointer',
                  padding: '4px 0',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  paddingLeft: 12,
                  transition: 'border-color 0.2s',
                }}
              >
                {para.content}
              </div>

              {/* Annotations */}
              {paraAnnotations.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 12 }}>
                  {paraAnnotations.map((ann) => {
                    const isNoe = ann.author === 'noe'
                    return (
                      <div
                        key={ann.id}
                        style={{
                          display: 'flex',
                          justifyContent: isNoe ? 'flex-start' : 'flex-end',
                          marginBottom: 6,
                        }}
                      >
                        <div style={{
                          maxWidth: '80%',
                          padding: '8px 12px',
                          borderRadius: 12,
                          background: isNoe ? '#4a9eff' : '#ff69b4',
                          color: '#fff',
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}>
                          {ann.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Annotation input */}
              {isActive && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 12 }}>
                  <input
                    autoFocus
                    placeholder="Add a note..."
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAnnotation(para.id)
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      color: '#e0e0e0',
                      fontSize: 13,
                    }}
                  />
                  <button
                    onClick={() => handleAnnotation(para.id)}
                    disabled={sending || !annotationText.trim()}
                    style={{
                      padding: '8px 14px',
                      background: '#ff69b4',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 13,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: (!annotationText.trim() || sending) ? 0.5 : 1,
                    }}
                  >
                    {'\u2191'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => goPage(pageNum - 1)}
          disabled={pageNum <= 1}
          style={{
            padding: '10px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: pageNum <= 1 ? 'var(--text-muted)' : 'var(--text)',
            fontSize: 14,
            cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
          }}
        >
          {'\u2190'} Prev
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pageNum} / {totalPages}</span>
        <button
          onClick={() => goPage(pageNum + 1)}
          disabled={pageNum >= totalPages}
          style={{
            padding: '10px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: pageNum >= totalPages ? 'var(--text-muted)' : 'var(--text)',
            fontSize: 14,
            cursor: pageNum >= totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next {'\u2192'}
        </button>
      </div>
    </div>
  )
}
