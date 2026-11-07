import { useParams } from 'react-router'
import { AiSolutionCard } from '@/features/region-detail/components/ai/AiSolutionCard'
import { CityCompareCard } from '@/features/region-detail/components/CityCompareCard'
import { LowReliabilityBanner } from '@/features/region-detail/components/LowReliabilityBanner'
import { RegionDetailError } from '@/features/region-detail/components/RegionDetailError'
import { RegionHero } from '@/features/region-detail/components/RegionHero'
import { TypeSummaryCard } from '@/features/region-detail/components/TypeSummaryCard'
import { UnmatchedTrendCard } from '@/features/region-detail/components/UnmatchedTrendCard'
import { useRegionOverview } from '@/features/region-detail/hooks'
import { Card } from '@/shared/components/Card'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

/** 백엔드가 low만 주고 note를 비워 보냈을 때 쓰는 문구 */
const DEFAULT_LOW_RELIABILITY_NOTE =
  '이 지역은 택시 호출이 적어 지표 신뢰도가 낮습니다. 결과는 참고용으로만 확인해 주십시오.'

/*
 동네 진단 상세.
 카드 배치: 유형(전체 폭) / 시 평균 비교 + 미배차율 추이(반반) / AI 해결방안(전체 폭)
*/
export function RegionDetailPage() {
  const { regionCode = '' } = useParams()
  const { period, setPeriod } = usePeriodParams()
  const overview = useRegionOverview(regionCode, period)
  const regionName = overview.data?.header.regionName
  const reliability = overview.data?.reliability

  return (
    <>
      <RegionHero overview={overview.data} period={period} onPeriodChange={setPeriod} />

      <div className="relative container-page -mt-9 flex flex-col gap-6 pb-[72px]">
        {overview.error ? (
          <Card className="animate-fade-up p-9 [animation-delay:160ms]">
            <RegionDetailError
              error={overview.error}
              period={period}
              onPeriodChange={setPeriod}
              onRetry={() => overview.refetch()}
            />
          </Card>
        ) : (
          <>
            {/* 카드는 위에서부터 차례로 올라오며 나타남 */}
            <TypeSummaryCard
              type={overview.data?.type}
              period={period}
              className="animate-fade-up [animation-delay:160ms]"
            />
            {reliability?.low && (
              <LowReliabilityBanner
                note={reliability.note ?? DEFAULT_LOW_RELIABILITY_NOTE}
                className="animate-fade-up [animation-delay:200ms]"
              />
            )}
            <div className="grid grid-cols-2 gap-6">
              <CityCompareCard
                regionCode={regionCode}
                regionName={regionName}
                period={period}
                className="animate-fade-up [animation-delay:240ms]"
              />
              <UnmatchedTrendCard
                regionCode={regionCode}
                regionName={regionName}
                year={period.year}
                className="animate-fade-up [animation-delay:300ms]"
              />
            </div>
            <AiSolutionCard
              key={regionCode}
              regionCode={regionCode}
              regionName={regionName}
              year={period.year}
              className="animate-fade-up [animation-delay:380ms]"
            />
          </>
        )}
      </div>
    </>
  )
}
