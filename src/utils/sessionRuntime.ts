// 実行中セッションの一時状態（集中↔休憩をまたいで共有・再開する）
import { loadSettings } from './settings'

export interface SessionRuntime {
  /** 集中の経過（画面表示上の秒数） */
  elapsedSeconds: number
  /** 画面表示上の総秒数（durationMinutes × 60） */
  totalSeconds: number
  /** 残り5分チケット枚数 */
  ticketsRemaining: number
  /** このセッションで使ったチケット枚数 */
  ticketsUsed: number
  /** チケットを1枚でも使ったか */
  usedTicket: boolean
}

const RUNTIME_KEY = 'dopalock:sessionRuntime'

// ---- デモ用タイマー加速 ----------------------------------------------------
/** タイマーの更新間隔（実時間ミリ秒） */
export const TICK_MS = 100
/**
 * 1tick（=100ms）で進める「表示上の秒数」。
 * 2 にすると、表示1分（60秒）が実時間およそ3秒で進む（デモ用短縮）。
 * UI 上は選択した本来の分数を表示したまま、待ち時間だけ短縮する。
 */
export const DISPLAY_SECONDS_PER_TICK = 2

/**
 * 現在の設定に応じた「1tickで進める表示秒数」。
 * 短縮モードON → 2（速い）、OFF → 0.1（ほぼ実時間）。
 * 毎tick読むので、セッション中に設定を切り替えても即反映される。
 */
export function displaySecondsPerTick(): number {
  return loadSettings().demoSpeed ? DISPLAY_SECONDS_PER_TICK : 0.1
}

/** 休憩の表示上の総秒数（5分） */
export const BREAK_TOTAL_SECONDS = 5 * 60

function read(): SessionRuntime | null {
  try {
    const raw = localStorage.getItem(RUNTIME_KEY)
    return raw ? (JSON.parse(raw) as SessionRuntime) : null
  } catch {
    return null
  }
}

function write(runtime: SessionRuntime): void {
  try {
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(runtime))
  } catch {
    // 無視
  }
}

export function loadSessionRuntime(): SessionRuntime | null {
  return read()
}

export function saveSessionRuntime(runtime: SessionRuntime): void {
  write(runtime)
}

/** 新しいセッションの実行状態を初期化する（セッション開始時に呼ぶ） */
export function initSessionRuntime(totalSeconds: number, tickets: number): SessionRuntime {
  const runtime: SessionRuntime = {
    elapsedSeconds: 0,
    totalSeconds,
    ticketsRemaining: tickets,
    ticketsUsed: 0,
    usedTicket: false,
  }
  write(runtime)
  return runtime
}

/** 経過秒だけを保存する */
export function persistElapsed(seconds: number): void {
  const rt = read()
  if (!rt) return
  write({ ...rt, elapsedSeconds: seconds })
}

/** チケットを1枚消費する。残0なら何もしない。更新後の状態を返す。 */
export function consumeTicket(): SessionRuntime | null {
  const rt = read()
  if (!rt || rt.ticketsRemaining <= 0) return rt
  const next: SessionRuntime = {
    ...rt,
    ticketsRemaining: rt.ticketsRemaining - 1,
    ticketsUsed: rt.ticketsUsed + 1,
    usedTicket: true,
  }
  write(next)
  return next
}

export function clearSessionRuntime(): void {
  try {
    localStorage.removeItem(RUNTIME_KEY)
  } catch {
    // 無視
  }
}
