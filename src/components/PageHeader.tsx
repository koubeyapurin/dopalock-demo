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
    <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-start md:justify-between md:gap-4">
      <div className="flex items-center gap-3">
        {icon && <IconBadge icon={icon} tone="blue" size="md" className="shrink-0" />}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500 md:text-base">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
