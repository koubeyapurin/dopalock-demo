import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface SectionTitleProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** 右側に置く要素（リンク・ボタンなど） */
  action?: ReactNode
  className?: string
}

/** カード内・セクションの見出し（例：「利用形態を選ぶ」） */
export default function SectionTitle({
  title,
  description,
  icon: Icon,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-brand-600" strokeWidth={2.2} />}
        <div>
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
