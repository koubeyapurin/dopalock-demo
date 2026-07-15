import type { SessionRecord, UserStats } from '../types'

// 初期ユーザー実績（localStorage 未保存時のデフォルト）
// currentRate はセッションごとに積み上がる累積レート。
// 学内ランキング（utils/ranking.ts）で中位（30位台）に来る値にしてある。
// ここを下げすぎると、1回の脱獄で最下位まで落ちてデモが不自然になる。
export const initialUserStats: UserStats = {
  name: 'たろう',
  grade: '大学2年生',
  currentRate: 6.8,
  currentDP: 2450,
  tickets: 2,
  totalFocusMinutes: 7590,
  successCount: 48,
  jailbreakCount: 10,
  streakDays: 7,
}

// 初期セッション履歴（新しい順）。rate/DP は sessionCalc の計算スケールに合わせている。
export const initialSessionRecords: SessionRecord[] = [
  {
    id: 'seed-1',
    date: '2026-07-09T19:00:00',
    usageType: 'anywhere',
    mode: 'personal',
    durationMinutes: 60,
    result: 'success',
    rateChange: 2.0,
    dpChange: 6,
    usedTicket: false,
    actualMinutes: 60,
  },
  {
    id: 'seed-2',
    date: '2026-07-09T14:00:00',
    usageType: 'direct',
    mode: 'coop',
    durationMinutes: 90,
    result: 'success',
    rateChange: 5.0,
    dpChange: 15,
    usedTicket: true,
    actualMinutes: 90,
  },
  {
    id: 'seed-3',
    date: '2026-07-08T21:00:00',
    usageType: 'anywhere',
    mode: 'battle',
    durationMinutes: 60,
    result: 'jailbreak',
    rateChange: -2.1,
    dpChange: 0,
    usedTicket: false,
    actualMinutes: 28,
  },
  {
    id: 'seed-4',
    date: '2026-07-08T16:00:00',
    usageType: 'partner',
    mode: 'personal',
    durationMinutes: 120,
    result: 'success',
    rateChange: 4.8,
    dpChange: 14,
    usedTicket: false,
    actualMinutes: 120,
  },
  {
    id: 'seed-5',
    date: '2026-07-07T20:00:00',
    usageType: 'anywhere',
    mode: 'coop',
    durationMinutes: 60,
    result: 'jailbreak',
    rateChange: -1.8,
    dpChange: 0,
    usedTicket: false,
    actualMinutes: 41,
  },
  {
    id: 'seed-6',
    date: '2026-07-07T10:00:00',
    usageType: 'partner',
    mode: 'battle',
    durationMinutes: 30,
    result: 'success',
    rateChange: 1.6,
    dpChange: 5,
    usedTicket: false,
    actualMinutes: 30,
  },
]
