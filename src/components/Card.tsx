import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** 内側の余白を詰める（デフォルトは p-6） */
  compact?: boolean
}

/** 白背景・角丸・薄い影の共通カード */
export default function Card({ children, compact, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white shadow-card',
        compact ? 'p-4' : 'p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
