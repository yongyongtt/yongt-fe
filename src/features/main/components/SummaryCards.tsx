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
      unit: '개',
      unitDetail: '읍·면·동',
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
      className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6"
    >
      {cards.map((card, index) => (
        <Card
          key={card.label}
          className={cx(
            'flex min-h-20 min-w-0 animate-fade-up items-center gap-1.5 px-1.5 py-3 shadow-lg shadow-primary-70/5 sm:gap-3 sm:px-3 lg:min-h-[143px] lg:gap-[18px] lg:px-7 lg:py-7',
            ['[animation-delay:160ms]', '[animation-delay:220ms]', '[animation-delay:280ms]'][
              index
            ],
          )}
        >
          <div
            className={cx(
              'flex size-6 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-[10px] lg:size-14 lg:rounded-[14px]',
              card.iconClassName,
            )}
          >
            <img src={card.icon} alt="" aria-hidden className="size-3.5 sm:size-5 lg:size-auto" />
          </div>
          <dl className="min-w-0">
            <dt className="text-[11px] leading-tight font-medium tracking-[-0.01em] break-keep text-gray-60 sm:text-xs lg:text-[15px]">
              {card.label}
            </dt>
            <dd
              className={cx(
                'mt-1 flex flex-wrap items-baseline gap-x-0.5 gap-y-0 sm:gap-x-1 lg:gap-1.5',
                card.valueClassName,
              )}
            >
              {isPending ? (
                <>
                  <span className="sr-only">불러오는 중</span>
                  <Skeleton className="h-6 w-8 max-w-full sm:w-12 lg:h-10 lg:w-24" />
                </>
              ) : card.value == null ? (
                <span className="text-xs text-gray-60 lg:py-2 lg:text-base">데이터 없음</span>
              ) : (
                <>
                  <span className="text-base leading-6 font-bold tracking-[-0.02em] tabular-nums sm:text-xl sm:leading-7 lg:text-[34px] lg:leading-[44px]">
                    {card.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-[11px] font-medium whitespace-nowrap lg:text-lg">
                    {card.unit}
                    {card.unitDetail && (
                      <span className="sr-only sm:not-sr-only"> {card.unitDetail}</span>
                    )}
                  </span>
                </>
              )}
            </dd>
          </dl>
        </Card>
      ))}
    </div>
  )
}
