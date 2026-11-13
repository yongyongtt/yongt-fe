import { useNavigate } from 'react-router'
import { paths } from '@/app/paths'
import { DashboardPanels } from '@/features/main/components/DashboardPanels'
import { MockDataDisclosure } from '@/features/main/components/MockDataDisclosure'
import { SummaryCards } from '@/features/main/components/SummaryCards'
import { useDashboard } from '@/features/main/hooks'
import { getIntegratedPlansMock } from '@/features/main/integrated-plans/data'
import { ApiError } from '@/shared/api/client'
import { USE_MOCK } from '@/shared/api/mock'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { ApiFailureState } from '@/features/main/components/ApiFailureState'
import { PageHero } from '@/shared/components/PageHero'
import { PeriodSelect } from '@/shared/components/PeriodSelect'
import { HomeIcon } from '@/shared/components/icons'
import { DEFAULT_YEAR } from '@/shared/constants/period'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

/** 지도·검색·목록의 선택과 우측 미리보기 상태를 함께 관리한다. */
export function MainPage() {
  const navigate = useNavigate()
  const { period, setPeriod } = usePeriodParams()
  const dashboard = useDashboard(period)
  const periodNotFound =
    dashboard.error instanceof ApiError &&
    ['PERIOD_NOT_FOUND', 'SUITABILITY_NOT_READY'].includes(dashboard.error.code)
  const periodLabel = `${period.year}년 ${period.month === null ? '연간' : `${period.month}월`}`

  return (
    <>
      <PageHero className="min-h-[272px]">
        <nav
          aria-label="현재 위치"
          className="flex animate-fade-up items-center gap-2 pt-9 text-sm tracking-[-0.01em]"
        >
          <HomeIcon className="text-white" />
          <span aria-current="page" className="font-medium text-white">
            메인 대시보드
          </span>
        </nav>
        <div className="flex animate-fade-up flex-col items-start gap-7 pt-7 pb-24 [animation-delay:80ms] xl:flex-row xl:justify-between xl:pb-0">
          <div className="min-w-0">
            <h1 className="text-[30px] leading-[1.3] font-bold tracking-[-0.03em] text-white lg:text-[40px] lg:leading-[48px]">
              용인시 교통 취약지역 현황
            </h1>
            <p className="mt-4 text-base leading-7 text-hero-sub lg:text-lg">
              읍·면·동별 교통 수요와 공급의 불균형을 지도 한 장으로 확인할 수 있습니다.
            </p>
          </div>
          <div className="max-w-full shrink-0 xl:pt-[13px] [&>div]:flex-wrap">
            <PeriodSelect
              period={period}
              onChange={setPeriod}
              months={dashboard.data?.period.availableMonths ?? []}
              years={dashboard.data?.period.availableYears}
              scrollableMonthMenu
            />
            <p className="mt-3 text-sm leading-5 text-hero-sub xl:text-right">
              데이터 기준: {periodLabel}
              {USE_MOCK ? ' · 시연용 데이터' : ''}
              {dashboard.data?.period.updatedAt
                ? ` · 최종 갱신 ${dashboard.data.period.updatedAt}`
                : ''}
            </p>
          </div>
        </div>
      </PageHero>

      <div className="relative container-page -mt-14 flex flex-col gap-6 pb-[72px]">
        <SummaryCards
          summary={dashboard.error ? undefined : dashboard.data?.summary}
          isPending={dashboard.isPending}
        />
        <div className="sr-only" role="status" aria-live="polite">
          {periodLabel} 데이터를{' '}
          {dashboard.isPending
            ? '불러오는 중입니다.'
            : dashboard.error
              ? '불러오지 못했습니다.'
              : '불러왔습니다.'}
        </div>
        {dashboard.error && (
          <Card className="p-6">
            {periodNotFound ? (
              <EmptyState
                title={
                  periodNotFound
                    ? '해당 기간의 데이터가 없습니다.'
                    : '데이터를 불러오지 못했습니다.'
                }
                description={
                  periodNotFound
                    ? '연간 조회로 돌아간 후 제공되는 월을 선택해 주세요.'
                    : '잠시 후 다시 시도해 주세요.'
                }
                action={
                  periodNotFound
                    ? {
                        label: '기본 연간 조회로 돌아가기',
                        onClick: () => setPeriod({ year: DEFAULT_YEAR, month: null }),
                      }
                    : { label: '다시 시도', onClick: () => void dashboard.refetch() }
                }
              />
            ) : (
              <ApiFailureState error={dashboard.error} onRetry={() => void dashboard.refetch()} />
            )}
          </Card>
        )}
        <div className="mt-4">
          <DashboardPanels
            key={`${period.year}-${period.month}`}
            period={period}
            onOpenRegionDetail={(regionCode, selectedPeriod) => {
              void navigate(paths.regionDetail(regionCode, selectedPeriod))
            }}
          />
        </div>
        {USE_MOCK && (
          <MockDataDisclosure integratedDemo={getIntegratedPlansMock(period) !== null} />
        )}
      </div>
    </>
  )
}
