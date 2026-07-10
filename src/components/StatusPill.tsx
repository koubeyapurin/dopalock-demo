import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export type PillTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand'

const toneClasses: Record<PillTone, string> = {
  success: 'bg-teal-50 text-teal-700',
  danger: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-brand-50 text-brand-700',
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-600 text-white',
}

interface StatusPillProps {
  children: ReactNode
  tone?: PillTone
  icon?: LucideIcon
  className?: string
}

/** 成功・脱獄・集中中・モードなどの小さなステータスタグ */
export default function StatusPill({
  children,
  tone = 'neutral',
  icon: Icon,
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />}
      {children}
    </span>
  )
}
