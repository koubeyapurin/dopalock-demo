import { Check, X } from 'lucide-react'
import IconBadge from './IconBadge'
import StatusPill from './StatusPill'
import { MODE_LABELS, formatShortDateTime, withSign } from '../utils/sessionCalc'
import type { SessionRecord } from '../types'

interface HistoryListProps {
  records: SessionRecord[]
  limit?: number
}

/** セッション履歴のリスト（ホーム・結果画面などで共用） */
export default function HistoryList({ records, limit }: HistoryListProps) {
  const items = typeof limit === 'number' ? records.slice(0, limit) : records

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">まだ履歴がありません。</p>
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((r) => {
        const isSuccess = r.result === 'success'
        return (
          <li key={r.id} className="flex items-center gap-3 py-3">
            <IconBadge
              icon={isSuccess ? Check : X}
              tone={isSuccess ? 'green' : 'red'}
              size="sm"
              shape="circle"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">
                {formatShortDateTime(r.date)}
              </p>
              <p className="text-xs text-slate-400">
                {r.durationMinutes}分・{MODE_LABELS[r.mode]}
              </p>
            </div>
            <StatusPill
              tone={isSuccess ? 'success' : 'danger'}
              className="hidden sm:inline-flex"
            >
              {isSuccess ? '成功' : '脱獄'}
            </StatusPill>
            <div className="w-20 shrink-0 text-right">
              {isSuccess ? (
                <span className="text-sm font-bold text-teal-600">+{r.dpChange} DP</span>
              ) : (
                <span className="text-sm font-bold text-red-500">
                  {withSign(r.rateChange)}
                  <span className="ml-0.5 text-[10px] font-medium text-red-400">DP/30分</span>
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
