import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook, uploadParagraphs, updateBookTotal } from '../../utils/supabase'

export default function BookUploadPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setText(reader.result)
      }
    }
    reader.readAsText(file)
  }

  const submit = async () => {
    if (!title.trim() || !text.trim()) return
    setSubmitting(true)
    try {
      const [book] = await createBook(title.trim(), author.trim())
      const paragraphs = text.split('\n\n').filter((p) => p.trim())
      const rows = paragraphs.map((content, i) => ({
        book_id: book.id,
        paragraph_index: i,
        content: content.trim(),
        page_number: Math.floor(i / 10) + 1,
      }))

      // batch insert in chunks of 50
      for (let i = 0; i < rows.length; i += 50) {
        await uploadParagraphs(rows.slice(i, i + 50))
      }

      await updateBookTotal(book.id, paragraphs.length)
      navigate('/records/reading')
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontSize: 14,
    boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/records/reading')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', padding: 0 }}
        >{'\u2190'}</button>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Upload Book</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={inputStyle}
        />

        <div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            {'\u{1F4C4}'} Choose .txt file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        <textarea
          placeholder="Paste book text here... (paragraphs separated by blank lines)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />

        <button
          onClick={submit}
          disabled={submitting || !title.trim() || !text.trim()}
          style={{
            padding: '12px 0',
            background: submitting ? 'var(--border)' : 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
