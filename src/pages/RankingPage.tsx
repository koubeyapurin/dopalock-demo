import { Coins, Crown, TrendingUp, Trophy, User } from 'lucide-react'
import { Card, IconBadge, PageHeader, SectionTitle } from '../components'
import { formatRate } from '../utils/sessionCalc'
import { loadUserStats } from '../utils/storage'

interface Ranker {
  name: string
  rate: number
  dp: number
  self?: boolean
}

export default function RankingPage() {
  const user = loadUserStats()

  // 仮の他ユーザー ＋ 自分を合成して順位付け
  const others: Ranker[] = [
    { name: 'ゆうと', rate: 2.8, dp: 3120 },
    { name: 'きょうへい', rate: 2.5, dp: 2890 },
    { name: 'あやか', rate: 2.3, dp: 2760 },
    { name: 'しゅん', rate: 2.1, dp: 2510 },
    { name: 'みなと', rate: 1.9, dp: 2280 },
    { name: 'さくら', rate: 1.7, dp: 2040 },
    { name: 'れん', rate: 1.4, dp: 1760 },
  ]
  const ranked = [...others, { name: 'あなた', rate: user.currentRate, dp: user.currentDP, self: true }]
    .sort((a, b) => b.rate - a.rate || b.dp - a.dp)

  const myRank = ranked.findIndex((r) => r.self) + 1
  const podium = ranked.slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="ランキング"
        description="今週の学内ランキング（仮データ）で競い合おう。"
        icon={Trophy}
      />

      {/* 自分の順位 */}
      <Card className="mb-4 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
        <div className="flex items-center gap-3">
          <IconBadge icon={Crown} tone="amber" size="md" shape="circle" />
          <div>
            <p className="text-sm text-slate-500">あなたの現在の順位</p>
            <p className="text-2xl font-bold text-navy">
              {myRank}位 <span className="text-sm font-medium text-slate-400">/ {ranked.length}人中</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-brand-600">{formatRate(user.currentRate)} DP/30分</p>
          <p className="text-xs text-slate-400">DP {user.currentDP.toLocaleString()}</p>
        </div>
      </Card>

      {/* 表彰台 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {podium.map((r, i) => (
          <PodiumCard key={r.name} rank={i + 1} ranker={r} />
        ))}
      </div>

      {/* ランキング一覧 */}
      <Card>
        <SectionTitle title="全体ランキング" icon={TrendingUp} />
        <ul className="mt-4 space-y-1.5">
          {ranked.map((r, i) => (
            <RankRow key={r.name} rank={i + 1} ranker={r} />
          ))}
        </ul>
        <p className="mt-3 text-center text-[11px] text-slate-400">※ ランキングは仮のデータです</p>
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
      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center ${
        ranker.self ? 'border-brand-300 bg-brand-50' : 'border-slate-100 bg-white'
      } shadow-card`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${medalClass(rank)}`}>
        {rank}
      </span>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50">
        <User className="h-5 w-5 text-brand-500" />
      </span>
      <p className={`text-sm font-bold ${ranker.self ? 'text-brand-700' : 'text-navy'}`}>
        {ranker.name}
      </p>
      <p className="text-xs font-semibold text-brand-600">{formatRate(ranker.rate)} DP/30分</p>
      <p className="text-[11px] text-slate-400">DP {ranker.dp.toLocaleString()}</p>
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
