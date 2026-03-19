import { useState, useCallback } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { fetchPrivateRecords } from '../../utils/supabase'
import type { PrivateRecordRow } from '../../utils/supabase'
import { formatDate } from '../../utils/date'

export default function PrivatePage() {
  const fetcher = useCallback(() => fetchPrivateRecords(), [])
  const [records, loading] = useSupabase<PrivateRecordRow[]>('vft_private_cache', fetcher, [])
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div>
      {loading && records.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          Loading...
        </div>
      )}

      {records.map((r) => {
        const isOpen = openId === r.id
        return (
          <div key={r.id} className="card" style={{ marginBottom: 10 }}>
            <button
              onClick={() => setOpenId(isOpen ? null : r.id)}
              style={{ width: '100%', textAlign: 'left', padding: 0, background: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.category} &middot; {formatDate(r.date)}
                  </div>
                </div>
                <span style={{
                  fontSize: 14, color: 'var(--text-muted)', marginLeft: 8,
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>
                  {'\u203A'}
                </span>
              </div>
            </button>

            {isOpen && (
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--border)',
                fontSize: 13, lineHeight: 1.7,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}>
                {r.content}
              </div>
            )}
          </div>
        )
      })}

      {!loading && records.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
          No private records yet.
        </div>
      )}
    </div>
  )
}
