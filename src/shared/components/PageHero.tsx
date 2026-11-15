import type { ReactNode } from 'react'
import heroDeco from '@/assets/hero-deco.svg'
import { cx } from '@/shared/utils/cx'

type PageHeroProps = {
  children: ReactNode
  className?: string
}

/** 페이지 상단 파란 배경 영역 (메인·상세 공통). */
export function PageHero({ children, className }: PageHeroProps) {
  return (
    <section
      className={cx(
        'relative overflow-hidden bg-[linear-gradient(166deg,var(--color-hero-from)_12%,var(--color-hero-via)_42%,var(--color-hero-to)_88%)]',
        className,
      )}
    >
      <img
        src={heroDeco}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 left-[calc(50%+300px)] max-w-none animate-hero-deco max-lg:left-[45%] max-lg:opacity-50"
      />
      <div className="relative container-page h-full">{children}</div>
    </section>
  )
}
