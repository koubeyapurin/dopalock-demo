import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

const colorMap = {
  brand: '#2563eb',
  teal: '#14b8a6',
} as const

interface CircularTimerProps {
  /** 0〜1 の進捗（リングの塗り割合） */
  progress: number
  size?: number
  stroke?: number
  color?: keyof typeof colorMap
  children: ReactNode
  className?: string
}

/** SVG 円形プログレスタイマー（集中・休憩で共用） */
export default function CircularTimer({
  progress,
  size = 220,
  stroke = 14,
  color = 'brand',
  children,
  className,
}: CircularTimerProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, progress))
  const offset = c * (1 - clamped)

  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.12s linear' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
