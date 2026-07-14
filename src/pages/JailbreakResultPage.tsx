import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CalendarClock,
  Clock,
  Coins,
  Flag,
  Home,
  Lightbulb,
  Lock,
  MapPin,
  RotateCcw,
  Share2,
  Ticket,
  TrendingDown,
  TrendingUp,
  Unlock,
  User,
  type LucideIcon,
} from 'lucide-react'
import {
  Card,
  HistoryList,
  IconBadge,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from '../components'
import { useSessionResult } from '../hooks/useSessionResult'
import { loadSessionRecords } from '../utils/storage'
import {
  MODE_LABELS,
  USAGE_LABELS,
  formatDateTime,
  formatMS,
  formatRate,
} from '../utils/sessionCalc'

export default function JailbreakResultPage() {
  const navigate = useNavigate()
  const summary = useSessionResult('jailbreak')
  const records = loadSessionRecords()

  if (!summary) return null

  const remainingSeconds = Math.max(0, (summary.durationMinutes - summary.actualMinutes) * 60)
  const focusRate = Math.round((summary.actualMinutes / summary.durationMinutes) * 100)

  return (
    <div className="mx-auto max-w-5xl">
      {/* ヘッダー */}
      <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-start md:justify-between md:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
            セッション結果
          </h1>
          <p className="mt-1 text-sm text-slate-500 md:text-base">
            集中の途中でスマホを確認してしまいました…
          </p>
        </div>
        <SecondaryButton icon={Share2} className="w-full md:w-auto">
          結果をシェア
        </SecondaryButton>
      </div>

      {/* ヒーロー */}
      <Card className="bg-gradient-to-b from-red-50/60 to-white text-center">
        <div className="flex flex-col items-center py-3 md:py-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-red-300 to-red-500 shadow-lg shadow-red-500/30 md:h-20 md:w-20">
            <Unlock className="h-8 w-8 text-white md:h-10 md:w-10" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-red-500 md:mt-4 md:text-3xl">脱獄</h2>
          <span className="mt-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 md:px-4 md:text-sm">
            途中でスマホを確認してしまったため、脱獄として記録されました
          </span>
        </div>

        {/* 4指標 */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 md:grid-cols-4 md:pt-6">
          <SummaryStat
            icon={TrendingUp}
            tone="gray"
            label="予定レート"
            value={`+${formatRate(summary.plannedRate)}`}
            unit="DP/30分"
            valueClass="text-slate-500"
          />
          <SummaryStat
            icon={TrendingDown}
            tone="red"
            label="失ったレート"
            value={`-${formatRate(summary.lostRate)}`}
            unit="（予定の80%）"
            valueClass="text-red-500"
          />
          <SummaryStat
            icon={Coins}
            tone="gray"
            label="獲得DP"
            value="0"
            unit="DP"
            valueClass="text-slate-500"
          />
          <SummaryStat
            icon={Clock}
            tone="navy"
            label="セッション時間"
            value={formatMS(summary.actualMinutes * 60)}
            unit="分"
            valueClass="text-navy"
          />
        </div>

        {/* ペナルティ説明 */}
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-center">
          <p className="text-sm font-bold text-red-600">
            ルールにより、予定レートの80%を失いました
          </p>
          <p className="mt-1 text-xs text-red-500">
            集中を継続できると、より多くのレートとDPを獲得できます。
          </p>
        </div>
      </Card>

      {/* セッション詳細 */}
      <Card className="mt-6">
        <SectionTitle title="セッション詳細" icon={Lock} />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailRow icon={MapPin} label="利用形態" value={USAGE_LABELS[summary.usageType]} />
          <DetailRow icon={CalendarClock} label="開始時刻" value={formatDateTime(summary.startedAt)} />
          <DetailRow icon={User} label="モード" value={MODE_LABELS[summary.mode]} />
          <DetailRow
            icon={Flag}
            label="終了時刻（脱獄）"
            value={formatDateTime(summary.finishedAt)}
          />
          <DetailRow
            icon={Ticket}
            label="5分チケット使用"
            value={summary.usedTicket ? '使用あり' : '使用なし'}
          />
          <DetailRow icon={Unlock} label="結果" value="脱獄" valueClass="text-red-500" />
        </div>
      </Card>

      {/* 今回のまとめ ＋ 最近の履歴 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <SectionTitle title="今回のまとめ" icon={Lightbulb} />
          <div className="mt-4 rounded-xl bg-red-50 p-4">
            <p className="text-sm text-red-600">
              あと{' '}
              <span className="text-xl font-bold">{formatMS(remainingSeconds)}</span> 継続できていれば成功でした！
            </p>
            <p className="mt-1 text-xs text-red-500">
              小さな積み重ねが、大きな集中力になります。
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniStat label="集中率" value={`${focusRate}%`} note="あと少し！" />
            <MiniStat label="次の目標" value={`${summary.durationMinutes}分達成`} note="リベンジしよう！" />
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="最近の履歴"
            icon={Clock}
            action={
              <button
                onClick={() => navigate('/history')}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                すべて見る
              </button>
            }
          />
          <div className="mt-2">
            <HistoryList records={records} limit={3} />
          </div>
        </Card>
      </div>

      {/* 応援 */}
      <div className="mt-6 rounded-xl bg-red-50 py-4 text-center">
        <p className="text-sm font-bold text-red-600">大丈夫！誰にでもあることです。</p>
        <p className="mt-1 text-xs text-red-500">
          気持ちを切り替えて、次のセッションでリベンジしましょう！
        </p>
      </div>

      {/* アクション（スマホでは再挑戦を上に） */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:grid-cols-3 md:gap-4">
        <PrimaryButton
          icon={RotateCcw}
          size="lg"
          fullWidth
          className="order-1 md:order-2"
          onClick={() => navigate('/session/new')}
        >
          もう一度挑戦する
        </PrimaryButton>
        <SecondaryButton
          icon={BookOpen}
          size="lg"
          fullWidth
          className="order-2 md:order-3"
          onClick={() => navigate('/rules')}
        >
          ルールを見る
        </SecondaryButton>
        <SecondaryButton
          icon={Home}
          size="lg"
          fullWidth
          className="order-3 md:order-1"
          onClick={() => navigate('/')}
        >
          ホームに戻る
        </SecondaryButton>
      </div>
    </div>
  )
}

/** ヒーローの4指標 */
function SummaryStat({
  icon,
  label,
  value,
  unit,
  tone,
  valueClass,
}: {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  tone: 'blue' | 'green' | 'navy' | 'amber' | 'red' | 'gray'
  valueClass: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <IconBadge icon={icon} tone={tone} size="md" shape="circle" />
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
      {unit && <p className="text-[11px] text-slate-400">{unit}</p>}
    </div>
  )
}

/** 詳細行 */
function DetailRow({
  icon,
  label,
  value,
  valueClass = 'text-navy',
}: {
  icon: LucideIcon
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <IconBadge icon={icon} tone="blue" size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`truncate text-sm font-semibold ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}

/** 小さな指標 */
function MiniStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-navy">{value}</p>
      <p className="text-[11px] text-slate-400">{note}</p>
    </div>
  )
}
