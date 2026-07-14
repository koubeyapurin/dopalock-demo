import { Link, useLocation } from 'react-router-dom'
import { BarChart3, BookOpen, History, Home, PlusCircle, type LucideIcon } from 'lucide-react'
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
  { to: '/history', label: '履歴', icon: History },
  { to: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { to: '/rules', label: 'ルール', icon: BookOpen },
]

const isActiveItem = (pathname: string, item: NavItem): boolean => {
  if (item.exact) return pathname === item.to
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
  return pathname.startsWith(item.to)
}

/** スマホ幅で表示する下部固定ナビ（PC ではサイドバーを使うため非表示） */
export default function BottomNav() {
  const { pathname } = useLocation()

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
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition',
                  active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                <span className="max-w-full truncate px-0.5">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
