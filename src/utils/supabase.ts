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
  title: string
  summary: string
  detail: string | null
  weight: number | null
  type: string
  created_at: string
}

export interface MomentRow {
  id: number
  date: string
  text: string
  source: string | null
  author: string | null
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

export interface PrivateRecordRow {
  id: number
  date: string
  title: string
  content: string
  category: string
  created_at: string
}

export interface TodoRow {
  id: number
  text: string
  done: boolean
  category: string
  layer?: string
  show_after?: string
  created_at: string
}

export interface HabitCategory {
  id: number
  name: string
  display_name: string
  icon: string
  sort_order: number
  is_active: boolean
}

export interface HabitTask {
  id: number
  category_id: number
  date: string
  text: string
  done: boolean
  sort_order: number
}

export interface HabitJournal {
  id: number
  category_id: number
  date: string
  content: string
  author: string
}

export interface QuoteRow {
  id: number
  text: string
  author: string
  source: string
  created_at: string
}

export interface HabitLogRow {
  id: number
  date: string
  category: string
  content: string
  author: string | null
  created_at: string
}

// --- Quotes ---

export async function fetchQuotes(): Promise<QuoteRow[]> {
  return supabaseFetch<QuoteRow[]>('/rest/v1/quotes?select=*')
}

// --- Habit Logs ---

export async function fetchHabitLogs(category: string): Promise<HabitLogRow[]> {
  return supabaseFetch<HabitLogRow[]>(
    `/rest/v1/habit_logs?category=eq.${encodeURIComponent(category)}&order=date.desc`,
  )
}

export async function addHabitLog(row: { date: string; category: string; content: string; author?: string }): Promise<HabitLogRow[]> {
  return supabaseFetch<HabitLogRow[]>('/rest/v1/habit_logs', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(row),
  })
}

// --- Moment Replies ---

export interface MomentReply {
  id: number
  moment_id: number
  author: string
  text: string
  created_at: string
}

export async function fetchMomentReplies(momentId: number): Promise<MomentReply[]> {
  return supabaseFetch<MomentReply[]>(
    `/rest/v1/moment_replies?moment_id=eq.${momentId}&order=created_at.asc`,
  )
}

export async function addMomentReply(momentId: number, text: string): Promise<MomentReply[]> {
  return supabaseFetch<MomentReply[]>('/rest/v1/moment_replies', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ moment_id: momentId, author: 'lili', text }),
  })
}

// --- Stones (memories where type = \u7231\u7684\u8BB0\u5F55) ---

export async function fetchStones(): Promise<MemoryRow[]> {
  return supabaseFetch<MemoryRow[]>(
    `/rest/v1/memories?type=eq.${encodeURIComponent('\u7231\u7684\u8BB0\u5F55')}&order=date.desc`,
  )
}

export async function addStone(row: { date: string; title: string; summary: string; weight: number }): Promise<MemoryRow[]> {
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

export async function addMilestone(row: { date: string; title: string; summary?: string }): Promise<MemoryRow[]> {
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
  return supabaseFetch<MomentRow[]>(
    '/rest/v1/moments?source=neq.telegram-auto&scheduled_at=lte.' +
    new Date().toISOString() +
    '&order=created_at.desc'
  )
}

export async function fetchUnreadCount(lastViewedAt: string): Promise<number> {
  const [moments, replies] = await Promise.all([
    supabaseFetch<{ id: number }[]>(
      '/rest/v1/moments?author=eq.noe&scheduled_at=lte.' + new Date().toISOString() +
      '&created_at=gt.' + lastViewedAt + '&select=id'
    ),
    supabaseFetch<{ id: number }[]>(
      '/rest/v1/moment_replies?author=eq.noe&created_at=gt.' + lastViewedAt + '&select=id'
    ),
  ])
  return moments.length + replies.length
}

export async function addMoment(row: { date: string; text: string; source?: string; author?: string }): Promise<MomentRow[]> {
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
  return supabaseFetch<LetterRow[]>('/rest/v1/letters?order=created_at.desc')
}

export async function addLetter(title: string, content: string): Promise<LetterRow[]> {
  return supabaseFetch<LetterRow[]>('/rest/v1/letters', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ title, content, author: 'lili' }),
  })
}

export async function deleteLetter(id: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/letters?id=eq.${id}`, {
    method: 'DELETE',
  })
}

// --- Private Records ---

export async function fetchPrivateRecords(): Promise<PrivateRecordRow[]> {
  return supabaseFetch<PrivateRecordRow[]>('/rest/v1/private_records?order=date.desc')
}

// --- Todos ---

export async function fetchTodos(): Promise<TodoRow[]> {
  // Show: undone + done within 2 days
  return supabaseFetch<TodoRow[]>(
    '/rest/v1/todos?layer=eq.project&or=(done.eq.false,completed_at.gt.' +
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() +
    ')&order=done.asc,category,id.asc'
  )
}

export async function toggleTodo(id: number, done: boolean): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/todos?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ done, completed_at: done ? new Date().toISOString() : null }),
  })
}

// --- Habit Categories ---

export async function fetchHabitCategories(): Promise<HabitCategory[]> {
  return supabaseFetch<HabitCategory[]>(
    '/rest/v1/habit_categories?is_active=eq.true&order=sort_order.asc',
  )
}

// --- Habit Tasks ---

export async function fetchHabitTasks(categoryId: number, date: string): Promise<HabitTask[]> {
  return supabaseFetch<HabitTask[]>(
    `/rest/v1/habit_tasks?category_id=eq.${categoryId}&date=eq.${date}&order=sort_order.asc`,
  )
}

export async function addHabitTask(row: { category_id: number; date: string; text: string }): Promise<HabitTask[]> {
  return supabaseFetch<HabitTask[]>('/rest/v1/habit_tasks', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(row),
  })
}

export async function toggleHabitTask(id: number, done: boolean): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/habit_tasks?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ done }),
  })
}

export async function deleteHabitTask(id: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/habit_tasks?id=eq.${id}`, {
    method: 'DELETE',
  })
}

// --- Habit Journals ---

export async function fetchHabitJournal(categoryId: number, date: string): Promise<HabitJournal | null> {
  const rows = await supabaseFetch<HabitJournal[]>(
    `/rest/v1/habit_journals?category_id=eq.${categoryId}&date=eq.${date}&author=eq.lili&limit=1`,
  )
  return rows.length > 0 ? rows[0] : null
}

export async function saveHabitJournal(categoryId: number, date: string, content: string): Promise<void> {
  const existing = await fetchHabitJournal(categoryId, date)
  if (existing) {
    await supabaseFetch<void>(`/rest/v1/habit_journals?id=eq.${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    })
  } else {
    await supabaseFetch<HabitJournal[]>('/rest/v1/habit_journals', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({ category_id: categoryId, date, content, author: 'lili' }),
    })
  }
}

// --- Habit Completion Stats ---

export async function fetchHabitCompletionStats(startDate: string, endDate: string): Promise<{ date: string; total: number; completed: number }[]> {
  const rows = await supabaseFetch<{ date: string; done: boolean }[]>(
    `/rest/v1/habit_tasks?date=gte.${startDate}&date=lte.${endDate}&select=date,done`,
  )
  const map: Record<string, { total: number; completed: number }> = {}
  for (const r of rows) {
    if (!map[r.date]) map[r.date] = { total: 0, completed: 0 }
    map[r.date].total++
    if (r.done) map[r.date].completed++
  }
  return Object.entries(map).map(([date, v]) => ({ date, ...v }))
}

// --- Habit Tasks bulk (for HabitsPage 14-day grid) ---

export async function fetchHabitTasksRange(startDate: string, endDate: string): Promise<HabitTask[]> {
  return supabaseFetch<HabitTask[]>(
    `/rest/v1/habit_tasks?date=gte.${startDate}&date=lte.${endDate}&select=*`,
  )
}

// --- Backlog Todos ---

export async function fetchBacklogTodo(): Promise<TodoRow[]> {
  return supabaseFetch<TodoRow[]>(
    '/rest/v1/todos?layer=eq.backlog&done=eq.false',
  )
}

// --- Due Reminders ---

export async function fetchDueReminders(today: string): Promise<TodoRow[]> {
  return supabaseFetch<TodoRow[]>(
    `/rest/v1/todos?layer=eq.reminder&done=eq.false&show_after=lte.${today}`,
  )
}

// --- Reading Room (Books) ---

export interface BookRow { id: number; title: string; author: string; total_paragraphs: number; uploaded_by: string; created_at: string }
export interface BookParagraphRow { id: number; book_id: number; paragraph_index: number; content: string; page_number: number }
export interface AnnotationRow { id: number; book_id: number; paragraph_id: number; author: string; content: string; created_at: string }
export interface ReadingProgressRow { id: number; book_id: number; reader: string; current_paragraph: number; last_read_at: string }

export async function fetchBooks(): Promise<BookRow[]> {
  return supabaseFetch<BookRow[]>('/rest/v1/books?order=created_at.desc')
}

export async function createBook(title: string, author: string): Promise<BookRow[]> {
  return supabaseFetch<BookRow[]>('/rest/v1/books', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ title, author, uploaded_by: 'lili', total_paragraphs: 0 }),
  })
}

export async function uploadParagraphs(rows: { book_id: number; paragraph_index: number; content: string; page_number: number }[]): Promise<void> {
  await supabaseFetch<void>('/rest/v1/book_paragraphs', {
    method: 'POST',
    body: JSON.stringify(rows),
  })
}

export async function updateBookTotal(id: number, total: number): Promise<void> {
  await supabaseFetch<void>(`/rest/v1/books?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ total_paragraphs: total }),
  })
}

export async function fetchBookPage(bookId: number, pageNumber: number): Promise<BookParagraphRow[]> {
  return supabaseFetch<BookParagraphRow[]>(
    `/rest/v1/book_paragraphs?book_id=eq.${bookId}&page_number=eq.${pageNumber}&order=paragraph_index.asc`,
  )
}

export async function fetchPageAnnotations(bookId: number, paragraphIds: number[]): Promise<AnnotationRow[]> {
  if (paragraphIds.length === 0) return []
  const ids = paragraphIds.join(',')
  return supabaseFetch<AnnotationRow[]>(
    `/rest/v1/annotations?book_id=eq.${bookId}&paragraph_id=in.(${ids})&order=created_at.asc`,
  )
}

export async function addAnnotation(bookId: number, paragraphId: number, content: string): Promise<AnnotationRow[]> {
  return supabaseFetch<AnnotationRow[]>('/rest/v1/annotations', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ book_id: bookId, paragraph_id: paragraphId, author: 'lili', content }),
  })
}

export async function fetchReadingProgress(bookId: number): Promise<ReadingProgressRow | null> {
  const rows = await supabaseFetch<ReadingProgressRow[]>(
    `/rest/v1/reading_progress?book_id=eq.${bookId}&reader=eq.lili&limit=1`,
  )
  return rows.length > 0 ? rows[0] : null
}

export async function updateReadingProgress(bookId: number, currentParagraph: number): Promise<void> {
  const existing = await fetchReadingProgress(bookId)
  if (existing) {
    await supabaseFetch<void>(`/rest/v1/reading_progress?id=eq.${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ current_paragraph: currentParagraph, last_read_at: new Date().toISOString() }),
    })
  } else {
    await supabaseFetch<ReadingProgressRow[]>('/rest/v1/reading_progress', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({ book_id: bookId, reader: 'lili', current_paragraph: currentParagraph, last_read_at: new Date().toISOString() }),
    })
  }
}

export async function fetchBookMaxPage(bookId: number): Promise<number> {
  const rows = await supabaseFetch<{ page_number: number }[]>(
    `/rest/v1/book_paragraphs?book_id=eq.${bookId}&select=page_number&order=page_number.desc&limit=1`,
  )
  return rows.length > 0 ? rows[0].page_number : 1
}
