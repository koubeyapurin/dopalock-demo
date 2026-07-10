import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, History, Lock, XCircle } from 'lucide-react'
import { Card, PageHeader, PrimaryButton, StatusPill } from '../components'
import {
  MODE_LABELS,
  USAGE_LABELS,
  formatDateTime,
  withSign,
} from '../utils/sessionCalc'
import { loadSessionRecords } from '../utils/storage'
import type { SessionRecord } from '../types'

export default function HistoryPage() {
  const navigate = useNavigate()
  const records = loadSessionRecords()
  const successCount = records.filter((r) => r.result === 'success').length
  const jailbreakCount = records.length - successCount

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="セッション履歴"
        description="これまでのセッションをすべて確認できます。"
        icon={History}
      />

      {/* サマリー */}
      <div className="mb-4 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy shadow-card">
          <Clock className="h-4 w-4 text-slate-400" />
          合計 {records.length} 回
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-600 shadow-card">
          <CheckCircle2 className="h-4 w-4" />
          成功 {successCount} 回
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-card">
          <XCircle className="h-4 w-4" />
          脱獄 {jailbreakCount} 回
        </span>
      </div>

      <Card>
        {records.length === 0 ? (
          <EmptyState onStart={() => navigate('/session/new')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="pb-3 pr-3 font-medium">日付</th>
                  <th className="pb-3 pr-3 font-medium">利用形態</th>
                  <th className="pb-3 pr-3 font-medium">モード</th>
                  <th className="pb-3 pr-3 font-medium">時間</th>
                  <th className="pb-3 pr-3 font-medium">結果</th>
                  <th className="pb-3 pr-3 text-right font-medium">レート増減</th>
                  <th className="pb-3 text-right font-medium">DP増減</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <Row key={r.id} record={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function Row({ record }: { record: SessionRecord }) {
  const isSuccess = record.result === 'success'
  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
      <td className="py-3 pr-3 text-navy">{formatDateTime(record.date)}</td>
      <td className="py-3 pr-3 text-slate-600">{USAGE_LABELS[record.usageType]}</td>
      <td className="py-3 pr-3 text-slate-600">{MODE_LABELS[record.mode]}</td>
      <td className="py-3 pr-3 text-slate-600">{record.durationMinutes}分</td>
      <td className="py-3 pr-3">
        <StatusPill tone={isSuccess ? 'success' : 'danger'}>
          {isSuccess ? '成功' : '脱獄'}
        </StatusPill>
      </td>
      <td
        className={`py-3 pr-3 text-right font-bold ${
          record.rateChange >= 0 ? 'text-brand-600' : 'text-red-500'
        }`}
      >
        {withSign(record.rateChange)}
      </td>
      <td className="py-3 text-right font-bold text-teal-600">
        {record.dpChange > 0 ? `+${record.dpChange}` : record.dpChange}
      </td>
    </tr>
  )
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100">
        <Clock className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">まだセッション履歴がありません。</p>
      <PrimaryButton icon={Lock} onClick={onStart}>
        セッションを始める
      </PrimaryButton>
    </div>
  )
}
