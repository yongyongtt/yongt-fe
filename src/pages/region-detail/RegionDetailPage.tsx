import { useParams } from 'react-router'
import { RegionDetailError } from '@/features/region-detail/components/RegionDetailError'
import { RegionHero } from '@/features/region-detail/components/RegionHero'
import { useRegionOverview } from '@/features/region-detail/hooks'
import { Card } from '@/shared/components/Card'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

/*
 동네 진단 상세.
 카드 배치: 유형(전체 폭) / 시 평균 비교 + 미배차율 추이(반반) / AI 해결방안(전체 폭)
*/
export function RegionDetailPage() {
  const { regionCode = '' } = useParams()
  const { period, setPeriod } = usePeriodParams()
  const overview = useRegionOverview(regionCode, period)

  return (
    <>
      <RegionHero
        overview={overview.data}
        isError={overview.isError}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="relative container-page -mt-9 flex flex-col gap-6 pb-[72px]">
        {overview.error ? (
          <Card className="p-9">
            <RegionDetailError
              error={overview.error}
              period={period}
              onPeriodChange={setPeriod}
              onRetry={() => overview.refetch()}
            />
          </Card>
        ) : (
          <>
            {/* TODO(4단계): 카드로 교체 */}
            <Placeholder label="사각지대 유형" className="h-[255px]" />
            <div className="grid grid-cols-2 gap-6">
              <Placeholder label="시 평균과 비교" className="h-[536px]" />
              <Placeholder label="미배차율 추이" className="h-[536px]" />
            </div>
            {/* TODO(5단계) */}
            <Placeholder label="인공지능(AI) 추천 해결방안" className="h-[620px]" />
          </>
        )}
      </div>
    </>
  )
}

function Placeholder({ label, className }: { label: string; className: string }) {
  return (
    <Card className={`p-9 ${className}`}>
      <p className="text-[22px] font-bold text-gray-30">{label}</p>
    </Card>
  )
}
