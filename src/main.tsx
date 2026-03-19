import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { seedIfNeeded } from './utils/seed'

seedIfNeeded()
import App from './App'
import HomePage from './pages/HomePage'
import RecordsPage from './pages/RecordsPage'
import MomentsPage from './pages/records/MomentsPage'
import StonesPage from './pages/records/StonesPage'
import MilestonesPage from './pages/records/MilestonesPage'
import PlaceholderPage from './pages/records/PlaceholderPage'
import HabitsPage from './pages/HabitsPage'
import CalendarPage from './pages/CalendarPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="records" element={<RecordsPage />}>
            <Route index element={<MomentsPage />} />
            <Route path="moments" element={<MomentsPage />} />
            <Route path="stones" element={<StonesPage />} />
            <Route path="milestones" element={<MilestonesPage />} />
            <Route path="mailbox" element={<PlaceholderPage name="Mailbox" />} />
            <Route path="private" element={<PlaceholderPage name="Private" />} />
            <Route path="todo" element={<PlaceholderPage name="Todo" />} />
          </Route>
          <Route path="habits" element={<HabitsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
