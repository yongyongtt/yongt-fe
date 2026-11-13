import selectRegionIcon from '@/assets/main/select-region.svg'
import { USE_MOCK } from '@/shared/api/mock'
import { EmptyState } from '@/shared/components/EmptyState'
import { ApiFailureState } from '@/features/main/components/ApiFailureState'
import { Skeleton } from '@/shared/components/Skeleton'
import { cx } from '@/shared/utils/cx'
import { useDashboard } from '../hooks'
import { getPriorityRegions } from '../preview'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { getPlanRegionStyle, type PlanMapRegion } from '../integrated-plans/data'

type PriorityRankingProps = {
  period: Period
  selectedRegionCode: string | null
  onSelectRegion: (code: string) => void
  planRegions?: ReadonlyMap<string, PlanMapRegion>
}

export function PriorityRanking({
  period,
  selectedRegionCode,
  onSelectRegion,
  planRegions,
}: PriorityRankingProps) {
  const dashboard = useDashboard(period)
  const regions = getPriorityRegions(dashboard.data?.topRegions ?? [])

  return (
    <>
      <div
        className="min-h-0 flex-1 overflow-y-auto lg:flex-auto lg:overflow-visible"
        aria-label="우선 해결 지역 순위"
      >
        {dashboard.isPending ? (
          <div role="status" className="space-y-4 p-6">
            <span className="sr-only">지역 순위를 불러오는 중입니다.</span>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : dashboard.error ? (
          <div className="p-4">
            <ApiFailureState error={dashboard.error} onRetry={() => void dashboard.refetch()} />
          </div>
        ) : regions.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="표시할 지역 순위가 없습니다."
              description="점수가 제공된 지역이 없습니다."
            />
          </div>
        ) : (
          <ol className="divide-y divide-gray-5">
            {regions.map((region, index) => {
              const plan = planRegions
                ? getPlanRegionStyle(planRegions.get(region.regionCode))
                : undefined
              return (
                <li key={region.regionCode} value={region.rank}>
                  <button
                    type="button"
                    data-region-code={region.regionCode}
                    aria-pressed={selectedRegionCode === region.regionCode}
                    aria-label={`${region.regionName} · ${region.gu} · ${region.score}점 · ${region.rank}위${plan ? ` · ${plan.label}` : ''}`}
                    onClick={() => onSelectRegion(region.regionCode)}
                    className="flex min-h-[57px] w-full items-center gap-2 px-4 py-3 text-left outline-none hover:bg-primary-5 focus-visible:bg-primary-5 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-inset sm:gap-3 sm:px-6"
                  >
                    <span
                      className={cx(
                        'flex size-[30px] shrink-0 items-center justify-center rounded-full border text-sm font-bold tabular-nums',
                        region.rank <= 3
                          ? 'border-primary-50 bg-primary-50 text-white'
                          : 'border-gray-20 text-gray-70',
                      )}
                    >
                      {region.rank}
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-x-0.5">
                      <span
                        className={cx(
                          'flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5',
                          plan && 'max-w-24',
                        )}
                      >
                        <span className="font-bold break-keep">{region.regionName}</span>
                        <span className="text-[13px] whitespace-nowrap text-gray-50">
                          {region.gu}
                        </span>
                      </span>
                      {plan && (
                        <span className="grid w-16 shrink-0 place-items-center">
                          <span
                            className={cx(
                              'rounded px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                              plan.badge,
                            )}
                          >
                            {plan.label}
                          </span>
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className={cx(
                        'block h-1.5 max-w-[110px] shrink-0 overflow-hidden rounded-full bg-gray-10',
                        plan ? 'w-[14%] sm:w-[24%]' : 'w-[30%] min-w-9',
                      )}
                    >
                      <span
                        className="block h-full animate-bar-grow rounded-full bg-danger-50 transition-[width] duration-500"
                        style={{
                          width: `${region.score}%`,
                          animationDelay: `${440 + index * 60}ms`,
                        }}
                      />
                    </span>
                    <span
                      className={cx(
                        'min-w-8 shrink-0 text-right text-[17px] font-bold tabular-nums',
                        region.score! >= 60 ? 'text-danger-50' : 'text-gray-90',
                      )}
                    >
                      {region.score}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </div>
      <div className="shrink-0 p-6">
        {USE_MOCK && (
          <p className="mb-3 text-xs leading-5 text-gray-50">
            시연용 목업 중 1~10위 지역만 표시합니다. 현재 제공되는 지역은 {regions.length}개입니다.
          </p>
        )}
        <div className="flex items-start gap-2.5 rounded-lg bg-gray-5 px-4 py-3.5 text-sm leading-[21px] text-gray-60">
          <img src={selectRegionIcon} alt="" aria-hidden className="mt-0.5 shrink-0" />
          <p>지도나 위 목록에서 지역을 선택하면 이 자리에 요약 정보와 AI 미리보기가 표시됩니다.</p>
        </div>
      </div>
    </>
  )
}
