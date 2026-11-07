import type { ReactNode } from 'react'
import { cx } from '@/shared/utils/cx'

const variants = {
  ghost: 'border-white/22 bg-white/12 text-white', // 처인구
  danger: 'border-danger-50 bg-danger-50 text-white', // 종합 취약도
  light: 'border-white bg-white text-primary-60', // 우선순위
}

type HeroChipProps = {
  children: ReactNode
  variant?: keyof typeof variants
}

/** 파란 히어로 위에 올라가는 둥근 칩 */
export function HeroChip({ children, variant = 'ghost' }: HeroChipProps) {
  return (
    <span
      className={cx(
        'inline-flex h-[34px] items-center rounded-full border px-[13px] text-[15px] font-medium tracking-[-0.01em] whitespace-nowrap',
        variants[variant],
      )}
    >
      {children}
    </span>
  )
}
