import { cx } from '@/shared/utils/cx'

/** 불러오는 중 자리 표시 회색 막대. 크기·색은 className으로 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx('animate-pulse rounded bg-gray-10', className)} />
}
