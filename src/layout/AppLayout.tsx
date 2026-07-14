import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { isSessionActive } from '../utils/sessionRuntime'

/**
 * セッション進行中に滞在できるルート。
 * ここに載っていない画面へ移動しようとしても集中画面へ引き戻す。
 * （/session/new も意図的に含めない ＝ 進行中の二重作成を防ぐ）
 */
const SESSION_ROUTES = [
  '/session/focus',
  '/session/break',
  '/session/success',
  '/session/jailbreak',
]

export default function AppLayout() {
  const { pathname } = useLocation()
  const locked = isSessionActive()

  // ルートガード：進行中はブラウザバック・URL直打ちでも抜け出せない
  if (locked && !SESSION_ROUTES.includes(pathname)) {
    return <Navigate to="/session/focus" replace />
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f4f7fc]">
      <Sidebar locked={locked} />
      {/* スマホでは下部固定ナビの高さ分だけ余白を確保する */}
      <main className="min-w-0 max-w-full flex-1 px-4 py-4 pb-28 md:px-6 md:py-6 md:pb-28 lg:px-8 lg:py-8 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav locked={locked} />
    </div>
  )
}
