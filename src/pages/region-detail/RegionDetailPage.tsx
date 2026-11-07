import { Link, useNavigate, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { Card } from '@/shared/components/Card'
import { HeroChip } from '@/shared/components/HeroChip'
import { ChevronLeftIcon, HomeIcon } from '@/shared/components/icons'
import { PageHero } from '@/shared/components/PageHero'
import { PeriodSelect } from '@/shared/components/PeriodSelect'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

/**
 동네 진단 상세.
 지금은 틀만 있음.
 */
export function RegionDetailPage() {
  const { regionCode = '' } = useParams()
  const { period, setPeriod } = usePeriodParams()
  const navigate = useNavigate()

  return (
    <>
      <PageHero className="h-[217px]">
        <Link
          to={paths.main(period)}
          aria-label="메인 대시보드로"
          className="absolute top-[39px] text-white/80 hover:text-white"
        >
          <HomeIcon />
        </Link>

        <div className="flex items-center justify-between pt-[81px]">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="뒤로 가기"
              onClick={() => navigate(paths.main(period))}
              className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white hover:bg-white/20"
            >
              <ChevronLeftIcon />
            </button>
            <h1 className="ml-4 text-[44px] leading-[53px] font-bold tracking-[-0.03em] text-white">
              지역 {regionCode}
            </h1>
            <div className="ml-[23px] flex gap-2">
              <HeroChip>구 이름</HeroChip>
              <HeroChip variant="danger">종합 취약도 -점</HeroChip>
              <HeroChip variant="light">우선순위 -위</HeroChip>
            </div>
          </div>
          <PeriodSelect period={period} onChange={setPeriod} months={[null, 2]} />
        </div>
      </PageHero>

      <div className="relative container-page -mt-9 pb-[72px]">
        <Card className="p-9">
          <p className="text-lg font-bold">상세 카드 영역 (다음 단계에서 구현)</p>
        </Card>
      </div>
    </>
  )
}
