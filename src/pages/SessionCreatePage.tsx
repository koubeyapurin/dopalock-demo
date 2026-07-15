import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  Gift,
  Lock,
  MapPin,
  Smartphone,
  Store,
  Target,
  TrendingUp,
  User,
  Users,
  Swords,
  type LucideIcon,
} from 'lucide-react'
import {
  Card,
  IconBadge,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from '../components'
import { cn } from '../lib/cn'
import { buildSessionConfig, formatRate } from '../utils/sessionCalc'
import { loadUserStats, saveSessionConfig } from '../utils/storage'
import { initSessionRuntime } from '../utils/sessionRuntime'
import type { Duration, SessionMode, UsageType } from '../types'

interface Option<T> {
  value: T
  label: string
  desc: string
  icon: LucideIcon
}

const usageOptions: Option<UsageType>[] = [
  {
    value: 'anywhere',
    label: 'どこでもDopaLock',
    desc: 'スマホと一緒に、どこでも集中できます。',
    icon: Smartphone,
  },
  {
    value: 'partner',
    label: '提携店舗DopaLock',
    desc: 'カフェや自習スペースなど、提携店舗で集中できます。',
    icon: Store,
  },
  {
    value: 'direct',
    label: '直営店舗DopaLock',
    desc: 'DopaLock直営の公式店舗で、特別な集中体験を。',
    icon: Building2,
  },
]

const modeOptions: Option<SessionMode>[] = [
  {
    value: 'personal',
    label: '個人モード',
    desc: '自分のペースで集中したいあなたに。',
    icon: User,
  },
  {
    value: 'coop',
    label: '協力モード',
    desc: '友達と一緒に目標を共有して、励まし合おう！',
    icon: Users,
  },
  {
    value: 'battle',
    label: 'バトルモード',
    desc: '他のユーザーと競い合って、集中力を高めよう！',
    icon: Swords,
  },
]

const durations: Duration[] = [30, 60, 90, 120]
const RECOMMENDED_DURATION: Duration = 60

/** 目標入力のヒント（タップで入力できるようにして、スマホでの入力負荷を下げる） */
const GOAL_EXAMPLES = ['英語の課題を終わらせる', '数学の演習を20問', 'レポートの下書きを書く']

export default function SessionCreatePage() {
  const navigate = useNavigate()

  // 初期選択：提携店舗 / 協力 / 60分
  const [usage, setUsage] = useState<UsageType>('partner')
  const [mode, setMode] = useState<SessionMode>('coop')
  const [duration, setDuration] = useState<Duration>(60)
  const [goal, setGoal] = useState('')

  const config = useMemo(
    () => ({ ...buildSessionConfig(usage, mode, duration), goal: goal.trim() || undefined }),
    [usage, mode, duration, goal],
  )

  const selectedUsage = usageOptions.find((o) => o.value === usage)!
  const selectedMode = modeOptions.find((o) => o.value === mode)!

  const handleStart = () => {
    saveSessionConfig(config)
    // 実行状態を初期化（経過0・チケットは現在の所持数から）
    initSessionRuntime(config.durationMinutes * 60, loadUserStats().tickets)
    navigate('/session/focus')
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="セッションを開始する"
        description="利用形態・モード・時間を選んで、新しい集中セッションを作成します。"
        icon={Lock}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左：選択エリア */}
        <div className="space-y-6 lg:col-span-2">
          {/* 利用形態 */}
          <Card>
            <SectionTitle title="利用形態を選ぶ" icon={MapPin} />
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {usageOptions.map((o) => (
                <SelectableCard
                  key={o.value}
                  icon={o.icon}
                  title={o.label}
                  desc={o.desc}
                  selected={usage === o.value}
                  onClick={() => setUsage(o.value)}
                />
              ))}
            </div>
          </Card>

          {/* モード */}
          <Card>
            <SectionTitle title="モードを選ぶ" icon={Users} />
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {modeOptions.map((o) => (
                <SelectableCard
                  key={o.value}
                  icon={o.icon}
                  title={o.label}
                  desc={o.desc}
                  selected={mode === o.value}
                  onClick={() => setMode(o.value)}
                />
              ))}
            </div>
          </Card>

          {/* 学習目標 */}
          <Card>
            <SectionTitle title="今回の学習目標を決める" icon={Target} />
            <p className="mt-2 text-sm text-slate-500">
              集中の前に目標を宣言すると、終了後に達成できたかを振り返れます（任意）。
            </p>
            <input
              type="text"
              value={goal}
              maxLength={40}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例：英語のレポートを1本仕上げる"
              className="mt-3 min-h-[52px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-navy placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {GOAL_EXAMPLES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  {g}
                </button>
              ))}
            </div>
          </Card>

          {/* 時間 */}
          <Card>
            <SectionTitle title="時間を選ぶ" icon={Clock} />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {durations.map((d) => (
                <TimeButton
                  key={d}
                  minutes={d}
                  selected={duration === d}
                  recommended={d === RECOMMENDED_DURATION}
                  onClick={() => setDuration(d)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* 右：今回のセッション */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-8">
            <SectionTitle title="今回のセッション" icon={ClipboardList} />

            <div className="mt-4 space-y-2">
              <SummaryRow icon={selectedUsage.icon} label="利用形態" value={selectedUsage.label} />
              <SummaryRow icon={selectedMode.icon} label="モード" value={selectedMode.label} />
              <SummaryRow icon={Clock} label="時間" value={`${duration}分`} />
              <SummaryRow
                icon={Target}
                label="学習目標"
                value={config.goal ?? '未設定（あとで振り返れません）'}
              />
            </div>

            <div className="my-4 border-t border-slate-100" />

            {/* 予定獲得値 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <TrendingUp className="h-4 w-4 text-brand-600" />
                  予定獲得レート
                </span>
                <span className="text-lg font-bold text-brand-600">
                  +{formatRate(config.plannedRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <Coins className="h-4 w-4 text-teal-600" />
                  予定獲得DP
                </span>
                <span className="text-lg font-bold text-teal-600">+{config.plannedDP} DP</span>
              </div>
            </div>

            {/* 補足 */}
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
              <Gift className="mt-0.5 h-4 w-4 shrink-0" />
              <span>条件達成で獲得。途中で脱獄すると予定レートの80%を失います。</span>
            </div>

            {/* 注意 */}
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">開始後はスマホ利用を制限します</p>
                <p className="mt-0.5 text-amber-600">
                  緊急時以外の利用はできませんのでご注意ください。
                </p>
              </div>
            </div>

            {/* アクション */}
            <PrimaryButton
              size="lg"
              fullWidth
              icon={Lock}
              iconRight={ChevronRight}
              className="mt-5 min-h-[52px]"
              onClick={handleStart}
            >
              セッション開始
            </PrimaryButton>
            <div className="mt-3 flex items-center justify-between">
              <SecondaryButton onClick={() => navigate('/')}>キャンセル</SecondaryButton>
              <button
                onClick={() => navigate('/rules')}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                ルールを確認 ›
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/** 利用形態・モードの選択カード */
function SelectableCard({
  icon: Icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: LucideIcon
  title: string
  desc: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border p-4 text-left transition',
        selected
          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-200'
          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50',
      )}
    >
      {selected && (
        <span className="absolute -top-2 left-4 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
          選択中
        </span>
      )}
      <div className="flex items-start justify-between">
        <IconBadge icon={Icon} tone={selected ? 'blue' : 'gray'} size="sm" />
        {selected && <CheckCircle2 className="h-5 w-5 text-brand-500" />}
      </div>
      <h3 className="mt-3 text-sm font-bold text-navy">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
    </button>
  )
}

/** 時間選択ボタン */
function TimeButton({
  minutes,
  selected,
  recommended,
  onClick,
}: {
  minutes: number
  selected: boolean
  recommended: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border py-4 text-center transition',
        selected
          ? 'border-brand-500 bg-brand-600 text-white ring-2 ring-brand-200'
          : 'border-slate-200 bg-white text-navy hover:border-brand-200 hover:bg-slate-50',
      )}
    >
      {recommended && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
          おすすめ
        </span>
      )}
      <Clock className={cn('mx-auto h-4 w-4', selected ? 'text-white/80' : 'text-slate-400')} />
      <div className="mt-1 text-lg font-bold">{minutes}分</div>
    </button>
  )
}

/** 右カードの概要行 */
function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <IconBadge icon={icon} tone="blue" size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-navy">{value}</p>
      </div>
    </div>
  )
}
