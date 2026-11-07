import { Link, useNavigate } from 'react-router'
import { paths } from '@/app/paths'
import { HeroChip } from '@/shared/components/HeroChip'
import { ChevronLeftIcon, HomeIcon } from '@/shared/components/icons'
import { PageHero } from '@/shared/components/PageHero'
import { PeriodSelect } from '@/shared/components/PeriodSelect'
import { Skeleton } from '@/shared/components/Skeleton'
import type { Period } from '@/shared/hooks/usePeriodParams'
import type { RegionOverview } from '../types'

type RegionHeroProps = {
  /** 없으면 이름 자리에 로딩 막대 (에러면 빈칸) */
  overview?: RegionOverview
  isError?: boolean
  period: Period
  onPeriodChange: (next: Period) => void
}

export function RegionHero({ overview, isError, period, onPeriodChange }: RegionHeroProps) {
  const navigate = useNavigate()
  const header = overview?.header

  return (
    <PageHero className="h-[217px]">
      <nav
        aria-label="현재 위치"
        className="flex items-center gap-2 pt-9 text-sm tracking-[-0.01em]"
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

      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            aria-label="메인 대시보드로 돌아가기"
            onClick={() => navigate(paths.main(period))}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white hover:bg-white/20"
          >
            <ChevronLeftIcon />
          </button>

          {header ? (
            <>
              <title>{`${header.regionName} · 용인 교통 사각지대 진단`}</title>
              <h1 className="ml-4 text-[44px] leading-[53px] font-bold tracking-[-0.03em] text-white">
                {header.regionName}
              </h1>
              <div className="ml-[23px] flex gap-2">
                <HeroChip>{header.gu}</HeroChip>
                <HeroChip variant="danger">종합 취약도 {header.score}점</HeroChip>
                <HeroChip variant="light">우선순위 {header.rank}위</HeroChip>
              </div>
            </>
          ) : (
            // 제목 줄 높이(53px)를 맞춰서 데이터가 와도 옆 요소가 움직이지 않게 함
            <div className="ml-4 flex h-[53px] items-center">
              {!isError && <Skeleton className="h-11 w-[360px] bg-white/15" />}
            </div>
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
