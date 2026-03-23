import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import HomePage from './pages/HomePage'
import RecordsPage from './pages/RecordsPage'
import MomentsPage from './pages/records/MomentsPage'
import StonesPage from './pages/records/StonesPage'
import MilestonesPage from './pages/records/MilestonesPage'
import MailboxPage from './pages/records/MailboxPage'
import PrivatePage from './pages/records/PrivatePage'
import TodoPage from './pages/records/TodoPage'
import BookshelfPage from './pages/records/BookshelfPage'
import BookUploadPage from './pages/records/BookUploadPage'
import BookReaderPage from './pages/records/BookReaderPage'
import HabitsPage from './pages/HabitsPage'
import HabitDetailPage from './pages/HabitDetailPage'
import CalendarPage from './pages/CalendarPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="records" element={<RecordsPage />}>
            <Route path="moments" element={<MomentsPage />} />
            <Route path="stones" element={<StonesPage />} />
            <Route path="milestones" element={<MilestonesPage />} />
            <Route path="mailbox" element={<MailboxPage />} />
            <Route path="private" element={<PrivatePage />} />
            <Route path="todo" element={<TodoPage />} />
            <Route path="reading" element={<BookshelfPage />} />
            <Route path="reading/upload" element={<BookUploadPage />} />
            <Route path="reading/:bookId/:page" element={<BookReaderPage />} />
          </Route>
          <Route path="habits" element={<HabitsPage />} />
          <Route path="habits/:categoryId/:date" element={<HabitDetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
