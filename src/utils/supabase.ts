const SUPABASE_URL = 'https://jfoxsolxjefnqvwysdhd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmb3hzb2x4amVmbnF2d3lzZGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTY0MDUsImV4cCI6MjA4ODg5MjQwNX0.ZYbRPOmftlaeNZlUHLJMbjkUcDurzekdb4CSmc21syU'

const headers: Record<string, string> = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// --- Generic fetch helper ---

async function supabaseFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${SUPABASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return undefined as unknown as T
}

// --- Types matching Supabase rows ---

export interface MemoryRow {
  id: number
  date: string
  text: string
  weight: number | null
  type: string
  created_at: string
}

export interface MomentRow {
  id: number
  date: string
  text: string
  source: string | null
  likes: number
  created_at: string
}

export interface HabitRow {
  id: number
  date: string
  category: string
  created_at: string
}

export interface AppStateRow {
  key: string
  value: string
}

export interface LetterRow {
  id: number
  date: string
  title: string
  author: string
  content: string
  created_at: string
}

// --- Stones (memories where type = \u7231\u7684\u8BB0\u5F55) ---

export async function fetchStones(): Promise<MemoryRow[]> {
  return supabaseFetch<MemoryRow[]>(
    `/rest/v1/memories?type=eq.${encodeURIComponent('\u7231\u7684\u8BB0\u5F55')}&order=date.desc`,
  )
}

export async function addStone(row: { date: string; text: string; weight: number }): Promise<MemoryRow[]> {
  return supabaseFetch<MemoryRow[]>('/rest/v1/memories', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...row, type: '\u7231\u7684\u8BB0\u5F55' }),
  })
}

export async function deleteStone(id: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/memories?id=eq.${id}`, {
    method: 'DELETE',
  })
}

// --- Milestones (memories where type = \u91CC\u7A0B\u7891) ---

export async function fetchMilestones(): Promise<MemoryRow[]> {
  return supabaseFetch<MemoryRow[]>(
    `/rest/v1/memories?type=eq.${encodeURIComponent('\u91CC\u7A0B\u7891')}&order=date.asc`,
  )
}

export async function addMilestone(row: { date: string; text: string }): Promise<MemoryRow[]> {
  return supabaseFetch<MemoryRow[]>('/rest/v1/memories', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...row, type: '\u91CC\u7A0B\u7891' }),
  })
}

export async function deleteMilestone(id: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/memories?id=eq.${id}`, {
    method: 'DELETE',
  })
}

// --- Moments ---

export async function fetchMoments(): Promise<MomentRow[]> {
  return supabaseFetch<MomentRow[]>('/rest/v1/moments?order=created_at.desc')
}

export async function addMoment(row: { date: string; text: string; source?: string }): Promise<MomentRow[]> {
  return supabaseFetch<MomentRow[]>('/rest/v1/moments', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...row, likes: 0 }),
  })
}

export async function likeMoment(id: number, currentLikes: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/moments?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ likes: currentLikes + 1 }),
  })
}

export async function deleteMoment(id: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/moments?id=eq.${id}`, {
    method: 'DELETE',
  })
}

// --- Habits ---

export async function fetchHabits(): Promise<HabitRow[]> {
  return supabaseFetch<HabitRow[]>('/rest/v1/habits?order=date.desc')
}

export async function checkInHabit(row: { date: string; category: string }): Promise<HabitRow[]> {
  return supabaseFetch<HabitRow[]>('/rest/v1/habits', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(row),
  })
}

export async function uncheckHabit(date: string, category: string): Promise<void> {
  await supabaseFetch<void>(
    `/rest/v1/habits?date=eq.${date}&category=eq.${encodeURIComponent(category)}`,
    { method: 'DELETE' },
  )
}

// --- App State (kisses) ---

export async function fetchKisses(): Promise<number> {
  const rows = await supabaseFetch<AppStateRow[]>('/rest/v1/app_state?key=eq.kisses')
  if (rows.length > 0) {
    return parseInt(rows[0].value, 10) || 0
  }
  return 0
}

export async function updateKisses(value: number): Promise<void> {
  await supabaseFetch<void>('/rest/v1/app_state?key=eq.kisses', {
    method: 'PATCH',
    body: JSON.stringify({ value: String(value) }),
  })
}

// --- Letters ---

export async function fetchLetters(): Promise<LetterRow[]> {
  return supabaseFetch<LetterRow[]>('/rest/v1/letters?order=date.desc')
}
