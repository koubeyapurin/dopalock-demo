import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Home,
  Lock,
  PlusCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/cn'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
  matchPrefix?: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'ホーム', icon: Home, exact: true },
  { to: '/session/new', label: '作成', icon: PlusCircle, matchPrefix: '/session' },
  { to: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { to: '/rules', label: 'ルール', icon: BookOpen },
  { to: '/settings', label: '設定', icon: Settings },
]

const isActiveItem = (pathname: string, item: NavItem): boolean => {
  if (item.exact) return pathname === item.to
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
  return pathname.startsWith(item.to)
}

/** スマホ・タブレット幅で表示する下部固定ナビ（PC ではサイドバーを使うため非表示） */
export default function BottomNav({ locked = false }: { locked?: boolean }) {
  const { pathname } = useLocation()

  // セッション中はナビの代わりに「封印中」を表示する
  if (locked) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-brand-50 lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex min-h-[58px] items-center justify-center gap-2 px-4 py-2 text-center">
          <Lock className="h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs font-bold text-brand-700">
            セッション進行中
            <span className="ml-1 font-medium text-brand-500">
              — 完了 or 脱獄するまで移動できません
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const active = isActiveItem(pathname, item)
          const Icon = item.icon
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  // タップしやすい高さを確保する
                  'flex h-full min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold transition',
                  active ? 'text-brand-600' : 'text-slate-400 active:text-brand-600',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                <span className="w-full truncate text-center leading-none">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
