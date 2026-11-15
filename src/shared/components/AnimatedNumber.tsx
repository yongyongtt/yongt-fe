import { useEffect, useRef, useState } from 'react'

type AnimatedNumberProps = {
  value: number
  /** 표시 형식. 기본은 천 단위 쉼표 */
  format?: (value: number) => string
  /** ms */
  duration?: number
}

const defaultFormat = (v: number) => v.toLocaleString('ko-KR')

/**
 * 값이 바뀌면 이전 숫자에서 새 숫자로 굴러가듯 바뀜 (68 → 71)
 * 처음 나타날 때는 바로 최종 값을 보여 줌. '동작 줄이기' 설정이면 애니메이션 없음
 */
export function AnimatedNumber({
  value,
  format = defaultFormat,
  duration = 700,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  // 지금 화면에 보이는 값. 애니메이션 도중에 값이 또 바뀌어도 거기서부터 이어서 움직임
  const shownRef = useRef(value)
  const decimals = Number.isInteger(value) ? 0 : 1

  useEffect(() => {
    const from = shownRef.current
    if (from === value) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const next = from + (value - from) * eased
      shownRef.current = next
      setDisplay(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  const rounded = Number(display.toFixed(decimals))
  // 숫자 폭이 바뀌며 옆 글자가 흔들리지 않게 고정 폭 숫자 사용
  return <span className="tabular-nums">{format(rounded)}</span>
}
