import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Flame,
  Lock,
  ShieldCheck,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react'
import {
  Card,
  IconBadge,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  StatCard,
  StatusPill,
} from '../components'
import { loadSessionRecords, loadUserStats } from '../utils/storage'
import {
  MODE_LABELS,
  formatRate,
  formatShortDateTime,
  successRate,
  withSign,
} from '../utils/sessionCalc'
import type { SessionRecord } from '../types'

export default function HomePage() {
  const navigate = useNavigate()
  const user = loadUserStats()
  const records = loadSessionRecords().slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ヒーロー */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-brand-50 p-5 shadow-card md:p-8">
        {/* 右上の装飾シールド（スマホでは邪魔になるので非表示） */}
        <ShieldCheck
          className="pointer-events-none absolute -right-6 -top-6 hidden h-52 w-52 text-brand-100 md:block"
          strokeWidth={1.2}
        />

        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 md:text-sm">
              <Flame className="h-4 w-4" />
              連続記録 {user.streakDays}日
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 md:text-sm">
              <Lock className="h-4 w-4" />
              スマホ封印型 自習サービス
            </span>
          </div>

          <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-navy md:text-4xl">
            スマホを触らない時間を、
            <br />
            <span className="text-brand-600">集中実績</span>に変える
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:mt-3 md:text-base">
            DopaLock は、大学生の集中をサポートするスマホロック学習サービスです。
            集中を「レート」と「DP」で記録し、成長を可視化します。
          </p>
        </div>
      </section>

      {/* 実績サマリー */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="現在レート"
          value={formatRate(user.currentRate)}
          unit="DP/30分"
          caption="前日比 +0.3"
          trend="up"
          tone="blue"
        />
        <StatCard
          icon={Coins}
          label="現在DP"
          value={user.currentDP.toLocaleString()}
          unit="DP"
          caption="前日比 +120"
          trend="up"
          tone="green"
        />
        <StatCard
          icon={Clock}
          label="今日の集中時間"
          value="2時間45分"
          caption="目標 3時間の92%"
          tone="navy"
        />
        <StatCard
          icon={Trophy}
          label="成功回数"
          value={`${user.successCount}回`}
          caption={`成功率 ${successRate(user)}%`}
          trend="up"
          tone="amber"
        />
      </div>

      {/* メインCTA */}
      <Card className="flex flex-col items-center gap-4 bg-gradient-to-br from-white to-brand-50/60 py-6 md:gap-5 md:py-8">
        <p className="text-center text-sm font-medium text-slate-500">
          スマホをロックして、今日の集中を始めましょう。
        </p>
        <PrimaryButton
          size="lg"
          icon={Lock}
          iconRight={ChevronRight}
          className="w-full md:w-auto md:min-w-[300px]"
          onClick={() => navigate('/session/new')}
        >
          セッション開始
        </PrimaryButton>
        <div className="grid w-full grid-cols-1 gap-3 md:flex md:w-auto md:flex-wrap md:justify-center">
          <SecondaryButton icon={BarChart3} onClick={() => navigate('/dashboard')}>
            ダッシュボードを見る
          </SecondaryButton>
          <SecondaryButton icon={BookOpen} onClick={() => navigate('/rules')}>
            ルール説明を見る
          </SecondaryButton>
          <SecondaryButton icon={Trophy} onClick={() => navigate('/ranking')}>
            ランキングを見る
          </SecondaryButton>
        </div>
      </Card>

      {/* 下段：履歴 ＋ ランキング */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 最近のセッション履歴 */}
        <Card className="lg:col-span-2">
          <SectionTitle
            title="最近のセッション履歴"
            icon={Clock}
            action={
              <button
                onClick={() => navigate('/history')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                すべて見る
                <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
          <ul className="mt-4 divide-y divide-slate-100">
            {records.map((r) => (
              <HistoryRow key={r.id} record={r} />
            ))}
          </ul>
        </Card>

        {/* 今週の学内ランキング */}
        <Card className="flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-white to-brand-50/50 text-center">
          <div className="flex items-center gap-2 self-start">
            <IconBadge icon={Trophy} tone="amber" size="sm" shape="circle" />
            <span className="text-sm font-bold text-navy">今週の学内ランキング</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center py-2">
            <Trophy className="h-8 w-8 text-amber-400" />
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-navy">12</span>
              <span className="text-xl font-bold text-navy">位</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">/ 342人中</p>
          </div>
          <SecondaryButton fullWidth icon={BarChart3} onClick={() => navigate('/ranking')}>
            ランキング詳細を見る
          </SecondaryButton>
        </Card>
      </div>
    </div>
  )
}

/** 履歴の1行 */
function HistoryRow({ record }: { record: SessionRecord }) {
  const isSuccess = record.result === 'success'
  return (
    <li className="flex items-center gap-3 py-3">
      <IconBadge
        icon={isSuccess ? Check : X}
        tone={isSuccess ? 'green' : 'red'}
        size="sm"
        shape="circle"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy">
          {formatShortDateTime(record.date)}
        </p>
        <p className="text-xs text-slate-400">
          {record.durationMinutes}分・{MODE_LABELS[record.mode]}
        </p>
      </div>
      <StatusPill
        tone={isSuccess ? 'success' : 'danger'}
        className="hidden sm:inline-flex"
      >
        {isSuccess ? '成功' : '脱獄'}
      </StatusPill>
      <div className="w-20 shrink-0 text-right">
        {isSuccess ? (
          <span className="text-sm font-bold text-teal-600">+{record.dpChange} DP</span>
        ) : (
          <span className="text-sm font-bold text-red-500">
            {withSign(record.rateChange)}
            <span className="ml-0.5 text-[10px] font-medium text-red-400">DP/30分</span>
          </span>
        )}
      </div>
    </li>
  )
}
