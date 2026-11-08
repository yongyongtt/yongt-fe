import type { ReactNode } from 'react'
import { cx } from '@/shared/utils/cx'

type BulletBoxProps = {
  icon: ReactNode
  title: string
  lines: string[]
  className?: string
}

/** 추천 근거·주의사항 상자 */
export function BulletBox({ icon, title, lines, className }: BulletBoxProps) {
  return (
    <div className={cx('rounded-xl px-5 pt-5 pb-5 lg:px-[26px] lg:pt-[22px] lg:pb-6', className)}>
      <h3 className="flex items-center gap-2 text-base font-bold tracking-[-0.01em] text-gray-90 lg:text-[17px]">
        {icon}
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-1.5">
        {lines.map((line) => (
          <li
            key={line}
            className="relative pl-4 text-[14px] leading-6 tracking-[-0.01em] text-gray-70 before:absolute before:top-[9.5px] before:left-0.5 before:size-[5px] before:rounded-full before:bg-gray-50 lg:text-[15px]"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
