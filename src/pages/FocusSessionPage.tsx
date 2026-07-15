import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Coffee,
  Coins,
  EyeOff,
  Flame,
  Info,
  Lock,
  ShieldAlert,
  Target,
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
import {
  MODE_LABELS,
  USAGE_LABELS,
  formatHMS,
  formatMinutes,
  formatRate,
} from '../utils/sessionCalc'
import { loadSessionConfig, loadSessionRecords, loadUserStats } from '../utils/storage'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAwayDetection } from '../hooks/useAwayDetection'
import {
  TICK_MS,
  consumeTicket,
  displaySecondsPerTick,
  initSessionRuntime,
  loadSessionRuntime,
  persistElapsed,
} from '../utils/sessionRuntime'
import type { SessionConfig } from '../types'

/**
 * 設定が無ければ作成画面へ戻す。
 * ここで振り分けてから中身を描画することで、フック呼び出しの前に return しない。
 */
export default function FocusSessionPage() {
  const config = loadSessionConfig()
  if (!config) return <Navigate to="/session/new" replace />
  return <FocusSession config={config} />
}

function FocusSession({ config }: { config: SessionConfig }) {
  const navigate = useNavigate()
  const user = loadUserStats()
  const isMobile = useIsMobile()

  const totalSeconds = config.durationMinutes * 60

  // 実行状態（休憩から戻ったときは経過・チケット残を引き継ぐ）
  const [runtime] = useState(
    () => loadSessionRuntime() ?? initSessionRuntime(totalSeconds, user.tickets),
  )
  const [elapsed, setElapsed] = useState(() => runtime.elapsedSeconds)
  const elapsedRef = useRef(elapsed)
  elapsedRef.current = elapsed

  const [confirmJailbreak, setConfirmJailbreak] = useState(false)

  // タブ離脱・画面非表示の検知
  const { away, clearLast } = useAwayDetection(true)

  const ticketsRemaining = runtime.ticketsRemaining

  // 本日のセッション数（履歴から集計）
  const todaySessions = useSessionCountToday()

  // カウントダウン（デモ加速）
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((prev) => Math.min(totalSeconds, prev + displaySecondsPerTick()))
    }, TICK_MS)
    return () => {
      clearInterval(id)
      persistElapsed(elapsedRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 時間切れ → 自動で成功
  useEffect(() => {
    if (elapsed >= totalSeconds) {
      persistElapsed(totalSeconds)
      navigate('/session/success')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed])

  const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed))
  const progress = totalSeconds === 0 ? 0 : elapsed / totalSeconds
  const remMin = Math.floor(remaining / 60)
  const remSec = remaining % 60

  const handleUseTicket = () => {
    if (ticketsRemaining <= 0) return
    persistElapsed(elapsedRef.current)
    consumeTicket()
    navigate('/session/break')
  }

  const handleJailbreak = () => {
    persistElapsed(elapsedRef.current)
    navigate('/session/jailbreak')
  }

  const handleComplete = () => {
    persistElapsed(totalSeconds)
    navigate('/session/success')
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* 見出し */}
      <div className="mb-4 flex items-center gap-3 md:mb-6">
        <IconBadge icon={Lock} tone="blue" size="md" className="shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
              集中セッション中
            </h1>
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-brand-500" />
          </div>
          <p className="mt-1 text-sm text-slate-500 md:text-base">
            スマホはロック中です。集中を続けましょう。
          </p>
        </div>
      </div>

      {/* 今回の学習目標 */}
      {config.goal && (
        <Card compact className="mb-3 flex items-center gap-3 border-brand-100 bg-brand-50/50">
          <IconBadge icon={Target} tone="blue" size="sm" />
          <div className="min-w-0">
            <p className="text-xs text-slate-400">今回の学習目標</p>
            <p className="truncate text-sm font-bold text-navy">{config.goal}</p>
          </div>
        </Card>
      )}

      {/* 離脱検知の警告（戻ってきた直後に出す） */}
      {away.lastSeconds !== null && (
        <div className="mb-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <IconBadge icon={EyeOff} tone="amber" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-amber-700">
              画面から離れたことを検知しました（{away.lastSeconds}秒）
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              このセッションの離脱検知：{away.count}回。記録に残り、結果画面で確認できます。
            </p>
          </div>
          <button
            type="button"
            onClick={clearLast}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          >
            閉じる
          </button>
        </div>
      )}

      {/* 上部ミニカード */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
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
      </div>

      {/* タイマー ＋ ステータス */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:mt-4 md:gap-4 lg:grid-cols-3">
        {/* タイマー */}
        <Card className="flex flex-col items-center justify-center gap-3 py-8 md:gap-4 md:py-10 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-400">残り時間</p>
          <CircularTimer
            progress={progress}
            size={isMobile ? 220 : 260}
            stroke={isMobile ? 13 : 16}
            color="brand"
          >
            <div className="flex flex-col items-center">
              <Lock className="mb-1.5 h-6 w-6 text-brand-500 md:mb-2 md:h-7 md:w-7" />
              <span className="text-3xl font-bold tabular-nums text-navy md:text-4xl">
                {formatHMS(remaining)}
              </span>
            </div>
          </CircularTimer>
          <p className="text-center text-sm text-slate-500">
            {config.durationMinutes}分セッション中 / 残り{remMin}分{remSec}秒
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 md:text-sm">
            <Lock className="h-4 w-4" />
            スマホはロックされています
          </span>
        </Card>

        {/* 集中ステータス */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-bold text-navy">現在の集中ステータス</h2>
          </div>

          {away.count === 0 ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-teal-50 p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <p className="text-sm font-bold text-teal-700">集中中</p>
                <p className="text-xs text-teal-600">良いペースで集中を続けています！</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3">
              <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-700">離脱を{away.count}回検知</p>
                <p className="text-xs text-amber-600">
                  合計{Math.round(away.seconds)}秒ぶん画面を離れました。
                </p>
              </div>
            </div>
          )}

          <ul className="mt-4 space-y-1">
            <StatusRow icon={Ticket} label="5分チケット残数" value={`${ticketsRemaining}枚`} />
            <StatusRow icon={Flame} label="連続成功日数" value={`${user.streakDays}日`} />
            <StatusRow
              icon={CalendarCheck}
              label="本日のセッション数"
              value={`${todaySessions}回 / 目標2回`}
            />
            <StatusRow
              icon={Activity}
              label="このセッションの経過時間"
              value={formatMinutes(Math.floor(elapsed / 60))}
            />
            <StatusRow icon={EyeOff} label="離脱検知" value={`${away.count}回`} />
          </ul>
        </Card>
      </div>

      {/* アクション（スマホでは 完了 → チケット → 脱獄 の順で、誤タップしにくくする） */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
        <PrimaryButton
          icon={CheckCircle2}
          size="lg"
          fullWidth
          className="order-1 min-h-[52px] md:order-3"
          onClick={handleComplete}
        >
          完了する
        </PrimaryButton>
        <SecondaryButton
          icon={Coffee}
          size="lg"
          fullWidth
          disabled={ticketsRemaining <= 0}
          className="order-2 min-h-[52px] md:order-1"
          onClick={handleUseTicket}
        >
          5分チケットを使う（残{ticketsRemaining}枚）
        </SecondaryButton>
        <DangerButton
          icon={Unlock}
          size="lg"
          fullWidth
          className="order-3 min-h-[52px] md:order-2"
          onClick={() => setConfirmJailbreak(true)}
        >
          脱獄する
        </DangerButton>
      </div>

      <p className="mt-3 flex items-start justify-center gap-1.5 px-2 text-center text-xs text-slate-400">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        脱獄すると、予定レートの80%を失い、連続成功日数がリセットされます。
      </p>

      {/* Web版の制約を正直に伝える（面接での説明用） */}
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          <span className="font-semibold text-slate-600">このWebデモでできること：</span>
          タブの切り替え・画面の非表示を検知して記録します。
          ブラウザ上では他アプリの操作を止められないため、
          実サービスではスマホアプリのスクリーンタイム連携や、店舗のロッカーによる物理的な封印で実現します。
        </p>
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
        cancelLabel="集中を続ける"
        onConfirm={handleJailbreak}
        onCancel={() => setConfirmJailbreak(false)}
      />
    </div>
  )
}

/** 今日記録されたセッション数（履歴から集計） */
function useSessionCountToday(): number {
  const [count] = useState(() => {
    const today = new Date().toDateString()
    return loadSessionRecords().filter((r) => new Date(r.date).toDateString() === today).length
  })
  return count
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

/** ステータスリストの1行 */
function StatusRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </span>
      <span className="text-sm font-bold text-navy">{value}</span>
    </li>
  )
}
