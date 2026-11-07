import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Card } from '@/shared/components/Card'
import { PageHero } from '@/shared/components/PageHero'
import { PeriodSelect } from '@/shared/components/PeriodSelect'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

/*
 메인 대시보드 (지도)
 - 아래 히어로와 예시 카드는 자리 표시용이라 자유롭게 바꿔도 됨
 */
export function MainPage() {
  const { period, setPeriod } = usePeriodParams()

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
          <PeriodSelect period={period} onChange={setPeriod} months={[null, 2]} />
        </div>
      </PageHero>

      <div className="container-page py-10">
        <Card className="p-8">
          <p className="text-lg font-bold">지도 · 우선 해결 지역 순위 영역 (작업 예정)</p>
          <p className="mt-2 text-gray-60">
            상세 페이지 이동 예시:{' '}
            <Link
              to={paths.regionDetail('4146134000', period)}
              className="font-medium text-primary-60 underline"
            >
              원삼면 상세 보기
            </Link>
          </p>
        </Card>
      </div>
    </>
  )
}
