import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '../lib/cn'
import Card from './Card'
import IconBadge, { type IconTone } from './IconBadge'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  unit?: string
  /** 補助テキスト（例：前日比 +0.3 / 成功率 82%） */
  caption?: string
  tone?: IconTone
  /** caption に矢印と色を付ける */
  trend?: 'up' | 'down'
  className?: string
}

/** アイコン付き・大きな数字の実績カード */
export default function StatCard({
  icon,
  label,
  value,
  unit,
  caption,
  tone = 'blue',
  trend,
  className,
}: StatCardProps) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight
  const trendColor =
    trend === 'up' ? 'text-teal-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'

  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <IconBadge icon={icon} tone={tone} size="sm" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold leading-none text-navy">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      {caption && (
        <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
          {trend && <TrendIcon className="h-3.5 w-3.5" strokeWidth={2.4} />}
          <span>{caption}</span>
        </div>
      )}
    </Card>
  )
}
