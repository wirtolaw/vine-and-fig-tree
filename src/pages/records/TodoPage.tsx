import { useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { fetchTodos, toggleTodo } from '../../utils/supabase'
import type { TodoRow } from '../../utils/supabase'

const CATEGORY_ORDER = ['app', 'content', 'life', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  app: 'App',
  content: 'Content',
  life: 'Life',
  other: 'Other',
}

export default function TodoPage() {
  const fetcher = useCallback(() => fetchTodos(), [])
  const [todos, loading, refresh] = useSupabase<TodoRow[]>('vft_todos_cache', fetcher, [])

  const toggle = async (t: TodoRow) => {
    try {
      await toggleTodo(t.id, !t.done)
      await refresh()
    } catch { /* offline */ }
  }

  // Group by category
  const grouped: Record<string, TodoRow[]> = {}
  for (const t of todos) {
    const cat = t.category || 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(t)
  }

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length)

  return (
    <div>
      {loading && todos.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent-dim)',
            marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {CATEGORY_LABELS[cat] || cat}
          </div>
          {grouped[cat].map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t)}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', marginBottom: 4,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontSize: 16, lineHeight: 1, marginTop: 1, flexShrink: 0,
                color: t.done ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {t.done ? '\u2611' : '\u2610'}
              </span>
              <span style={{
                fontSize: 14,
                color: t.done ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: t.done ? 'line-through' : 'none',
                lineHeight: 1.5,
              }}>
                {t.text}
              </span>
            </button>
          ))}
        </div>
      ))}

      {!loading && todos.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No todos yet.
        </div>
      )}
    </div>
  )
}
