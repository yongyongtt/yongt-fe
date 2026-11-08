import { Link, useNavigate } from 'react-router'
import { paths } from '@/app/paths'
import { HeroChip } from '@/shared/components/HeroChip'
import { ChevronLeftIcon, HomeIcon } from '@/shared/components/icons'
import { PageHero } from '@/shared/components/PageHero'
import { PeriodSelect } from '@/shared/components/PeriodSelect'
import type { Period } from '@/shared/hooks/usePeriodParams'
import type { RegionOverview } from '../types'

type RegionHeroProps = {
  /** 없으면(불러오는 중·에러) 이름 자리를 비워 둠 */
  overview?: RegionOverview
  period: Period
  onPeriodChange: (next: Period) => void
}

export function RegionHero({ overview, period, onPeriodChange }: RegionHeroProps) {
  const navigate = useNavigate()
  const header = overview?.header

  return (
    <PageHero className="pb-[60px] lg:h-[217px] lg:pb-0">
      <nav
        aria-label="현재 위치"
        className="flex animate-fade-up items-center gap-2 pt-5 text-[13px] tracking-[-0.01em] lg:pt-9 lg:text-sm"
      >
        <HomeIcon className="text-white" />
        <Link to={paths.main(period)} className="text-hero-sub hover:text-white">
          메인 대시보드
        </Link>
        <span aria-hidden className="size-1 rounded-full bg-hero-dot" />
        <span aria-current="page" className="font-medium text-white">
          동네 진단 상세
        </span>
      </nav>

      <div className="mt-4 flex animate-fade-up flex-col gap-4 [animation-delay:80ms] lg:mt-7 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-0">
          <button
            type="button"
            aria-label="메인 대시보드로 돌아가기"
            onClick={() => navigate(paths.main(period))}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white hover:bg-white/20 lg:size-12"
          >
            <ChevronLeftIcon />
          </button>

          {header ? (
            <>
              <title>{`${header.regionName} · 용인 교통 사각지대 진단`}</title>
              {/* 데이터가 늦게 와도 이름·칩이 부드럽게 나타나게 함 */}
              <h1 className="animate-fade-in text-[28px] leading-[34px] font-bold tracking-[-0.03em] text-white lg:ml-4 lg:text-[44px] lg:leading-[53px]">
                {header.regionName}
              </h1>
              {/* 모바일은 칩이 이름 아래 줄로 내려감 */}
              <div className="flex basis-full animate-fade-in flex-wrap gap-1.5 [animation-delay:120ms] lg:ml-[23px] lg:basis-auto lg:flex-nowrap lg:gap-2">
                <HeroChip>{header.gu}</HeroChip>
                <HeroChip variant="danger">종합 취약도 {header.score}점</HeroChip>
                <HeroChip variant="light">우선순위 {header.rank}위</HeroChip>
              </div>
            </>
          ) : (
            // 제목 줄 높이만 잡아 둬서 데이터가 와도 옆 요소가 움직이지 않게 함
            <div className="h-10 lg:h-[53px]" />
          )}
        </div>

        <PeriodSelect
          period={period}
          onChange={onPeriodChange}
          months={overview?.period.availableMonths ?? [period.month]}
        />
      </div>
    </PageHero>
  )
}
