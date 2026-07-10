import type {
  Duration,
  SessionConfig,
  SessionMode,
  SessionRecord,
  SessionResult,
  UsageType,
  UserStats,
} from '../types'

// ---- 基本値 ----------------------------------------------------------------
export const BASE_RATE = 2.0
export const BASE_DP = 6
export const STANDARD_MINUTES = 60
/** 脱獄時に予定レートから失う割合（エントリーシートの「80%を失う」設定） */
export const JAILBREAK_PENALTY = 0.8

// ---- 倍率 ------------------------------------------------------------------
export const USAGE_MULTIPLIER: Record<UsageType, number> = {
  anywhere: 1.0,
  partner: 1.2,
  direct: 1.5,
}

export const MODE_MULTIPLIER: Record<SessionMode, number> = {
  personal: 1.0,
  coop: 1.1,
  battle: 1.3,
}

// ---- 表示用ラベル ----------------------------------------------------------
export const USAGE_LABELS: Record<UsageType, string> = {
  anywhere: 'どこでもDopaLock',
  partner: '提携店舗DopaLock',
  direct: '直営店舗DopaLock',
}

export const MODE_LABELS: Record<SessionMode, string> = {
  personal: '個人モード',
  coop: '協力モード',
  battle: 'バトルモード',
}

export const RESULT_LABELS: Record<SessionResult, string> = {
  success: '成功',
  jailbreak: '脱獄',
}

export const DURATIONS: Duration[] = [30, 60, 90, 120]

// ---- 丸め / 整形 -----------------------------------------------------------
/** レートは小数第1位まで */
export const roundRate = (n: number): number => Math.round(n * 10) / 10
/** DP は整数 */
export const roundDP = (n: number): number => Math.round(n)
/** レート表示（例: 2 → "2.0"） */
export const formatRate = (n: number): string => n.toFixed(1)
/** 分を「◯時間◯分」表記へ */
export const formatMinutes = (min: number): string => {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}分`
  if (m === 0) return `${h}時間`
  return `${h}時間${m}分`
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

/** 秒を「HH:MM:SS」表記へ（集中タイマー用） */
export const formatHMS = (totalSec: number): string => {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${pad2(h)}:${pad2(m)}:${pad2(s % 60)}`
}

/** 秒を「MM:SS」表記へ（休憩タイマー用） */
export const formatMS = (totalSec: number): string => {
  const s = Math.max(0, Math.floor(totalSec))
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

const WEEKDAYS_JP = ['日', '月', '火', '水', '木', '金', '土']

/** ISO 文字列を「2026/07/10 19:00」表記へ */
export const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`
}

/** ISO 文字列を「7/8（火）21:00」表記へ */
export const formatShortDateTime = (iso: string): string => {
  const d = new Date(iso)
  const wd = WEEKDAYS_JP[d.getDay()]
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()}（${wd}）${hh}:${mm}`
}

/** +/- 記号付きの数値文字列（0 は "±0"） */
export const withSign = (n: number): string => (n > 0 ? `+${n}` : n < 0 ? `${n}` : `±0`)

// ---- 予定獲得値の計算 -------------------------------------------------------
/** 利用形態・モード・時間から、成功時の予定獲得レート/DP を求める */
export function calcPlanned(
  usageType: UsageType,
  mode: SessionMode,
  durationMinutes: number,
): { plannedRate: number; plannedDP: number } {
  const factor =
    (durationMinutes / STANDARD_MINUTES) * USAGE_MULTIPLIER[usageType] * MODE_MULTIPLIER[mode]
  return {
    plannedRate: roundRate(BASE_RATE * factor),
    plannedDP: roundDP(BASE_DP * factor),
  }
}

/** 選択内容から SessionConfig を組み立てる */
export function buildSessionConfig(
  usageType: UsageType,
  mode: SessionMode,
  durationMinutes: Duration,
): SessionConfig {
  const { plannedRate, plannedDP } = calcPlanned(usageType, mode, durationMinutes)
  return { usageType, mode, durationMinutes, plannedRate, plannedDP }
}

// ---- 結果に応じた増減 ------------------------------------------------------
/** 成功時：予定どおり獲得 */
export function calcSuccess(config: SessionConfig): { rateChange: number; dpChange: number } {
  return { rateChange: config.plannedRate, dpChange: config.plannedDP }
}

/** 脱獄時：予定レートの80%を失い、DPは0 */
export function calcJailbreak(config: SessionConfig): {
  lostRate: number
  rateChange: number
  dpChange: number
} {
  const lostRate = roundRate(config.plannedRate * JAILBREAK_PENALTY)
  return { lostRate, rateChange: -lostRate, dpChange: 0 }
}

/** 結果種別からレート/DPの増減をまとめて返す */
export function calcResult(
  config: SessionConfig,
  result: SessionResult,
): { rateChange: number; dpChange: number } {
  if (result === 'success') return calcSuccess(config)
  const { rateChange, dpChange } = calcJailbreak(config)
  return { rateChange, dpChange }
}

// ---- 記録の生成 / 実績への反映 --------------------------------------------
/** セッション結果から SessionRecord を生成する */
export function createSessionRecord(
  config: SessionConfig,
  result: SessionResult,
  options: { usedTicket: boolean; actualMinutes: number; date?: Date },
): SessionRecord {
  const { rateChange, dpChange } = calcResult(config, result)
  const date = options.date ?? new Date()
  return {
    id: `sess-${date.getTime()}-${Math.floor(Math.random() * 1000)}`,
    date: date.toISOString(),
    usageType: config.usageType,
    mode: config.mode,
    durationMinutes: config.durationMinutes,
    result,
    rateChange,
    dpChange,
    usedTicket: options.usedTicket,
    actualMinutes: options.actualMinutes,
  }
}

/** セッション記録をユーザー実績へ反映した新しい UserStats を返す（チケットは別管理） */
export function applySessionToStats(stats: UserStats, record: SessionRecord): UserStats {
  const success = record.result === 'success'
  return {
    ...stats,
    currentRate: roundRate(stats.currentRate + record.rateChange),
    currentDP: stats.currentDP + record.dpChange,
    totalFocusMinutes: stats.totalFocusMinutes + record.actualMinutes,
    successCount: stats.successCount + (success ? 1 : 0),
    jailbreakCount: stats.jailbreakCount + (success ? 0 : 1),
    // 成功で連続日数を維持、脱獄でリセット
    streakDays: success ? stats.streakDays : 0,
  }
}

/** 成功率（%）。母数0なら0。 */
export function successRate(stats: UserStats): number {
  const total = stats.successCount + stats.jailbreakCount
  if (total === 0) return 0
  return Math.round((stats.successCount / total) * 100)
}

// ---- 動作確認用セルフテスト（DEV のみ main.tsx から呼ぶ）-------------------
export function runSessionCalcSelfTest(): void {
  const cases: Array<{ usage: UsageType; mode: SessionMode; dur: Duration }> = [
    { usage: 'anywhere', mode: 'personal', dur: 60 },
    { usage: 'anywhere', mode: 'personal', dur: 120 },
    { usage: 'partner', mode: 'coop', dur: 60 },
    { usage: 'direct', mode: 'battle', dur: 90 },
  ]

  const rows = cases.map(({ usage, mode, dur }) => {
    const config = buildSessionConfig(usage, mode, dur)
    const jb = calcJailbreak(config)
    return {
      条件: `${USAGE_LABELS[usage]} / ${MODE_LABELS[mode]} / ${dur}分`,
      予定レート: formatRate(config.plannedRate),
      予定DP: config.plannedDP,
      脱獄で失うレート: formatRate(jb.lostRate),
      脱獄後DP: jb.dpChange,
    }
  })

  // 代表ケースの期待値チェック
  const base = buildSessionConfig('anywhere', 'personal', 60)
  console.assert(base.plannedRate === 2.0 && base.plannedDP === 6, 'base case mismatch')
  console.assert(calcJailbreak(base).rateChange === -1.6, 'jailbreak 80% mismatch')

  console.groupCollapsed('%c[DopaLock] sessionCalc セルフテスト', 'color:#2563eb;font-weight:bold')
  console.table(rows)
  console.groupEnd()
}
