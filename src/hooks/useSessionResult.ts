import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SessionResult, SessionResultSummary, UserStats } from '../types'
import { applySessionToStats, createSessionRecord } from '../utils/sessionCalc'
import {
  addSessionRecord,
  loadLastResult,
  loadSessionConfig,
  loadUserStats,
  saveLastResult,
  saveUserStats,
} from '../utils/storage'
import {
  clearSessionRuntime,
  loadSessionRuntime,
} from '../utils/sessionRuntime'
import { clearSessionConfig } from '../utils/storage'

/**
 * セッション結果を1回だけ確定させ、サマリーを返す。
 *
 * - runtime が存在するとき（＝集中/休憩から遷移してきた初回）のみ実績へ反映する
 * - 反映後に runtime / config をクリアするため、リロードしても二重加算されない
 * - リロード時は保存済みサマリーを表示するだけ
 */
export function useSessionResult(result: SessionResult): SessionResultSummary | null {
  const navigate = useNavigate()
  const processed = useRef(false)
  const [summary, setSummary] = useState<SessionResultSummary | null>(null)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const runtime = loadSessionRuntime()
    const config = loadSessionConfig()

    // 既に確定済み（リロード等）→ 保存済みサマリーを表示
    if (!runtime || !config) {
      const saved = loadLastResult()
      if (saved && saved.result === result) {
        setSummary(saved)
      } else {
        navigate('/', { replace: true })
      }
      return
    }

    // --- ここから確定処理（初回のみ）---
    const stats = loadUserStats()
    const actualMinutes =
      result === 'success'
        ? config.durationMinutes
        : Math.max(1, Math.min(config.durationMinutes, Math.floor(runtime.elapsedSeconds / 60)))

    const record = createSessionRecord(config, result, {
      usedTicket: runtime.usedTicket,
      actualMinutes,
    })

    const applied = applySessionToStats(stats, record)
    const finalStats: UserStats = {
      ...applied,
      // 使用したチケットを所持数から差し引く
      tickets: Math.max(0, stats.tickets - runtime.ticketsUsed),
    }

    saveUserStats(finalStats)
    addSessionRecord(record)

    const now = new Date()
    const data: SessionResultSummary = {
      result,
      usageType: config.usageType,
      mode: config.mode,
      durationMinutes: config.durationMinutes,
      plannedRate: config.plannedRate,
      plannedDP: config.plannedDP,
      rateChange: record.rateChange,
      dpChange: record.dpChange,
      lostRate: result === 'jailbreak' ? Math.abs(record.rateChange) : 0,
      actualMinutes,
      usedTicket: runtime.usedTicket,
      startedAt: new Date(now.getTime() - actualMinutes * 60_000).toISOString(),
      finishedAt: now.toISOString(),
      rateBefore: stats.currentRate,
      rateAfter: finalStats.currentRate,
      dpBefore: stats.currentDP,
      dpAfter: finalStats.currentDP,
      successCountAfter: finalStats.successCount,
      streakAfter: finalStats.streakDays,
    }

    saveLastResult(data)
    clearSessionRuntime()
    clearSessionConfig()
    setSummary(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return summary
}
