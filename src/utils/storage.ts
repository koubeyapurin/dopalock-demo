import type {
  SessionConfig,
  SessionRecord,
  SessionReflection,
  SessionResultSummary,
  UserStats,
} from '../types'
import { initialSessionRecords, initialUserStats } from '../data/mockData'

const STATS_KEY = 'dopalock:userStats'
const RECORDS_KEY = 'dopalock:sessionRecords'
const CONFIG_KEY = 'dopalock:currentSession'
const RESULT_KEY = 'dopalock:lastResult'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 不可（プライベートモード等）の場合は黙って無視
  }
}

// ---- UserStats -------------------------------------------------------------
export function loadUserStats(): UserStats {
  return readJSON<UserStats>(STATS_KEY, initialUserStats)
}

export function saveUserStats(stats: UserStats): void {
  writeJSON(STATS_KEY, stats)
}

// ---- SessionRecord ---------------------------------------------------------
export function loadSessionRecords(): SessionRecord[] {
  return readJSON<SessionRecord[]>(RECORDS_KEY, initialSessionRecords)
}

export function saveSessionRecords(records: SessionRecord[]): void {
  writeJSON(RECORDS_KEY, records)
}

/** 記録を先頭（新しい順）に追加して保存し、更新後の一覧を返す */
export function addSessionRecord(record: SessionRecord): SessionRecord[] {
  const next = [record, ...loadSessionRecords()]
  saveSessionRecords(next)
  return next
}

/**
 * 既存の記録に振り返りを後追いで書き込む。
 * 記録の追加ではなく「上書き」なので、レート・DP は再加算されない。
 */
export function saveReflection(recordId: string, reflection: SessionReflection): void {
  const next = loadSessionRecords().map((r) =>
    r.id === recordId ? { ...r, reflection } : r,
  )
  saveSessionRecords(next)
}

/** 記録に紐づく振り返りを取得する（未入力なら null） */
export function loadReflection(recordId: string): SessionReflection | null {
  return loadSessionRecords().find((r) => r.id === recordId)?.reflection ?? null
}

// ---- 進行中セッションの設定 -----------------------------------------------
export function saveSessionConfig(config: SessionConfig): void {
  writeJSON(CONFIG_KEY, config)
}

export function loadSessionConfig(): SessionConfig | null {
  return readJSON<SessionConfig | null>(CONFIG_KEY, null)
}

export function clearSessionConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY)
  } catch {
    // 無視
  }
}

// ---- 直近の結果サマリー（結果画面用） -------------------------------------
export function saveLastResult(summary: SessionResultSummary): void {
  writeJSON(RESULT_KEY, summary)
}

export function loadLastResult(): SessionResultSummary | null {
  return readJSON<SessionResultSummary | null>(RESULT_KEY, null)
}

export function clearLastResult(): void {
  try {
    localStorage.removeItem(RESULT_KEY)
  } catch {
    // 無視
  }
}

// ---- デモ運用ヘルパー ------------------------------------------------------
/** 初期データで上書き（デモのやり直しに使用） */
export function resetDemoData(): void {
  saveUserStats(initialUserStats)
  saveSessionRecords(initialSessionRecords)
}

/** 保存データを削除（次回読み込みで初期データに戻る） */
export function clearDemoData(): void {
  try {
    localStorage.removeItem(STATS_KEY)
    localStorage.removeItem(RECORDS_KEY)
  } catch {
    // 無視
  }
}
