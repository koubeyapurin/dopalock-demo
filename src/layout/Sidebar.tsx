import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  History,
  Home,
  Lock,
  PlusCircle,
  Settings,
  Ticket,
  Trophy,
  User,
} from 'lucide-react'
import { initialUserStats } from '../data/mockData'

const navItems = [
  { to: '/', label: 'ホーム', icon: Home, end: true },
  { to: '/session/new', label: 'セッション作成', icon: PlusCircle },
  { to: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { to: '/history', label: '履歴', icon: History },
  { to: '/ranking', label: 'ランキング', icon: Trophy },
  { to: '/tickets', label: 'チケット', icon: Ticket },
  { to: '/rules', label: 'ルール説明', icon: BookOpen },
  { to: '/settings', label: '設定', icon: Settings },
]

export default function Sidebar() {
  const user = initialUserStats

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-navy-800 to-navy-900 text-white">
      {/* ロゴ */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
          <Lock className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight">DopaLock</span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/12 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-300/90 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-brand-200' : ''}`}
                  strokeWidth={2.2}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ユーザー / DP 残高 */}
      <div className="m-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="text-xs text-slate-400">{user.grade}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-brand-500/15 px-3 py-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-[10px] font-bold">
            DP
          </span>
          <span className="text-base font-bold">{user.currentDP.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  )
}
