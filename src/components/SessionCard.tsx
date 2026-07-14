import { Check, X } from 'lucide-react'
import IconBadge from './IconBadge'
import StatusPill from './StatusPill'
import { MODE_LABELS, USAGE_LABELS, formatDateTime, withSign } from '../utils/sessionCalc'
import type { SessionRecord } from '../types'

/** スマホでテーブルの代わりに使うセッション履歴カード */
export default function SessionCard({ record }: { record: SessionRecord }) {
  const isSuccess = record.result === 'success'

  return (
    <li
      className={`rounded-2xl border p-4 ${
        isSuccess ? 'border-teal-100 bg-teal-50/30' : 'border-red-100 bg-red-50/30'
      }`}
    >
      {/* 上段：日時＋結果 */}
      <div className="flex items-center gap-2.5">
        <IconBadge
          icon={isSuccess ? Check : X}
          tone={isSuccess ? 'green' : 'red'}
          size="sm"
          shape="circle"
        />
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-navy">
          {formatDateTime(record.date)}
        </p>
        <StatusPill tone={isSuccess ? 'success' : 'danger'}>
          {isSuccess ? '成功' : '脱獄'}
        </StatusPill>
      </div>

      {/* 中段：利用形態・モード・時間 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Tag>{USAGE_LABELS[record.usageType]}</Tag>
        <Tag>{MODE_LABELS[record.mode]}</Tag>
        <Tag>{record.durationMinutes}分</Tag>
      </div>

      {/* 下段：レート・DP 増減 */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3">
        <div>
          <p className="text-[11px] text-slate-400">レート増減</p>
          <p
            className={`text-base font-bold ${
              record.rateChange >= 0 ? 'text-brand-600' : 'text-red-500'
            }`}
          >
            {withSign(record.rateChange)}
            <span className="ml-1 text-[10px] font-medium text-slate-400">DP/30分</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-400">DP増減</p>
          <p
            className={`text-base font-bold ${
              record.dpChange > 0 ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            {record.dpChange > 0 ? `+${record.dpChange}` : record.dpChange}
            <span className="ml-1 text-[10px] font-medium text-slate-400">DP</span>
          </p>
        </div>
      </div>
    </li>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
      {children}
    </span>
  )
}
