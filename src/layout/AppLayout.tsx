import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f4f7fc]">
      <Sidebar />
      {/* スマホでは下部固定ナビの高さ分だけ余白を確保する */}
      <main className="min-w-0 max-w-full flex-1 px-4 py-4 pb-28 md:px-6 md:py-6 md:pb-28 lg:px-8 lg:py-8 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
