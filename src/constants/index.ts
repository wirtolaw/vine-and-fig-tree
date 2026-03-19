export const START_DATE = '2026-03-11'
export const INITIAL_KISS_COUNT = 215

export const HABIT_CATEGORIES = [
  { key: 'french', label: 'French', icon: '\u{1F1EB}\u{1F1F7}' },
  { key: 'jobhunt', label: 'Job Hunt', icon: '\u{1F4BC}' },
  { key: 'writing', label: 'Writing', icon: '\u{270F}\u{FE0F}' },
  { key: 'sleep', label: 'Sleep', icon: '\u{1F319}' },
  { key: 'exercise', label: 'Exercise', icon: '\u{1F3CB}\u{FE0F}' },
] as const

export type HabitKey = typeof HABIT_CATEGORIES[number]['key']
