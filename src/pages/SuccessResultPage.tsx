import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarClock,
  Clock,
  Coins,
  EyeOff,
  Flag,
  Home,
  Lock,
  MapPin,
  PartyPopper,
  RotateCcw,
  Share2,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  User,
  type LucideIcon,
} from 'lucide-react'
import {
  Card,
  HistoryList,
  IconBadge,
  PrimaryButton,
  ReflectionForm,
  SecondaryButton,
  SectionTitle,
} from '../components'
import { useSessionResult } from '../hooks/useSessionResult'
import { loadSessionRecords } from '../utils/storage'
import { MODE_LABELS, USAGE_LABELS, formatDateTime, formatRate } from '../utils/sessionCalc'
import { estimateRank } from '../utils/ranking'

export default function SuccessResultPage() {
  const navigate = useNavigate()
  const summary = useSessionResult('success')
  const records = loadSessionRecords()

  if (!summary) return null

  // レートが上がったぶん、学内順位が実際にいくつ上がったかを計算する
  const rankBefore = estimateRank(summary.rateBefore)
  const rankAfter = estimateRank(summary.rateAfter)
  const rankUp = rankBefore - rankAfter

  return (
    <div className="mx-auto max-w-5xl">
      {/* ヘッダー */}
      <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-start md:justify-between md:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
            セッション結果
          </h1>
          <p className="mt-1 text-sm text-slate-500 md:text-base">
            おつかれさまでした！素晴らしい集中力です！
          </p>
        </div>
        <SecondaryButton icon={Share2} className="w-full md:w-auto">
          結果をシェア
        </SecondaryButton>
      </div>

      {/* ヒーロー */}
      <Card className="overflow-hidden bg-gradient-to-b from-teal-50/60 to-white text-center">
        <div className="relative flex flex-col items-center py-3 md:py-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-500/30 md:h-20 md:w-20">
            <Trophy className="h-8 w-8 text-white md:h-10 md:w-10" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-teal-600 md:mt-4 md:text-3xl">
            セッション成功！
          </h2>
          <span className="mt-2 rounded-full bg-teal-500 px-4 py-1 text-xs font-semibold text-white md:text-sm">
            素晴らしい集中力でした！
          </span>
        </div>

        {/* 4指標 */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 md:grid-cols-4 md:pt-6">
          <SummaryStat
            icon={TrendingUp}
            tone="blue"
            label="獲得レート"
            value={`+${formatRate(summary.rateChange)}`}
            unit="DP/30分"
            valueClass="text-brand-600"
          />
          <SummaryStat
            icon={Coins}
            tone="green"
            label="獲得DP"
            value={`+${summary.dpChange}`}
            unit="DP"
            valueClass="text-teal-600"
          />
          <SummaryStat
            icon={Clock}
            tone="navy"
            label="セッション時間"
            value={`${summary.actualMinutes}`}
            unit="分"
            valueClass="text-navy"
          />
          <SummaryStat
            icon={Trophy}
            tone="amber"
            label="成功回数"
            value={`${summary.successCountAfter}`}
            unit="回目"
            valueClass="text-navy"
          />
        </div>

        {/* 応援 */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-sm font-semibold text-brand-700">
          <PartyPopper className="h-4 w-4" />
          この調子で継続して、さらに高いレートを目指そう！
        </div>
      </Card>

      {/* セッション詳細 */}
      <Card className="mt-6">
        <SectionTitle title="セッション詳細" icon={Lock} />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailRow icon={MapPin} label="利用形態" value={USAGE_LABELS[summary.usageType]} />
          <DetailRow icon={CalendarClock} label="開始時刻" value={formatDateTime(summary.startedAt)} />
          <DetailRow icon={User} label="モード" value={MODE_LABELS[summary.mode]} />
          <DetailRow icon={Flag} label="終了時刻" value={formatDateTime(summary.finishedAt)} />
          <DetailRow
            icon={Ticket}
            label="5分チケット使用"
            value={summary.usedTicket ? '使用あり' : '使用なし'}
          />
          <DetailRow icon={Lock} label="脱獄" value="なし（成功 ✨）" valueClass="text-teal-600" />
          <DetailRow
            icon={EyeOff}
            label="離脱検知（タブ・画面）"
            value={`${summary.awayCount ?? 0}回`}
            valueClass={summary.awayCount ? 'text-amber-600' : 'text-navy'}
          />
          <DetailRow icon={Target} label="学習目標" value={summary.goal ?? '未設定'} />
        </div>
      </Card>

      {/* 振り返り入力（保存しても レート・DP は変動しない） */}
      <ReflectionForm recordId={summary.recordId} goal={summary.goal} />

      {/* 今回の成果 ＋ 最近の履歴 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="今回の成果" icon={TrendingUp} />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultDelta
              label="レート変動"
              from={formatRate(summary.rateBefore)}
              to={formatRate(summary.rateAfter)}
              delta={`+${formatRate(summary.rateChange)}`}
            />
            <ResultDelta
              label="累計DP"
              from={summary.dpBefore.toLocaleString()}
              to={summary.dpAfter.toLocaleString()}
              delta={`+${summary.dpChange}`}
            />
            <ResultDelta
              label="学内ランキング"
              from={`${rankBefore}位`}
              to={`${rankAfter}位`}
              delta={rankUp > 0 ? `+${rankUp}` : `${rankUp}`}
            />
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

      {/* アクション（スマホでは主要導線を上に） */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:grid-cols-3 md:gap-4">
        <PrimaryButton
          icon={RotateCcw}
          size="lg"
          fullWidth
          className="order-1 md:order-2"
          onClick={() => navigate('/session/new')}
        >
          もう一度セッションを始める
        </PrimaryButton>
        <SecondaryButton
          icon={BarChart3}
          size="lg"
          fullWidth
          className="order-2 md:order-3"
          onClick={() => navigate('/dashboard')}
        >
          ダッシュボードを見る
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
  tone: 'blue' | 'green' | 'navy' | 'amber'
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

/** before → after の変動表示 */
function ResultDelta({
  label,
  from,
  to,
  delta,
}: {
  label: string
  from: string
  to: string
  delta: string
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-navy">
        {from} → {to}
      </p>
      <p className="text-xs font-semibold text-teal-600">（{delta}）</p>
    </div>
  )
}
