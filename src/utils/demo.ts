// 面接デモ用のショートカット。
// storage と sessionRuntime の両方を触るため、循環 import を避けてここに置く。
import type { SessionConfig } from '../types'
import { buildSessionConfig } from './sessionCalc'
import { clearSessionRuntime, initSessionRuntime } from './sessionRuntime'
import {
  clearDemoData,
  clearLastResult,
  clearSessionConfig,
  loadUserStats,
  saveSessionConfig,
} from './storage'

/** ワンクリックデモの既定値（提携店舗・協力モード・60分） */
export const QUICK_DEMO_GOAL = '英語のレポートを1本仕上げる'

export function buildQuickDemoConfig(): SessionConfig {
  return { ...buildSessionConfig('partner', 'coop', 60), goal: QUICK_DEMO_GOAL }
}

/**
 * 選択画面を飛ばして、その場でセッションを開始できる状態にする。
 * 呼び出し側で /session/focus へ遷移すること。
 */
export function startQuickDemo(): SessionConfig {
  const config = buildQuickDemoConfig()
  saveSessionConfig(config)
  initSessionRuntime(config.durationMinutes * 60, loadUserStats().tickets)
  return config
}

/**
 * 保存データをすべて消して初期状態に戻す。
 * 進行中セッションも解除されるので、ロック中でもデモをやり直せる。
 * （タイマー短縮モードなどの設定は、デモの都合で残す）
 */
export function resetAllDemoData(): void {
  clearDemoData()
  clearSessionRuntime()
  clearSessionConfig()
  clearLastResult()
}
