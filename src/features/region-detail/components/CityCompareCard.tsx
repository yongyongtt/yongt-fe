import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { cx } from '@/shared/utils/cx'
import { useRegionComparison } from '../hooks'
import type { ComparisonMetric } from '../types'
import { CardError } from './CardError'

/** 두 값 중 큰 쪽이 막대의 70%가 되게 맞춤 (디자인 비율) */
const MAX_BAR = 70

type CityCompareCardProps = {
  regionCode: string
  regionName?: string
  period: Period
  className?: string
}

export function CityCompareCard({
  regionCode,
  regionName,
  period,
  className,
}: CityCompareCardProps) {
  const { data, isPending, isError, refetch } = useRegionComparison(regionCode, period)

  return (
    <Card className={cx('min-h-[536px] px-8 pt-7 pb-8', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-gray-90">시 평균과 비교</h2>
        <div className="flex items-center gap-4 text-sm text-gray-60">
          <Legend className="bg-primary-50" label={regionName ?? '이 지역'} />
          <Legend className="bg-gray-30" label="용인시 평균" />
        </div>
      </div>

      {isPending ? (
        <div className="mt-6 flex flex-col gap-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-2/3 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <CardError onRetry={() => refetch()} />
      ) : (
        <ul className="mt-[22px]">
          {data.metrics.map((m, i) => (
            <MetricRow key={m.key} metric={m} delay={i * 80} />
          ))}
        </ul>
      )}
    </Card>
  )
}

function MetricRow({ metric, delay }: { metric: ComparisonMetric; delay: number }) {
  const { label, unit, region, cityAvg } = metric
  const max = Math.max(region, cityAvg ?? 0) || 1
  const width = (v: number) => `${(v / max) * MAX_BAR}%`
  const fmt = (v: number) => `${v.toLocaleString('ko-KR')}${unit}`

  return (
    <li className="border-b border-gray-5 py-4 last:border-b-0">
      <div className="flex items-baseline justify-between">
        <p className="text-base font-bold tracking-[-0.01em] text-gray-90">{label}</p>
        <p className="flex items-baseline gap-1">
          <span className="text-lg font-bold tracking-[-0.01em] text-gray-90">{fmt(region)}</span>
          <span className="text-[15px] text-gray-60">
            / {cityAvg === null ? '평균 정보 없음' : `평균 ${fmt(cityAvg)}`}
          </span>
        </p>
      </div>
      <div className="mt-[18px] flex flex-col gap-1.5">
        <Bar width={width(region)} className="bg-primary-50" delay={delay} />
        {cityAvg !== null && (
          <Bar width={width(cityAvg)} className="bg-gray-30" delay={delay + 60} />
        )}
      </div>
    </li>
  )
}

function Bar({ width, className, delay }: { width: string; className: string; delay: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-gray-5">
      <div
        className={cx(
          'h-full animate-bar-grow rounded-full transition-[width] duration-500',
          className,
        )}
        style={{ width, animationDelay: `${300 + delay}ms` }}
      />
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cx('size-3 rounded-[3px]', className)} />
      {label}
    </span>
  )
}
