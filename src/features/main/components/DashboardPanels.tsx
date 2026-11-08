import type { Period } from '@/shared/hooks/usePeriodParams'
import { RegionMapCard } from './RegionMapCard'
import { DashboardRightPanel } from './DashboardRightPanel'
import type { DashboardSelection, MapFocusRequest } from '../selection'
import type { OpenRegionDetail } from './RegionPreviewContent'

type DashboardPanelsProps = {
  period: Period
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
  mode: DashboardSelection['mode']
  onBack: () => void
  focusRequest: MapFocusRequest | null
  onOpenRegionDetail?: OpenRegionDetail
}

/** 지도는 우측 목록/미리보기 전환과 관계없이 같은 위치에서 유지한다. */
export function DashboardPanels({
  period,
  selectedRegionCode,
  onSelectRegion,
  mode,
  onBack,
  focusRequest,
  onOpenRegionDetail,
}: DashboardPanelsProps) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1000fr)_minmax(0,416fr)]">
      <RegionMapCard
        period={period}
        selectedRegionCode={selectedRegionCode}
        onSelectRegion={onSelectRegion}
        focusRequest={focusRequest}
      />
      <DashboardRightPanel
        period={period}
        selectedRegionCode={selectedRegionCode}
        mode={mode}
        onSelectRegion={onSelectRegion}
        onBack={onBack}
        onOpenRegionDetail={onOpenRegionDetail}
      />
    </div>
  )
}
