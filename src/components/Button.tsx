import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconRight?: LucideIcon
  fullWidth?: boolean
  children?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-600 to-navy-800 text-white shadow-card hover:from-brand-500 hover:to-navy-700 active:scale-[0.99]',
  secondary: 'border border-slate-200 bg-white text-navy shadow-sm hover:bg-slate-50',
  danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
}

/** 全ボタンの基底。通常は Primary/Secondary/Danger のラッパーを使う。 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <button
      className={cn(
        base,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className={iconSize} strokeWidth={2.4} />}
      {children}
      {IconRight && <IconRight className={iconSize} strokeWidth={2.4} />}
    </button>
  )
}
