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
        // スマホでは余白を詰めて、横幅を本文に使えるようにする
        compact ? 'p-3 md:p-4' : 'p-4 md:p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
