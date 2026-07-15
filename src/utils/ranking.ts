// 学内ランキングの単一の計算元。
// ホーム・ダッシュボード・ランキング・結果画面は、必ずここから順位を取ること。
// （以前は画面ごとに別々の固定値を持っていて、同じ時点で 12位 / 5位 / 118位 と食い違っていた）
import type { UserStats } from '../types'

/** 学内の参加者数。表示上の母数はすべてこれに揃える。 */
export const TOTAL_STUDENTS = 342

export interface Ranker {
  /** 学内での順位（1 が最上位） */
  rank: number
  name: string
  /** レート（DP/30分） */
  rate: number
  dp: number
  /** 自分自身か */
  self?: boolean
}

/**
 * モックのライバル。学内342人のうち「上位10人」と「自分の周辺」を代表として持つ。
 * rank 昇順・rate 降順で並んでいること（順位の推定がこの単調性に依存している）。
 *
 * レートは1セッションごとに積み上がる（+2〜5程度）ので、レート幅もそれに合わせて広く取っている。
 * ここを狭くすると、1回のセッションで学内1位まで飛んでしまい、デモとして破綻する。
 */
export const RIVALS: Ranker[] = [
  { rank: 1, name: 'ゆうと', rate: 18.5, dp: 5820 },
  { rank: 2, name: 'きょうへい', rate: 17.2, dp: 5410 },
  { rank: 3, name: 'あやか', rate: 16.4, dp: 5180 },
  { rank: 4, name: 'しゅん', rate: 15.5, dp: 4870 },
  { rank: 5, name: 'みなと', rate: 14.8, dp: 4620 },
  { rank: 6, name: 'さくら', rate: 14.1, dp: 4400 },
  { rank: 7, name: 'れん', rate: 13.4, dp: 4180 },
  { rank: 8, name: 'ひなた', rate: 12.8, dp: 3960 },
  { rank: 9, name: 'そうた', rate: 12.2, dp: 3810 },
  { rank: 10, name: 'ゆい', rate: 11.7, dp: 3700 },
  { rank: 16, name: 'かえで', rate: 10.4, dp: 3320 },
  { rank: 22, name: 'りく', rate: 9.2, dp: 3040 },
  { rank: 28, name: 'あおい', rate: 7.8, dp: 2810 },
  { rank: 31, name: 'はると', rate: 7.2, dp: 2680 },
  { rank: 34, name: 'ことね', rate: 6.4, dp: 2520 },
  { rank: 37, name: 'いつき', rate: 5.6, dp: 2360 },
  { rank: 40, name: 'みお', rate: 4.8, dp: 2180 },
  { rank: 44, name: 'たける', rate: 3.9, dp: 1940 },
  { rank: 48, name: 'なな', rate: 3.0, dp: 1720 },
  { rank: 55, name: 'かい', rate: 2.2, dp: 1480 },
  { rank: 70, name: 'ひかり', rate: 1.5, dp: 1160 },
  { rank: 110, name: 'そら', rate: 0.9, dp: 820 },
  { rank: 180, name: 'つむぎ', rate: 0.4, dp: 460 },
  { rank: 260, name: 'ゆず', rate: 0.15, dp: 180 },
]

/**
 * レートから学内順位を推定する。
 *
 * ライバルを「既知の点」として、その間を線形補間する。
 * レートが上がれば順位は必ず上がる（単調）ので、
 * 結果画面で「セッション前 → 後」の順位差を出すのにも使える。
 */
export function estimateRank(rate: number): number {
  const top = RIVALS[0]
  if (rate >= top.rate) return 1

  for (let i = 0; i < RIVALS.length - 1; i++) {
    const upper = RIVALS[i] // 順位が上（レートが高い）
    const lower = RIVALS[i + 1]
    if (rate < upper.rate && rate >= lower.rate) {
      const ratio = (upper.rate - rate) / (upper.rate - lower.rate)
      return Math.round(upper.rank + ratio * (lower.rank - upper.rank))
    }
  }

  // 最下位のライバルより低い場合は、レート0＝最下位として補間する
  const last = RIVALS[RIVALS.length - 1]
  if (last.rate <= 0) return TOTAL_STUDENTS
  const ratio = Math.min(1, (last.rate - rate) / last.rate)
  return Math.min(TOTAL_STUDENTS, Math.round(last.rank + ratio * (TOTAL_STUDENTS - last.rank)))
}

/** 自分を Ranker として組み立てる */
export function getMyRanker(user: UserStats): Ranker {
  return {
    rank: estimateRank(user.currentRate),
    name: 'あなた',
    rate: user.currentRate,
    dp: user.currentDP,
    self: true,
  }
}

/**
 * ライバル一覧に自分を差し込む。
 * 自分より下の順位のライバルは1つずつ繰り下がる（同じ順位が2人並ばないようにするため）。
 */
function mergeWithMe(rivals: Ranker[], me: Ranker): Ranker[] {
  const shifted = rivals.map((r) => (r.rank >= me.rank ? { ...r, rank: r.rank + 1 } : r))
  return [...shifted, me].sort((a, b) => a.rank - b.rank)
}

/** 上位 n 人（自分が上位に入っていれば自分も含む） */
export function getTopRankers(n: number, me: Ranker): Ranker[] {
  return mergeWithMe(RIVALS.slice(0, n), me).slice(0, n)
}

/**
 * 自分の前後にいるライバルへ自分を差し込んだ一覧を返す。
 * 自分が上位 topCount 位以内にいるときは、上位一覧と重複するので空配列を返す。
 */
export function getNeighborRankers(me: Ranker, topCount: number, span = 2): Ranker[] {
  if (me.rank <= topCount) return []
  const near = RIVALS.filter((r) => r.rank > topCount && Math.abs(r.rank - me.rank) <= 12)
    .sort((a, b) => Math.abs(a.rank - me.rank) - Math.abs(b.rank - me.rank))
    .slice(0, span * 2)
  return mergeWithMe(near, me)
}

/** セッション前後のレートから、上がった順位数を返す（下がったときは負の数） */
export function rankChange(rateBefore: number, rateAfter: number): number {
  return estimateRank(rateBefore) - estimateRank(rateAfter)
}
