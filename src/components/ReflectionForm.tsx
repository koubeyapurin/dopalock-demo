import { useState } from 'react'
import { CheckCircle2, CircleDashed, NotebookPen, Target, XCircle } from 'lucide-react'
import Card from './Card'
import SectionTitle from './SectionTitle'
import PrimaryButton from './PrimaryButton'
import { cn } from '../lib/cn'
import { loadReflection, saveReflection } from '../utils/storage'
import type { GoalAchievement, SessionReflection } from '../types'

const ACHIEVEMENTS: Array<{
  value: GoalAchievement
  label: string
  icon: typeof CheckCircle2
  activeClass: string
}> = [
  {
    value: 'full',
    label: '達成できた',
    icon: CheckCircle2,
    activeClass: 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-200',
  },
  {
    value: 'partial',
    label: '一部できた',
    icon: CircleDashed,
    activeClass: 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200',
  },
  {
    value: 'none',
    label: 'できなかった',
    icon: XCircle,
    activeClass: 'border-red-400 bg-red-50 text-red-600 ring-2 ring-red-200',
  },
]

interface ReflectionFormProps {
  /** 対象のセッション記録 id。旧データで id が無い場合は入力を出さない */
  recordId?: string
  /** 開始時に入力した学習目標 */
  goal?: string
}

/**
 * セッション終了後の振り返り入力。
 * 保存は既存レコードへの上書きなので、レート・DP は増減しない。
 */
export default function ReflectionForm({ recordId, goal }: ReflectionFormProps) {
  const [saved, setSaved] = useState<SessionReflection | null>(() =>
    recordId ? loadReflection(recordId) : null,
  )
  const [achievement, setAchievement] = useState<GoalAchievement | null>(
    () => saved?.achievement ?? null,
  )
  const [focusScore, setFocusScore] = useState<number>(() => saved?.focusScore ?? 3)
  const [note, setNote] = useState(() => saved?.note ?? '')

  if (!recordId) return null

  const handleSave = () => {
    if (!achievement) return
    const reflection: SessionReflection = {
      achievement,
      focusScore,
      note: note.trim() || undefined,
    }
    saveReflection(recordId, reflection)
    setSaved(reflection)
  }

  return (
    <Card className="mt-6">
      <SectionTitle title="今回の振り返り" icon={NotebookPen} />

      {goal && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <Target className="h-4 w-4 shrink-0 text-brand-500" />
          <p className="min-w-0 text-sm text-slate-600">
            目標：<span className="font-semibold text-navy">{goal}</span>
          </p>
        </div>
      )}

      {/* 目標達成度 */}
      <p className="mt-4 text-sm font-semibold text-navy">目標は達成できましたか？</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.icon
          const active = achievement === a.value
          return (
            <button
              key={a.value}
              type="button"
              onClick={() => setAchievement(a.value)}
              className={cn(
                'flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition',
                active
                  ? a.activeClass
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {a.label}
            </button>
          )
        })}
      </div>

      {/* 集中度 */}
      <p className="mt-5 text-sm font-semibold text-navy">
        体感の集中度（1〜5）
        <span className="ml-2 text-xs font-normal text-slate-400">1: 散漫 / 5: 没頭</span>
      </p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setFocusScore(n)}
            aria-pressed={focusScore === n}
            className={cn(
              'min-h-[52px] rounded-xl border text-base font-bold transition',
              focusScore === n
                ? 'border-brand-500 bg-brand-600 text-white ring-2 ring-brand-200'
                : 'border-slate-200 bg-white text-navy hover:bg-slate-50',
            )}
          >
            {n}
          </button>
        ))}
      </div>

      {/* メモ */}
      <label className="mt-5 block text-sm font-semibold text-navy" htmlFor="reflection-note">
        振り返りメモ（任意）
      </label>
      <textarea
        id="reflection-note"
        rows={3}
        value={note}
        maxLength={200}
        onChange={(e) => setNote(e.target.value)}
        placeholder="例：最初の30分は集中できたが、後半で気が散った。次は先に通知を切る。"
        className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-navy placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <p className="text-xs text-slate-400">
          入力内容は履歴と「検証データ」に反映されます（レート・DPは変動しません）。
        </p>
        <PrimaryButton
          size="lg"
          fullWidth
          disabled={!achievement}
          className="min-h-[52px] sm:w-auto"
          onClick={handleSave}
        >
          {saved ? '振り返りを更新する' : '振り返りを保存する'}
        </PrimaryButton>
      </div>

      {saved && (
        <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-teal-50 py-2 text-sm font-semibold text-teal-700">
          <CheckCircle2 className="h-4 w-4" />
          振り返りを保存しました
        </p>
      )}
    </Card>
  )
}
