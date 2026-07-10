import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  Lock,
  Swords,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  User,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Card, IconBadge, PageHeader, SectionTitle, StatusPill } from '../components'
import {
  MODE_LABELS,
  USAGE_LABELS,
  formatDateTime,
  formatMinutes,
  formatRate,
  successRate,
  withSign,
} from '../utils/sessionCalc'
import { loadSessionRecords, loadUserStats } from '../utils/storage'
import type { SessionRecord } from '../types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = loadUserStats()
  const records = loadSessionRecords()

  const rate = successRate(user)
  const jbRate = 100 - rate

  // 直近7日間の集中時間（分）
  const weekly = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const minutes = records
        .filter((r) => {
          const rd = new Date(r.date)
          return `${rd.getFullYear()}-${rd.getMonth()}-${rd.getDate()}` === key
        })
        .reduce((sum, r) => sum + r.actualMinutes, 0)
      return { label: `${d.getMonth() + 1}/${d.getDate()}`, wd: WEEKDAYS[d.getDay()], minutes }
    })
  }, [records])

  const donutData = [
    { name: '成功', value: rate },
    { name: '脱獄', value: jbRate },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="ダッシュボード"
        description="あなたの集中実績をチェックしましょう ✨"
        icon={BarChart3}
      />

      {/* 実績スタッツ */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <DashStat icon={TrendingUp} tone="blue" label="現在レート" value={formatRate(user.currentRate)} caption="DP / 30分" />
        <DashStat icon={Coins} tone="green" label="現在DP" value={user.currentDP.toLocaleString()} caption="DP" />
        <DashStat icon={Ticket} tone="blue" label="残り5分チケット" value={`${user.tickets}`} caption="枚" />
        <DashStat icon={Clock} tone="navy" label="累計集中時間" value={formatMinutes(user.totalFocusMinutes)} />
        <DashStat icon={CheckCircle2} tone="green" label="成功回数" value={`${user.successCount}`} caption={`成功率 ${rate}%`} />
        <DashStat icon={XCircle} tone="red" label="脱獄回数" value={`${user.jailbreakCount}`} caption={`脱獄率 ${jbRate}%`} />
      </div>

      {/* グラフ ＋ 成功率 ＋ ランキング */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 棒グラフ */}
        <Card className="lg:col-span-1">
          <SectionTitle title="最近の集中時間（分）" icon={BarChart3} />
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef2f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#eef4ff' }}
                  formatter={(v: number) => [`${v}分`, '集中時間']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="minutes" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 成功率ドーナツ */}
        <Card className="lg:col-span-1">
          <SectionTitle title="成功率" icon={Target} />
          <div className="relative mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius={68}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="#14b8a6" />
                  <Cell fill="#eef2f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-teal-600">{rate}%</span>
              <span className="text-sm text-slate-400">成功！</span>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500">
            成功 {user.successCount}回 ｜ 脱獄 {user.jailbreakCount}回
          </p>
        </Card>

        {/* 仮ランキング */}
        <Card className="lg:col-span-1">
          <SectionTitle
            title="仮ランキング（今週）"
            icon={Trophy}
            action={
              <button
                onClick={() => navigate('/ranking')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                全体ランキングへ
              </button>
            }
          />
          <ul className="mt-4 space-y-1.5">
            <RankRow rank={1} name="ゆうと" rate="2.8" dp="3,120" />
            <RankRow rank={2} name="きょうへい" rate="2.5" dp="2,890" />
            <RankRow rank={3} name="あやか" rate="2.3" dp="2,760" />
            <RankRow rank={4} name="しゅん" rate="2.1" dp="2,510" />
            <RankRow
              rank={5}
              name="あなた"
              rate={formatRate(user.currentRate)}
              dp={user.currentDP.toLocaleString()}
              self
            />
          </ul>
          <p className="mt-2 text-center text-[11px] text-slate-400">※ ランキングは仮のデータです</p>
        </Card>
      </div>

      {/* 履歴テーブル ＋ 実績 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* セッション履歴 */}
        <Card className="lg:col-span-2">
          <SectionTitle title="セッション履歴" icon={Clock} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="pb-2 pr-2 font-medium">日付</th>
                  <th className="pb-2 pr-2 font-medium">利用形態</th>
                  <th className="pb-2 pr-2 font-medium">モード</th>
                  <th className="pb-2 pr-2 font-medium">時間</th>
                  <th className="pb-2 pr-2 font-medium">結果</th>
                  <th className="pb-2 pr-2 text-right font-medium">レート</th>
                  <th className="pb-2 text-right font-medium">DP</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 5).map((r) => (
                  <HistoryTableRow key={r.id} record={r} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={() => navigate('/history')}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              もっと見る ▾
            </button>
          </div>
        </Card>

        {/* 最近の実績 */}
        <Card className="lg:col-span-1">
          <SectionTitle title="最近の実績" icon={Award} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <BadgeCard icon={Award} tone="blue" title="連続成功5回達成" date="2026/07/09" />
            <BadgeCard icon={Target} tone="green" title="累計集中100時間達成" date="2026/07/08" />
            <BadgeCard icon={Swords} tone="navy" title="バトルモード10回達成" date="2026/07/07" />
            <BadgeCard icon={Lock} tone="blue" title="脱獄ゼロ3日達成" date="2026/07/06" />
          </div>
        </Card>
      </div>
    </div>
  )
}

/** 上部の実績スタッツ（6up 用のコンパクト版） */
function DashStat({
  icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string
  caption?: string
  tone: 'blue' | 'green' | 'navy' | 'red'
}) {
  return (
    <Card compact className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <IconBadge icon={icon} tone={tone} size="sm" />
      </div>
      <p className="truncate text-xl font-bold leading-none text-navy">{value}</p>
      {caption && <p className="text-[11px] text-slate-400">{caption}</p>}
    </Card>
  )
}

/** ランキング行 */
function RankRow({
  rank,
  name,
  rate,
  dp,
  self,
}: {
  rank: number
  name: string
  rate: string
  dp: string
  self?: boolean
}) {
  const medal =
    rank === 1
      ? 'bg-amber-400 text-white'
      : rank === 2
        ? 'bg-slate-300 text-white'
        : rank === 3
          ? 'bg-orange-400 text-white'
          : 'bg-slate-100 text-slate-500'
  return (
    <li
      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${
        self ? 'bg-brand-50 ring-1 ring-brand-200' : ''
      }`}
    >
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${medal}`}>
        {rank}
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50">
        <User className="h-4 w-4 text-brand-500" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-bold ${self ? 'text-brand-700' : 'text-navy'}`}>{name}</p>
        <p className="text-[11px] text-slate-400">{rate} DP / 30分</p>
      </div>
      <span className="shrink-0 text-sm font-bold text-navy">DP {dp}</span>
    </li>
  )
}

/** 履歴テーブルの行 */
function HistoryTableRow({ record }: { record: SessionRecord }) {
  const isSuccess = record.result === 'success'
  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="py-2.5 pr-2 text-navy">{formatDateTime(record.date)}</td>
      <td className="py-2.5 pr-2 text-slate-600">{USAGE_LABELS[record.usageType]}</td>
      <td className="py-2.5 pr-2 text-slate-600">{MODE_LABELS[record.mode]}</td>
      <td className="py-2.5 pr-2 text-slate-600">{record.durationMinutes}分</td>
      <td className="py-2.5 pr-2">
        <StatusPill tone={isSuccess ? 'success' : 'danger'}>
          {isSuccess ? '成功' : '脱獄'}
        </StatusPill>
      </td>
      <td
        className={`py-2.5 pr-2 text-right font-bold ${
          record.rateChange >= 0 ? 'text-brand-600' : 'text-red-500'
        }`}
      >
        {withSign(record.rateChange)}
      </td>
      <td className="py-2.5 text-right font-bold text-teal-600">
        {record.dpChange > 0 ? `+${record.dpChange}` : record.dpChange}
      </td>
    </tr>
  )
}

/** 実績バッジ */
function BadgeCard({
  icon,
  title,
  date,
  tone,
}: {
  icon: LucideIcon
  title: string
  date: string
  tone: 'blue' | 'green' | 'navy'
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3 text-center">
      <IconBadge icon={icon} tone={tone} size="md" shape="circle" />
      <p className="text-xs font-bold leading-tight text-navy">{title}</p>
      <p className="text-[10px] text-slate-400">{date}</p>
    </div>
  )
}
