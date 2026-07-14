import { Link, useLocation } from 'react-router-dom'
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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { loadUserStats } from '../utils/storage'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** 完全一致でのみアクティブにする（ホーム用） */
  exact?: boolean
  /** このプレフィックスに一致してもアクティブにする（セッションフロー用） */
  matchPrefix?: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'ホーム', icon: Home, exact: true },
  { to: '/session/new', label: 'セッション作成', icon: PlusCircle, matchPrefix: '/session' },
  { to: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { to: '/history', label: '履歴', icon: History },
  { to: '/ranking', label: 'ランキング', icon: Trophy },
  { to: '/tickets', label: 'チケット', icon: Ticket },
  { to: '/rules', label: 'ルール説明', icon: BookOpen },
  { to: '/settings', label: '設定', icon: Settings },
]

/** 現在パスがそのナビ項目に該当するか */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.to
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
  return pathname.startsWith(item.to)
}

export default function Sidebar({ locked = false }: { locked?: boolean }) {
  const { pathname } = useLocation()
  // 遷移のたびに再描画されるので、実績（DP）は保存済みの最新値を表示できる
  const user = loadUserStats()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-navy-800 to-navy-900 text-white lg:flex">
      {/* ロゴ（セッション中はリンクを無効化） */}
      <Link
        to="/"
        aria-disabled={locked}
        tabIndex={locked ? -1 : undefined}
        className={cn(
          'flex items-center gap-2.5 px-6 py-6',
          locked && 'pointer-events-none',
        )}
      >
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
          <Lock className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight">DopaLock</span>
      </Link>

      {/* セッション中の封印表示 */}
      {locked && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-brand-500/15 px-3 py-2.5 ring-1 ring-brand-400/30">
          <Lock className="h-4 w-4 shrink-0 text-brand-200" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-100">セッション進行中</p>
            <p className="text-[10px] leading-tight text-slate-400">
              完了 or 脱獄するまで移動できません
            </p>
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <nav
        aria-hidden={locked}
        className={cn(
          'flex-1 space-y-1 overflow-y-auto px-3 py-2 transition',
          locked && 'pointer-events-none select-none opacity-40',
        )}
      >
        {navItems.map((item) => {
          const active = !locked && isNavItemActive(pathname, item)
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              tabIndex={locked ? -1 : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-white/[0.12] text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-300/90 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon
                className={cn('h-5 w-5', active ? 'text-brand-200' : '')}
                strokeWidth={2.2}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
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
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-[10px] font-bold">
            DP
          </span>
          <span className="text-base font-bold">{user.currentDP.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  )
}
