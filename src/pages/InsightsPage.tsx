import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Download,
  EyeOff,
  FlaskConical,
  Info,
  NotebookPen,
  Store,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Card, IconBadge, PageHeader, SecondaryButton, SectionTitle, StatusPill } from '../components'
import { USAGE_LABELS, formatShortDateTime } from '../utils/sessionCalc'
import { loadSessionRecords } from '../utils/storage'
import type { SessionRecord, UsageType } from '../types'

const ACHIEVEMENT_LABELS: Record<string, string> = {
  full: '達成できた',
  partial: '一部できた',
  none: 'できなかった',
}

const USAGE_ORDER: UsageType[] = ['anywhere', 'partner', 'direct']

/** 平均値（母数0なら null） */
function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

const fmt = (n: number | null, digits = 1): string => (n === null ? '—' : n.toFixed(digits))

export default function InsightsPage() {
  const records = loadSessionRecords()

  const stats = useMemo(() => {
    const total = records.length
    const success = records.filter((r) => r.result === 'success')
    const withGoal = records.filter((r) => r.goal)
    const reflected = records.filter((r) => r.reflection)

    const achievement = {
      full: reflected.filter((r) => r.reflection?.achievement === 'full').length,
      partial: reflected.filter((r) => r.reflection?.achievement === 'partial').length,
      none: reflected.filter((r) => r.reflection?.achievement === 'none').length,
    }

    // 「店舗で集中したほうが成果が出る」という事業仮説を、利用形態別に検証する
    const byUsage = USAGE_ORDER.map((usage) => {
      const rows = records.filter((r) => r.usageType === usage)
      const successRows = rows.filter((r) => r.result === 'success')
      const scores = rows
        .map((r) => r.reflection?.focusScore)
        .filter((s): s is number => typeof s === 'number')
      return {
        usage,
        label: USAGE_LABELS[usage].replace('DopaLock', ''),
        count: rows.length,
        successRate: rows.length === 0 ? null : (successRows.length / rows.length) * 100,
        avgFocus: average(scores),
        avgAway: average(rows.map((r) => r.awayCount ?? 0)),
      }
    })

    const scoresOf = (rows: SessionRecord[]) =>
      rows
        .map((r) => r.reflection?.focusScore)
        .filter((s): s is number => typeof s === 'number')

    return {
      total,
      successRate: total === 0 ? null : (success.length / total) * 100,
      goalRate: total === 0 ? null : (withGoal.length / total) * 100,
      reflectedCount: reflected.length,
      achievement,
      achievementRate:
        reflected.length === 0 ? null : (achievement.full / reflected.length) * 100,
      avgFocus: average(scoresOf(records)),
      avgFocusSuccess: average(scoresOf(success)),
      avgFocusJailbreak: average(scoresOf(records.filter((r) => r.result === 'jailbreak'))),
      avgAway: average(records.map((r) => r.awayCount ?? 0)),
      totalAway: records.reduce((sum, r) => sum + (r.awayCount ?? 0), 0),
      byUsage,
      notes: reflected.filter((r) => r.reflection?.note),
    }
  }, [records])

  const chartData = stats.byUsage.map((u) => ({
    label: u.label,
    成功率: u.successRate === null ? 0 : Math.round(u.successRate),
  }))

  const handleExport = () => {
    const header = [
      'id',
      'date',
      'usageType',
      'mode',
      'durationMinutes',
      'actualMinutes',
      'result',
      'rateChange',
      'dpChange',
      'usedTicket',
      'awayCount',
      'goal',
      'achievement',
      'focusScore',
      'note',
    ]
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = records.map((r) =>
      [
        r.id,
        r.date,
        r.usageType,
        r.mode,
        r.durationMinutes,
        r.actualMinutes,
        r.result,
        r.rateChange,
        r.dpChange,
        r.usedTicket,
        r.awayCount ?? 0,
        r.goal ?? '',
        r.reflection?.achievement ?? '',
        r.reflection?.focusScore ?? '',
        r.reflection?.note ?? '',
      ]
        .map(escape)
        .join(','),
    )

    // BOM を付けて Excel でも文字化けしないようにする
    const csv = '﻿' + [header.join(','), ...rows].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `dopalock-sessions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="検証データ"
        description="デモで蓄積されたセッション記録から、事業仮説の検証に使う指標を計算しています。"
        icon={FlaskConical}
      />

      {/* 主要指標 */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          tone="blue"
          label="セッション成功率"
          value={stats.successRate === null ? '—' : `${Math.round(stats.successRate)}%`}
          caption={`対象 ${stats.total}件`}
        />
        <MetricCard
          icon={Target}
          tone="green"
          label="目標の達成率"
          value={
            stats.achievementRate === null ? '—' : `${Math.round(stats.achievementRate)}%`
          }
          caption={`振り返り入力 ${stats.reflectedCount}件`}
        />
        <MetricCard
          icon={NotebookPen}
          tone="amber"
          label="平均の集中度"
          value={`${fmt(stats.avgFocus)} / 5`}
          caption={`成功時 ${fmt(stats.avgFocusSuccess)} ｜ 脱獄時 ${fmt(stats.avgFocusJailbreak)}`}
        />
        <MetricCard
          icon={EyeOff}
          tone="red"
          label="1回あたりの離脱検知"
          value={`${fmt(stats.avgAway)}回`}
          caption={`累計 ${stats.totalAway}回`}
        />
      </div>

      {/* 仮説：店舗のほうが集中できる */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <SectionTitle title="仮説検証：利用形態ごとの成功率" icon={Store} />
          <p className="mt-2 text-sm text-slate-500">
            「店舗で封印したほうが集中が続く」という仮説を、実データで確認します。
          </p>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef2f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#eef4ff' }}
                  formatter={(v: number) => [`${v}%`, '成功率']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="成功率" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="利用形態ごとの内訳" icon={FlaskConical} />
          <ul className="mt-4 space-y-2">
            {stats.byUsage.map((u) => (
              <li key={u.usage} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-navy">
                    {USAGE_LABELS[u.usage]}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">{u.count}件</span>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
                  <Metric label="成功率" value={u.successRate === null ? '—' : `${Math.round(u.successRate)}%`} />
                  <Metric label="集中度" value={fmt(u.avgFocus)} />
                  <Metric label="離脱" value={u.avgAway === null ? '—' : `${fmt(u.avgAway)}回`} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 目標達成度の内訳 ＋ 振り返りメモ */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <SectionTitle title="目標の達成度" icon={Target} />
          <p className="mt-2 text-sm text-slate-500">
            目標を設定したセッション：{stats.goalRate === null ? '—' : `${Math.round(stats.goalRate)}%`}
          </p>
          <ul className="mt-4 space-y-2">
            {(['full', 'partial', 'none'] as const).map((key) => {
              const count = stats.achievement[key]
              const pct =
                stats.reflectedCount === 0 ? 0 : (count / stats.reflectedCount) * 100
              return (
                <li key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{ACHIEVEMENT_LABELS[key]}</span>
                    <span className="font-bold text-navy">{count}件</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        key === 'full'
                          ? 'bg-teal-500'
                          : key === 'partial'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          {stats.reflectedCount === 0 && (
            <p className="mt-4 rounded-xl bg-slate-50 py-4 text-center text-xs text-slate-400">
              まだ振り返りが入力されていません。
              <br />
              セッション終了後の結果画面から入力できます。
            </p>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <SectionTitle
            title="振り返りメモ"
            icon={NotebookPen}
            action={
              <SecondaryButton icon={Download} onClick={handleExport}>
                CSVで書き出す
              </SecondaryButton>
            }
          />
          {stats.notes.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              メモ付きの振り返りはまだありません。
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.notes.slice(0, 5).map((r) => (
                <li key={r.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={r.result === 'success' ? 'success' : 'danger'}>
                      {r.result === 'success' ? '成功' : '脱獄'}
                    </StatusPill>
                    <span className="text-xs text-slate-400">{formatShortDateTime(r.date)}</span>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      集中度 {r.reflection?.focusScore} / 5
                    </span>
                  </div>
                  {r.goal && (
                    <p className="mt-2 text-xs text-slate-500">
                      目標：<span className="font-semibold text-navy">{r.goal}</span>（
                      {ACHIEVEMENT_LABELS[r.reflection?.achievement ?? '']}）
                    </p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {r.reflection?.note}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 計測の前提を明示する */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          <span className="font-semibold text-slate-600">計測の前提：</span>
          「離脱検知」は、集中セッション中にブラウザのタブを切り替えた・画面を非表示にした回数です。
          Web版では他アプリの利用そのものは検知・制御できません。実サービスではスマホアプリ側の制御と、
          店舗ロッカーによる物理的な封印を組み合わせて計測します。
          初期表示のデータにはデモ用のサンプル履歴が含まれます。
        </p>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: typeof Target
  label: string
  value: string
  caption: string
  tone: 'blue' | 'green' | 'amber' | 'red'
}) {
  return (
    <Card compact className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <IconBadge icon={icon} tone={tone} size="sm" />
      </div>
      <p className="truncate text-2xl font-bold leading-none text-navy">{value}</p>
      <p className="text-[11px] text-slate-400">{caption}</p>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white py-1.5">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-sm font-bold text-navy">{value}</p>
    </div>
  )
}
