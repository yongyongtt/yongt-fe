import type { ReactNode } from 'react'
import { cx } from '@/shared/utils/cx'

/** 흰 배경 + 회색 테두리 + 둥근 모서리 카드 (상세·메인 공통) */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-xl border border-gray-10 bg-white', className)}>
      {children}
    </section>
  )
}
