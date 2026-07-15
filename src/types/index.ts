// DopaLock デモアプリの共通型定義（docs/SPEC.md 準拠）

/** 利用形態 */
export type UsageType = 'anywhere' | 'partner' | 'direct'

/** 集中モード */
export type SessionMode = 'personal' | 'coop' | 'battle'

/** セッション結果 */
export type SessionResult = 'success' | 'jailbreak'

/** 選択可能なセッション時間（分） */
export type Duration = 30 | 60 | 90 | 120

/** ユーザーの累計実績 */
export interface UserStats {
  name: string
  grade: string
  currentRate: number
  currentDP: number
  tickets: number
  totalFocusMinutes: number
  successCount: number
  jailbreakCount: number
  streakDays: number
}

/** これから開始するセッションの設定＋予定獲得値 */
export interface SessionConfig {
  usageType: UsageType
  mode: SessionMode
  durationMinutes: Duration
  plannedRate: number
  plannedDP: number
  /** 今回の学習目標（任意。旧データとの互換のため optional） */
  goal?: string
}

/** 目標の達成度（振り返り入力） */
export type GoalAchievement = 'full' | 'partial' | 'none'

/** セッション終了後の振り返り */
export interface SessionReflection {
  /** 目標達成度 */
  achievement: GoalAchievement
  /** 自己評価の集中度（1〜5） */
  focusScore: number
  /** 振り返りメモ（任意） */
  note?: string
}

/** セッション進行フェーズ */
export type SessionPhase = 'idle' | 'focus' | 'break'

/** 結果画面（成功／脱獄）に渡すサマリー */
export interface SessionResultSummary {
  /** 対応する SessionRecord の id（振り返りの後追い保存に使う） */
  recordId?: string
  goal?: string
  /** セッション中にタブ・画面を離れた回数 */
  awayCount?: number
  result: SessionResult
  usageType: UsageType
  mode: SessionMode
  durationMinutes: number
  plannedRate: number
  plannedDP: number
  rateChange: number
  dpChange: number
  /** 脱獄で失ったレート（成功時は0） */
  lostRate: number
  actualMinutes: number
  usedTicket: boolean
  startedAt: string
  finishedAt: string
  rateBefore: number
  rateAfter: number
  dpBefore: number
  dpAfter: number
  successCountAfter: number
  streakAfter: number
}

/** 完了・脱獄したセッションの記録 */
export interface SessionRecord {
  id: string
  date: string
  usageType: UsageType
  mode: SessionMode
  durationMinutes: number
  result: SessionResult
  rateChange: number
  dpChange: number
  usedTicket: boolean
  actualMinutes: number
  /** 開始時に入力した学習目標（任意） */
  goal?: string
  /** セッション中にタブ・画面を離れた回数（任意） */
  awayCount?: number
  /** 終了後の振り返り（未入力なら undefined） */
  reflection?: SessionReflection
}
