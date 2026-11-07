import { Card } from '@/shared/components/Card'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { RegionMapCard } from './RegionMapCard'

type DashboardPanelsProps = {
  period: Period
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
}

/** 우측 패널은 후속 미리보기 기능에서 선택 지역 코드를 받아 연결한다. */
export function DashboardPanels({
  period,
  selectedRegionCode,
  onSelectRegion,
}: DashboardPanelsProps) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1000fr)_minmax(0,416fr)]">
      <RegionMapCard
        period={period}
        selectedRegionCode={selectedRegionCode}
        onSelectRegion={onSelectRegion}
      />
      <Card className="flex min-h-[400px] min-w-0 flex-col xl:min-h-[816px]">
        <div className="border-b border-gray-10 px-6 pt-6 pb-7">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">우선 해결 지역</h2>
            <span className="rounded-md bg-danger-5 px-2.5 py-1 text-[13px] font-medium text-danger-60">
              TOP 10
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-50">종합 취약도가 높은 순서입니다.</p>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-gray-50">
          지역 순위와 AI 미리보기를 준비하고 있습니다.
        </div>
        <p className="mx-6 mb-6 rounded-lg bg-gray-5 px-4 py-3.5 text-sm leading-[21px] text-gray-50">
          지도나 목록에서 선택한 지역의 요약 정보와 AI 미리보기가 이곳에 표시될 예정입니다.
        </p>
      </Card>
    </div>
  )
}
