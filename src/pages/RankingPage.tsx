import { Coins, Crown, TrendingUp, Trophy, User } from 'lucide-react'
import { Card, IconBadge, PageHeader, SectionTitle } from '../components'
import { formatRate } from '../utils/sessionCalc'
import { loadUserStats } from '../utils/storage'
import {
  TOTAL_STUDENTS,
  getMyRanker,
  getNeighborRankers,
  getTopRankers,
  type Ranker,
} from '../utils/ranking'

const TOP_COUNT = 10

export default function RankingPage() {
  const user = loadUserStats()

  const me = getMyRanker(user)
  const topList = getTopRankers(TOP_COUNT, me)
  const neighbors = getNeighborRankers(me, TOP_COUNT)
  const podium = topList.slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="ランキング"
        description="今週の学内ランキング（仮データ）で競い合おう。"
        icon={Trophy}
      />

      {/* 自分の順位 */}
      <Card className="mb-4 flex flex-col gap-3 bg-gradient-to-r from-brand-50 to-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBadge icon={Crown} tone="amber" size="md" shape="circle" className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-slate-500">あなたの現在の順位</p>
            <p className="text-2xl font-bold text-navy">
              {me.rank}位{' '}
              <span className="text-sm font-medium text-slate-400">/ {TOTAL_STUDENTS}人中</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2 sm:block sm:bg-transparent sm:px-0 sm:py-0 sm:text-right">
          <p className="text-sm font-bold text-brand-600">{formatRate(user.currentRate)} DP/30分</p>
          <p className="text-xs text-slate-400">DP {user.currentDP.toLocaleString()}</p>
        </div>
      </Card>

      {/* 表彰台 */}
      <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
        {podium.map((r) => (
          <PodiumCard key={r.name} rank={r.rank} ranker={r} />
        ))}
      </div>

      {/* 上位 ＋ 自分の周辺 */}
      <Card>
        <SectionTitle title={`学内トップ${TOP_COUNT}`} icon={TrendingUp} />
        <ul className="mt-4 space-y-1.5">
          {topList.map((r) => (
            <RankRow key={r.name} rank={r.rank} ranker={r} />
          ))}
        </ul>

        {neighbors.length > 0 && (
          <>
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-medium text-slate-400">あなたの周辺</span>
              <span className="h-px flex-1 bg-slate-100" />
            </div>
            <ul className="space-y-1.5">
              {neighbors.map((r) => (
                <RankRow key={r.name} rank={r.rank} ranker={r} />
              ))}
            </ul>
          </>
        )}

        <p className="mt-3 text-center text-[11px] text-slate-400">
          ※ 自分以外は仮のデータです（全{TOTAL_STUDENTS}人中）
        </p>
      </Card>
    </div>
  )
}

const medalClass = (rank: number) =>
  rank === 1
    ? 'bg-amber-400 text-white'
    : rank === 2
      ? 'bg-slate-300 text-white'
      : rank === 3
        ? 'bg-orange-400 text-white'
        : 'bg-slate-100 text-slate-500'

function PodiumCard({ rank, ranker }: { rank: number; ranker: Ranker }) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center md:p-4 ${
        ranker.self ? 'border-brand-300 bg-brand-50' : 'border-slate-100 bg-white'
      } shadow-card`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold md:h-8 md:w-8 md:text-sm ${medalClass(rank)}`}
      >
        {rank}
      </span>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 md:h-11 md:w-11">
        <User className="h-4 w-4 text-brand-500 md:h-5 md:w-5" />
      </span>
      <p
        className={`w-full truncate text-xs font-bold md:text-sm ${ranker.self ? 'text-brand-700' : 'text-navy'}`}
      >
        {ranker.name}
      </p>
      <p className="text-[11px] font-semibold text-brand-600 md:text-xs">
        {formatRate(ranker.rate)}
        <span className="hidden md:inline"> DP/30分</span>
      </p>
      <p className="text-[10px] text-slate-400 md:text-[11px]">DP {ranker.dp.toLocaleString()}</p>
    </div>
  )
}

function RankRow({ rank, ranker }: { rank: number; ranker: Ranker }) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        ranker.self ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-slate-50'
      }`}
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${medalClass(rank)}`}>
        {rank}
      </span>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50">
        <User className="h-4 w-4 text-brand-500" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-bold ${ranker.self ? 'text-brand-700' : 'text-navy'}`}>
          {ranker.name}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-slate-400">
          <TrendingUp className="h-3 w-3" />
          {formatRate(ranker.rate)} DP/30分
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-navy">
        <Coins className="h-4 w-4 text-teal-500" />
        {ranker.dp.toLocaleString()}
      </span>
    </li>
  )
}
