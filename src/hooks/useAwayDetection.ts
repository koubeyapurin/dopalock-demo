import { useEffect, useRef, useState } from 'react'
import { loadSessionRuntime, recordAway } from '../utils/sessionRuntime'

export interface AwayState {
  /** 離脱した回数 */
  count: number
  /** 離れていた合計秒数（実時間） */
  seconds: number
  /** 直近の離脱で離れていた秒数（警告の表示用。未発生なら null） */
  lastSeconds: number | null
}

/**
 * 集中中のタブ離脱・画面非表示を検知する。
 *
 * `visibilitychange` だけを見ているのは、window の blur だと
 * 確認モーダルや DevTools を開いただけで誤検知するため。
 * ブラウザのタブを切り替える／別アプリに移る／画面を消す、のいずれかで発火する。
 *
 * 注意：これは Web でできる範囲の検知であり、他アプリの利用そのものは止められない。
 * その旨は画面上でユーザーに明示すること。
 */
export function useAwayDetection(active: boolean): {
  away: AwayState
  clearLast: () => void
} {
  const hiddenAt = useRef<number | null>(null)
  const [away, setAway] = useState<AwayState>(() => {
    const rt = loadSessionRuntime()
    return { count: rt?.awayCount ?? 0, seconds: rt?.awaySeconds ?? 0, lastSeconds: null }
  })

  useEffect(() => {
    if (!active) return

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now()
        return
      }

      // 戻ってきた：離れていた時間を記録する
      if (hiddenAt.current === null) return
      const seconds = (Date.now() - hiddenAt.current) / 1000
      hiddenAt.current = null

      const rt = recordAway(seconds)
      if (!rt) return
      setAway({
        count: rt.awayCount ?? 0,
        seconds: rt.awaySeconds ?? 0,
        lastSeconds: Math.max(1, Math.round(seconds)),
      })
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [active])

  const clearLast = () => setAway((prev) => ({ ...prev, lastSeconds: null }))

  return { away, clearLast }
}
