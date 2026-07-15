import { useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import Button from './Button'
import IconBadge, { type IconTone } from './IconBadge'
import { cn } from '../lib/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** 本文（改行したい場合は配列で渡す） */
  message: string | string[]
  icon?: LucideIcon
  tone?: IconTone
  confirmLabel?: string
  cancelLabel?: string
  /** 確定ボタンを危険色にする */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * window.confirm の代替。
 * スマホでもデザインが崩れず、面接デモで見せられる見た目にする。
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  icon,
  tone = 'red',
  confirmLabel = 'OK',
  cancelLabel = 'キャンセル',
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // 背後のスクロールを止める
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Esc で閉じる
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const lines = Array.isArray(message) ? message : [message]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {icon && <IconBadge icon={icon} tone={tone} size="md" className="shrink-0" />}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-navy">{title}</h2>
            <div className="mt-2 space-y-1.5">
              {lines.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-600">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* スマホでは主要でない「キャンセル」を下に置き、誤タップを減らす */}
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="lg"
            fullWidth
            className={cn('order-1 min-h-[48px]', danger && 'sm:order-2')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className={cn('order-2 min-h-[48px]', danger && 'sm:order-1')}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
