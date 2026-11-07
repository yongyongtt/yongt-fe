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
    <div className={cx('rounded-xl px-[26px] pt-[22px] pb-6', className)}>
      <h3 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-gray-90">
        {icon}
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-1.5">
        {lines.map((line) => (
          <li
            key={line}
            className="relative pl-4 text-[15px] leading-6 tracking-[-0.01em] text-gray-70 before:absolute before:top-[9.5px] before:left-0.5 before:size-[5px] before:rounded-full before:bg-gray-50"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
