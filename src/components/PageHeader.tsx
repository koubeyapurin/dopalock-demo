import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import IconBadge from './IconBadge'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** 右側に置く要素（日付セレクタ・シェアボタンなど） */
  actions?: ReactNode
}

/** 各ページ上部の大見出し */
export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && <IconBadge icon={icon} tone="blue" size="md" />}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">{title}</h1>
          {description && <p className="mt-1 text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
