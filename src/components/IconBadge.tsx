import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export type IconTone = 'blue' | 'navy' | 'green' | 'red' | 'amber' | 'gray'
type IconSize = 'sm' | 'md' | 'lg'

const toneClasses: Record<IconTone, string> = {
  blue: 'bg-brand-50 text-brand-600',
  navy: 'bg-navy-50 text-navy',
  green: 'bg-teal-50 text-teal-600',
  red: 'bg-red-50 text-red-500',
  amber: 'bg-amber-50 text-amber-600',
  gray: 'bg-slate-100 text-slate-500',
}

const sizeClasses: Record<IconSize, { box: string; icon: string }> = {
  sm: { box: 'h-9 w-9', icon: 'h-4 w-4' },
  md: { box: 'h-11 w-11', icon: 'h-5 w-5' },
  lg: { box: 'h-14 w-14', icon: 'h-7 w-7' },
}

interface IconBadgeProps {
  icon: LucideIcon
  tone?: IconTone
  shape?: 'circle' | 'rounded'
  size?: IconSize
  className?: string
}

/** アイコンを淡色の丸／角丸背景に載せたバッジ */
export default function IconBadge({
  icon: Icon,
  tone = 'blue',
  shape = 'rounded',
  size = 'md',
  className,
}: IconBadgeProps) {
  const s = sizeClasses[size]
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center',
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        s.box,
        toneClasses[tone],
        className,
      )}
    >
      <Icon className={s.icon} strokeWidth={2.2} />
    </span>
  )
}
