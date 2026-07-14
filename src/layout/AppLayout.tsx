import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f4f7fc]">
      <Sidebar />
      {/* スマホでは下部固定ナビの高さ分だけ余白を確保する */}
      <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
