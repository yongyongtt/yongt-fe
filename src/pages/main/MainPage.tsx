import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { useDashboard } from '@/features/main/hooks'
import { MAIN_MOCK_NOTICE } from '@/features/main/mocks'
import { ApiError } from '@/shared/api/client'
import { USE_MOCK } from '@/shared/api/mock'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHero } from '@/shared/components/PageHero'
import { PeriodSelect } from '@/shared/components/PeriodSelect'
import { DEFAULT_YEAR } from '@/shared/constants/period'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

/*
 메인 대시보드 (지도)
 - 아래 히어로와 예시 카드는 자리 표시용이라 자유롭게 바꿔도 됨
 */
export function MainPage() {
  const { period, setPeriod } = usePeriodParams()
  const dashboard = useDashboard(period)
  const periodNotFound =
    dashboard.error instanceof ApiError && dashboard.error.code === 'PERIOD_NOT_FOUND'
  const periodLabel = `${period.year}년 ${period.month === null ? '연간' : `${period.month}월`}`

  return (
    <>
      <PageHero className="h-[236px]">
        <div className="flex items-start justify-between pt-[49px]">
          <div>
            <h1 className="text-[40px] leading-[48px] font-bold tracking-[-0.03em] text-white">
              용인시 교통 취약지역 현황
            </h1>
            <p className="mt-4 text-base text-hero-sub">
              읍·면·동별 교통 수요와 공급의 불균형을 지도 한 장으로 확인할 수 있습니다.
            </p>
          </div>
          <PeriodSelect
            period={period}
            onChange={setPeriod}
            months={dashboard.data?.period.availableMonths ?? []}
          />
        </div>
      </PageHero>

      <div className="container-page py-10">
        <Card className="p-8">
          {dashboard.isPending ? (
            <p role="status" className="text-gray-60">
              {periodLabel} 데이터를 불러오는 중입니다.
            </p>
          ) : dashboard.error ? (
            <EmptyState
              title={
                periodNotFound ? '해당 기간의 데이터가 없습니다.' : '데이터를 불러오지 못했습니다.'
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
            <p role="status" className="text-gray-60">
              {periodLabel} 데이터를 불러왔습니다.
            </p>
          )}
          <p className="text-lg font-bold">지도 · 우선 해결 지역 순위 영역 (작업 예정)</p>
          {!dashboard.error && !dashboard.isPending && (
            <p className="mt-2 text-gray-60">
              상세 페이지 이동 예시:{' '}
              <Link
                to={paths.regionDetail('4146134000', period)}
                className="font-medium text-primary-60 underline"
              >
                원삼면 상세 보기
              </Link>
            </p>
          )}
        </Card>
        {USE_MOCK && <p className="mt-4 text-sm text-gray-60">{MAIN_MOCK_NOTICE}</p>}
      </div>
    </>
  )
}
