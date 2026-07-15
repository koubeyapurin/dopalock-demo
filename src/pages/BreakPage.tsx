import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Coffee,
  Coins,
  Info,
  Lock,
  Ticket,
  TrendingUp,
  Trophy,
  Unlock,
  type LucideIcon,
} from 'lucide-react'
import {
  Card,
  ConfirmDialog,
  DangerButton,
  IconBadge,
  PrimaryButton,
  SecondaryButton,
} from '../components'
import CircularTimer from '../components/CircularTimer'
import { MODE_LABELS, USAGE_LABELS, formatMS, formatRate } from '../utils/sessionCalc'
import { loadSessionConfig } from '../utils/storage'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  BREAK_TOTAL_SECONDS,
  TICK_MS,
  consumeTicket,
  displaySecondsPerTick,
  loadSessionRuntime,
} from '../utils/sessionRuntime'
import type { SessionConfig } from '../types'

/** 設定が無ければ作成画面へ（フック呼び出しの前に return しないよう、外側で振り分ける） */
export default function BreakPage() {
  const config = loadSessionConfig()
  if (!config) return <Navigate to="/session/new" replace />
  return <Break config={config} />
}

function Break({ config }: { config: SessionConfig }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const runtime = loadSessionRuntime()
  const [ticketsRemaining, setTicketsRemaining] = useState(() => runtime?.ticketsRemaining ?? 0)
  const [confirmJailbreak, setConfirmJailbreak] = useState(false)

  // 休憩カウントダウン（デモ加速：5分 → 実時間およそ15秒）
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  elapsedRef.current = elapsed

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((prev) => Math.min(BREAK_TOTAL_SECONDS, prev + displaySecondsPerTick()))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  // 時間切れ → 自動的に集中へ戻る
  useEffect(() => {
    if (elapsed >= BREAK_TOTAL_SECONDS) {
      navigate('/session/focus')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed])

  const remaining = Math.max(0, Math.ceil(BREAK_TOTAL_SECONDS - elapsed))
  const progress = remaining / BREAK_TOTAL_SECONDS

  const handleAddTicket = () => {
    if (ticketsRemaining <= 0) return
    const next = consumeTicket()
    setTicketsRemaining(next?.ticketsRemaining ?? 0)
    setElapsed(0) // 休憩をリセット
  }

  const handleJailbreak = () => navigate('/session/jailbreak')

  return (
    <div className="mx-auto max-w-6xl">
      {/* 上部ミニカード */}
      <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-5">
        <MiniCard icon={Lock} label="利用形態" value={USAGE_LABELS[config.usageType]} />
        <MiniCard icon={Trophy} label="モード" value={MODE_LABELS[config.mode]} />
        <MiniCard
          icon={TrendingUp}
          label="予定獲得レート"
          value={`+${formatRate(config.plannedRate)}`}
          tone="blue"
          accent
        />
        <MiniCard
          icon={Coins}
          label="予定獲得DP"
          value={`+${config.plannedDP} DP`}
          tone="green"
          accent
        />
        <MiniCard icon={Ticket} label="5分チケット残数" value={`${ticketsRemaining}枚`} />
      </div>

      {/* 休憩タイマー */}
      <Card className="mt-3 flex flex-col items-center justify-center gap-3 py-8 md:mt-4 md:gap-4 md:py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-700 md:text-sm">
          <Coffee className="h-4 w-4" />
          5分チケット使用中
        </span>
        <h1 className="text-xl font-bold text-teal-600 md:text-2xl">休憩中</h1>

        <CircularTimer
          progress={progress}
          size={isMobile ? 220 : 260}
          stroke={isMobile ? 13 : 16}
          color="teal"
        >
          <div className="flex flex-col items-center">
            <span className="mb-1 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-semibold text-teal-600">
              休憩タイマー
            </span>
            <span className="text-4xl font-bold tabular-nums text-teal-600 md:text-5xl">
              {formatMS(remaining)}
            </span>
            <span className="mt-1 text-sm text-slate-400">/ 05:00</span>
          </div>
        </CircularTimer>

        <p className="text-sm text-slate-500">5分だけスマホ確認が可能です</p>

        <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-center text-xs font-medium text-teal-700 md:px-4 md:text-sm">
          <Info className="h-4 w-4 shrink-0" />
          休憩終了後、自動的に集中に戻ります
        </div>
      </Card>

      {/* アクション（スマホでは 集中に戻る → チケット追加 → 脱獄 の順） */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
        <PrimaryButton
          icon={Lock}
          size="lg"
          fullWidth
          className="order-1 min-h-[52px] md:order-2"
          onClick={() => navigate('/session/focus')}
        >
          集中に戻る
        </PrimaryButton>
        <SecondaryButton
          icon={Ticket}
          size="lg"
          fullWidth
          disabled={ticketsRemaining <= 0}
          className="order-2 min-h-[52px] md:order-1"
          onClick={handleAddTicket}
        >
          5分チケットを追加で使う（残{ticketsRemaining}枚）
        </SecondaryButton>
        <DangerButton
          icon={Unlock}
          size="lg"
          fullWidth
          className="order-3 min-h-[52px]"
          onClick={() => setConfirmJailbreak(true)}
        >
          脱獄する
        </DangerButton>
      </div>

      <ConfirmDialog
        open={confirmJailbreak}
        title="本当に脱獄しますか？"
        icon={Unlock}
        tone="red"
        danger
        message={[
          `予定レートの80%（-${formatRate(config.plannedRate * 0.8)} DP/30分）を失います。`,
          'DPは獲得できず、連続成功日数もリセットされます。',
        ]}
        confirmLabel="脱獄する"
        cancelLabel="休憩を続ける"
        onConfirm={handleJailbreak}
        onCancel={() => setConfirmJailbreak(false)}
      />
    </div>
  )
}

/** 上部のミニ情報カード */
function MiniCard({
  icon,
  label,
  value,
  tone = 'blue',
  accent,
}: {
  icon: LucideIcon
  label: string
  value: string
  tone?: 'blue' | 'green'
  accent?: boolean
}) {
  return (
    <Card compact className="flex items-center gap-3">
      <IconBadge icon={icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p
          className={`truncate text-sm font-bold ${
            accent ? (tone === 'green' ? 'text-teal-600' : 'text-brand-600') : 'text-navy'
          }`}
        >
          {value}
        </p>
      </div>
    </Card>
  )
}
