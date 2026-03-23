import { useState, useCallback, useMemo } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  format, addMonths, subMonths, isSameDay, isToday,
} from 'date-fns'
import { START_DATE } from '../constants'
import { useSupabase } from '../hooks/useSupabase'
import { fetchHabitCompletionStats } from '../utils/supabase'
// @ts-expect-error lunar-javascript has no types
import { Solar } from 'lunar-javascript'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const startDate = new Date(START_DATE + 'T00:00:00')

// 24 solar terms
const SOLAR_TERMS = new Set([
  '\u7acb\u6625', '\u96e8\u6c34', '\u60ca\u86f0', '\u6625\u5206',
  '\u6e05\u660e', '\u8c37\u96e8', '\u7acb\u590f', '\u5c0f\u6ee1',
  '\u8292\u79cd', '\u590f\u81f3', '\u5c0f\u6691', '\u5927\u6691',
  '\u7acb\u79cb', '\u5904\u6691', '\u767d\u9732', '\u79cb\u5206',
  '\u5bd2\u9732', '\u971c\u964d', '\u7acb\u51ac', '\u5c0f\u96ea',
  '\u5927\u96ea', '\u51ac\u81f3', '\u5c0f\u5bd2', '\u5927\u5bd2',
])

function getLunarInfo(year: number, month: number, day: number) {
  try {
    const solar = Solar.fromYmd(year, month, day)
    const lunar = solar.getLunar()
    const lunarDay = lunar.getDayInChinese()
    const lunarMonth = lunar.getMonthInChinese()
    const isFirstDay = lunar.getDay() === 1

    // Check for solar term (jieqi)
    const jieQi = lunar.getJieQi()
    const isJieQi = jieQi && SOLAR_TERMS.has(jieQi)

    // Check for lunar festival
    const festivals = lunar.getFestivals()
    const festival = festivals && festivals.length > 0 ? festivals[0] : null

    // Display logic: first day of month shows month name, otherwise show day
    let display = isFirstDay ? `${lunarMonth}\u6708` : lunarDay
    let highlight = false

    if (isJieQi) {
      display = jieQi
      highlight = true
    } else if (festival) {
      display = festival
      highlight = true
    }

    return { display, highlight }
  } catch {
    return { display: '', highlight: false }
  }
}

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
          const todayFlag = isToday(day)
          const isDay1 = isSameDay(day, startDate)
          const dayStr = format(day, 'yyyy-MM-dd')
          const pct = completionMap[dayStr] || 0
          const habitBg = pct > 0 ? `rgba(76, 175, 80, ${pct * 0.3})` : 'transparent'

          const lunar = getLunarInfo(day.getFullYear(), day.getMonth() + 1, day.getDate())

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
                position: 'relative',
                background: todayFlag ? 'var(--accent-glow)' : habitBg,
                border: todayFlag ? '1px solid var(--accent)' : '1px solid transparent',
                gap: 1,
                padding: '2px 0',
              }}
            >
              <span style={{
                fontSize: 14,
                color: todayFlag ? 'var(--accent)' : 'var(--text)',
                fontWeight: todayFlag ? 700 : 400,
                lineHeight: 1,
              }}>
                {format(day, 'd')}
              </span>
              <span style={{
                fontSize: 7,
                lineHeight: 1,
                color: lunar.highlight
                  ? 'var(--accent)'
                  : '#888',
                fontWeight: lunar.highlight ? 600 : 400,
              }}>
                {lunar.display}
              </span>
              {isDay1 && (
                <div style={{
                  fontSize: 6,
                  color: 'var(--accent)',
                  position: 'absolute',
                  bottom: 1,
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
