import { differenceInDays, format, formatDistanceToNow } from 'date-fns'
import { START_DATE } from '../constants'

export function getDayCount(): number {
  const start = new Date(START_DATE + 'T00:00:00')
  const now = new Date()
  return differenceInDays(now, start) + 1
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
