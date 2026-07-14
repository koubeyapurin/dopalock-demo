import { useEffect, useState } from 'react'

/** 画面幅が指定px未満か（タイマーなど、数値サイズを切り替えたい箇所で使う） */
export function useIsMobile(maxWidth = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < maxWidth,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [maxWidth])

  return isMobile
}
