import analysisIcon from '@/assets/main/analysis.svg'
import averageIcon from '@/assets/main/average.svg'
import vulnerableIcon from '@/assets/main/vulnerable.svg'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { cx } from '@/shared/utils/cx'
import type { Dashboard } from '../types'

type SummaryCardsProps = {
  summary?: Dashboard['summary']
  isPending: boolean
}

export function SummaryCards({ summary, isPending }: SummaryCardsProps) {
  const cards = [
    {
      label: '분석 대상 지역',
      value: summary?.totalRegions,
      unit: '개 읍·면·동',
      icon: analysisIcon,
      iconClassName: 'bg-primary-5',
      valueClassName: 'text-gray-90',
    },
    {
      label: '교통 취약지역',
      value: summary?.vulnerableRegions,
      unit: '개',
      icon: vulnerableIcon,
      iconClassName: 'bg-danger-5',
      valueClassName: 'text-danger-50',
    },
    {
      label: '평균 종합 취약도',
      value: summary?.averageVulnerabilityScore,
      unit: '점',
      icon: averageIcon,
      iconClassName: 'bg-gray-5',
      valueClassName: 'text-gray-90',
    },
  ]

  return (
    <div
      aria-label="교통 취약지역 주요 지표"
      aria-busy={isPending}
      className="grid gap-6 lg:grid-cols-3"
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          className="flex min-h-[143px] items-center gap-[18px] px-7 py-7 shadow-lg shadow-primary-70/5"
        >
          <div
            className={cx(
              'flex size-14 shrink-0 items-center justify-center rounded-[14px]',
              card.iconClassName,
            )}
          >
            <img src={card.icon} alt="" aria-hidden />
          </div>
          <dl className="min-w-0">
            <dt className="text-[15px] font-medium tracking-[-0.01em] text-gray-60">
              {card.label}
            </dt>
            <dd className={cx('mt-1 flex flex-wrap items-baseline gap-1.5', card.valueClassName)}>
              {isPending ? (
                <>
                  <span className="sr-only">불러오는 중</span>
                  <Skeleton className="h-10 w-24" />
                </>
              ) : card.value == null ? (
                <span className="py-2 text-base text-gray-50">데이터 없음</span>
              ) : (
                <>
                  <span className="text-[34px] leading-[44px] font-bold tracking-[-0.02em] tabular-nums">
                    {card.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-lg font-medium">{card.unit}</span>
                </>
              )}
            </dd>
          </dl>
        </Card>
      ))}
    </div>
  )
}
