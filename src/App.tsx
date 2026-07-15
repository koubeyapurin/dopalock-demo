import { Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import HomePage from './pages/HomePage'
import SessionCreatePage from './pages/SessionCreatePage'
import FocusSessionPage from './pages/FocusSessionPage'
import BreakPage from './pages/BreakPage'
import SuccessResultPage from './pages/SuccessResultPage'
import JailbreakResultPage from './pages/JailbreakResultPage'
import DashboardPage from './pages/DashboardPage'
import InsightsPage from './pages/InsightsPage'
import HistoryPage from './pages/HistoryPage'
import RankingPage from './pages/RankingPage'
import TicketsPage from './pages/TicketsPage'
import RulesPage from './pages/RulesPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/session/new" element={<SessionCreatePage />} />
        <Route path="/session/focus" element={<FocusSessionPage />} />
        <Route path="/session/break" element={<BreakPage />} />
        <Route path="/session/success" element={<SuccessResultPage />} />
        <Route path="/session/jailbreak" element={<JailbreakResultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}
