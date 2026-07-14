import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Info, Plus, Ticket } from 'lucide-react'
import { Card, IconBadge, PageHeader, PrimaryButton, SecondaryButton, SectionTitle } from '../components'
import { formatShortDateTime } from '../utils/sessionCalc'
import { loadSessionRecords, loadUserStats, saveUserStats } from '../utils/storage'

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState(() => loadUserStats().tickets)

  // 過去に「使用あり」だったセッションを使用履歴風に表示
  const usedHistory = loadSessionRecords().filter((r) => r.usedTicket).slice(0, 5)

  const addTicket = () => {
    const stats = loadUserStats()
    const next = { ...stats, tickets: stats.tickets + 1 }
    saveUserStats(next)
    setTickets(next.tickets)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="5分チケット"
        description="集中セッション中に5分だけスマホを確認できるサポートアイテムです。"
        icon={Ticket}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 残数 */}
        <Card className="flex flex-col items-center justify-center gap-3 text-center lg:col-span-1">
          <IconBadge icon={Ticket} tone="blue" size="lg" shape="circle" />
          <p className="text-sm text-slate-500">現在の残数</p>
          <p className="text-5xl font-bold text-navy">
            {tickets}
            <span className="ml-1 text-lg font-medium text-slate-400">枚</span>
          </p>
          {tickets === 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600">
              チケットがありません
            </p>
          )}
          <PrimaryButton icon={Plus} size="lg" fullWidth onClick={addTicket} className="mt-1">
            チケットを追加（デモ用）
          </PrimaryButton>
        </Card>

        {/* 説明 */}
        <Card className="lg:col-span-2">
          <SectionTitle title="5分チケットとは？" icon={Info} />
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            集中セッションの途中で、5分間だけスマホを確認できるチケットです。
            使うと「休憩中」になり、5分後に自動的に集中へ戻ります。
            脱獄せずに集中を続けたいときのサポートとして利用できます。
          </p>
          <ul className="mt-4 space-y-2">
            <RuleLi>セッション中にのみ使用できます</RuleLi>
            <RuleLi>1枚につき5分間の休憩が取れます</RuleLi>
            <RuleLi>休憩中でも追加でもう1枚使えます</RuleLi>
            <RuleLi>残り0枚のときは使用できません</RuleLi>
          </ul>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:flex sm:gap-3">
            <PrimaryButton icon={Coffee} onClick={() => navigate('/session/new')}>
              セッションで使ってみる
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate('/rules')}>ルールを見る</SecondaryButton>
          </div>
        </Card>
      </div>

      {/* 使用履歴 */}
      <Card className="mt-4">
        <SectionTitle title="チケット使用履歴" icon={Coffee} />
        {usedHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            まだチケットの使用履歴はありません。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {usedHistory.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <IconBadge icon={Coffee} tone="green" size="sm" shape="circle" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">
                    {formatShortDateTime(r.date)}
                  </p>
                  <p className="text-xs text-slate-400">{r.durationMinutes}分セッション中に使用</p>
                </div>
                <span className="text-sm font-bold text-teal-600">-1枚</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function RuleLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-600">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
      {children}
    </li>
  )
}
