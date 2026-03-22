import { useState, useCallback, useMemo } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  format, addMonths, subMonths, isSameDay, isToday,
} from 'date-fns'
import { START_DATE } from '../constants'
import { useSupabase } from '../hooks/useSupabase'
import { fetchHabitCompletionStats } from '../utils/supabase'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const startDate = new Date(START_DATE + 'T00:00:00')

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date())
  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  const startStr = format(monthStart, 'yyyy-MM-dd')
  const endStr = format(monthEnd, 'yyyy-MM-dd')

  const fetchStats = useCallback(
    () => fetchHabitCompletionStats(startStr, endStr),
    [startStr, endStr],
  )
  const [stats] = useSupabase<{ date: string; total: number; completed: number }[]>(
    `vft_habit_stats_${startStr}`, fetchStats, [],
  )

  const completionMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of stats) {
      map[s.date] = s.total > 0 ? s.completed / s.total : 0
    }
    return map
  }, [stats])

  return (
    <div className="page">
      <div className="page-title">Calendar</div>

      {/* Month nav */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <button className="btn" onClick={() => setCurrent(subMonths(current, 1))}
          style={{ fontSize: 18, padding: '4px 12px' }}>
          {'\u2039'}
        </button>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {format(current, 'MMMM yyyy')}
        </div>
        <button className="btn" onClick={() => setCurrent(addMonths(current, 1))}
          style={{ fontSize: 18, padding: '4px 12px' }}>
          {'\u203A'}
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
        marginBottom: 4,
      }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
      }}>
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const today = isToday(day)
          const isDay1 = isSameDay(day, startDate)
          const dayStr = format(day, 'yyyy-MM-dd')
          const pct = completionMap[dayStr] || 0
          const habitBg = pct > 0 ? `rgba(76, 175, 80, ${pct * 0.3})` : 'transparent'
          return (
            <div
              key={day.toISOString()}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                fontSize: 14,
                position: 'relative',
                background: today ? 'var(--accent-glow)' : habitBg,
                border: today ? '1px solid var(--accent)' : '1px solid transparent',
                color: today ? 'var(--accent)' : 'var(--text)',
                fontWeight: today ? 700 : 400,
              }}
            >
              {format(day, 'd')}
              {isDay1 && (
                <div style={{
                  fontSize: 7,
                  color: 'var(--accent)',
                  position: 'absolute',
                  bottom: 2,
                }}>
                  Day 1
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
