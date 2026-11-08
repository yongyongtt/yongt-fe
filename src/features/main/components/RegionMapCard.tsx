import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { useDashboardMap } from '../hooks'
import { demoRegionShapes } from '../map/demoRegionShapes'
import { MockRegionMap } from './MockRegionMap'

type RegionMapCardProps = {
  period: Period
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
}

export function RegionMapCard({ period, selectedRegionCode, onSelectRegion }: RegionMapCardProps) {
  const map = useDashboardMap(period)
  const regions = map.error ? [] : (map.data?.regions ?? [])
  const mappedRegions = regions.filter((region) =>
    demoRegionShapes.some((shape) => shape.regionCode === region.regionCode),
  )
  const selected = mappedRegions.find((region) => region.regionCode === selectedRegionCode)

  return (
    <Card className="flex min-h-[480px] min-w-0 flex-col xl:min-h-[816px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-10 px-7 py-5">
        <h2 className="text-lg font-bold">종합 취약도</h2>
        <span className="rounded bg-gray-5 px-2 py-1 text-xs font-medium text-gray-60">
          시연용 가상 지도
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-7">
        {map.isPending ? (
          <div role="status">
            <span className="sr-only">지도 데이터를 불러오는 중입니다.</span>
            <Skeleton className="h-[360px] w-full" />
          </div>
        ) : map.error ? (
          <EmptyState
            title="지도 데이터를 불러오지 못했습니다."
            description="선택한 기간을 확인하거나 다시 시도해 주세요."
            action={{ label: '지도 다시 불러오기', onClick: () => void map.refetch() }}
          />
        ) : mappedRegions.length === 0 ? (
          <EmptyState
            title="표시할 지역 도형이 없습니다."
            description="선택한 기간에 표시 가능한 지역 데이터 또는 연결된 도형이 없습니다."
          />
        ) : (
          <>
            <MockRegionMap
              regions={regions}
              shapes={demoRegionShapes}
              selectedRegionCode={selected?.regionCode ?? null}
              onSelectRegion={onSelectRegion}
            />
            {mappedRegions.length < regions.length && (
              <p className="text-sm text-gray-60">
                전체 {regions.length}개 중 가상 도형이 연결된 {mappedRegions.length}개 지역만
                표시합니다.
              </p>
            )}
          </>
        )}
        <p className="text-xs leading-5 text-gray-50">
          실제 위치·면적과 무관한 도식입니다. 좁은 화면에서는 좌우로 스크롤하세요.
        </p>
        <p role="status" aria-live="polite" className="mt-auto text-[13px] leading-5 text-gray-60">
          {selected
            ? `선택 지역: ${selected.regionName} · ${selected.gu}`
            : '지도에서 지역을 클릭하거나 Tab으로 이동한 뒤 Enter 또는 Space로 선택하세요.'}
        </p>
      </div>
    </Card>
  )
}
