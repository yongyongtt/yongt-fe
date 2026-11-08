import { useState } from 'react'
import type { MapFocusRequest } from '../selection'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { ApiFailureState } from '@/features/main/components/ApiFailureState'
import { Skeleton } from '@/shared/components/Skeleton'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { useDashboardMap, useMapBoundaries } from '../hooks'
import { USE_MOCK } from '@/shared/api/mock'
import { demoRegionShapes } from '../map/demoRegionShapes'
import {
  focusRegionViewport,
  INITIAL_VIEWPORT,
  revealRegion,
  type MapViewport,
} from '../map/viewport'
import { MockRegionMap } from './MockRegionMap'
import { RegionSearch } from './RegionSearch'
import { MethodologyPopover } from './MethodologyPopover'

type RegionMapCardProps = {
  period: Period
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
  focusRequest?: MapFocusRequest | null
}

export function RegionMapCard({
  period,
  selectedRegionCode,
  onSelectRegion,
  focusRequest,
}: RegionMapCardProps) {
  const boundaries = useMapBoundaries()
  const shapes = USE_MOCK ? demoRegionShapes : (boundaries.data ?? [])
  type Camera = { viewport: MapViewport; panMode: boolean; focusRequest: MapFocusRequest | null }
  const [camera, setCamera] = useState<Camera>({
    viewport: { ...INITIAL_VIEWPORT },
    panMode: false,
    focusRequest: null,
  })
  // 외부 선택 요청은 표시할 지도 상태에 반영하고, 다음 지도 조작 시 저장한다.
  const resolveCamera = (current: Camera): Camera => {
    if (!focusRequest || current.focusRequest === focusRequest) return current
    const shape = shapes.find((item) => item.regionCode === focusRequest.regionCode)
    return shape ? { viewport: focusRegionViewport(shape), panMode: false, focusRequest } : current
  }
  const { viewport, panMode } = resolveCamera(camera)
  const setViewport = (next: MapViewport | ((current: MapViewport) => MapViewport)) =>
    setCamera((current) => {
      const resolved = resolveCamera(current)
      return { ...resolved, viewport: typeof next === 'function' ? next(resolved.viewport) : next }
    })
  const setPanMode = (next: boolean | ((current: boolean) => boolean)) =>
    setCamera((current) => {
      const resolved = resolveCamera(current)
      return { ...resolved, panMode: typeof next === 'function' ? next(resolved.panMode) : next }
    })
  const map = useDashboardMap(period)
  const regions = map.error ? [] : (map.data?.regions ?? [])
  const mappedRegions = regions.filter((region) =>
    shapes.some((shape) => shape.regionCode === region.regionCode),
  )
  const selected = mappedRegions.find((region) => region.regionCode === selectedRegionCode)

  return (
    <Card className="flex min-h-[480px] min-w-0 animate-fade-up flex-col [animation-delay:320ms] xl:min-h-[816px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-10 px-7 py-5">
        <h2 className="text-lg font-bold">종합 취약도</h2>
        <span className="rounded bg-gray-5 px-2 py-1 text-xs font-medium text-gray-60">
          {USE_MOCK ? '시연용 가상 지도' : '용인시 행정동 지도'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RegionSearch
            key={`${period.year}-${period.month}`}
            regions={mappedRegions}
            disabled={map.isPending || Boolean(map.error) || (!USE_MOCK && boundaries.isPending)}
            onSelectRegion={(code) => {
              const shape = shapes.find((item) => item.regionCode === code)
              if (!shape) return
              onSelectRegion(code)
              setViewport(focusRegionViewport(shape))
              setPanMode(false)
            }}
          />
          <MethodologyPopover />
        </div>
        {map.isPending || (!USE_MOCK && boundaries.isPending) ? (
          <div role="status">
            <span className="sr-only">지도 데이터를 불러오는 중입니다.</span>
            <Skeleton className="h-[360px] w-full" />
          </div>
        ) : map.error ? (
          <ApiFailureState error={map.error} onRetry={() => void map.refetch()} />
        ) : !USE_MOCK && boundaries.error ? (
          <ApiFailureState error={boundaries.error} onRetry={() => void boundaries.refetch()} />
        ) : mappedRegions.length === 0 ? (
          <EmptyState
            title="표시할 지역 도형이 없습니다."
            description="선택한 기간에 표시 가능한 지역 데이터 또는 연결된 경계가 없습니다."
          />
        ) : (
          <>
            <MockRegionMap
              regions={regions}
              shapes={shapes}
              isRealMap={!USE_MOCK}
              selectedRegionCode={selected?.regionCode ?? null}
              onSelectRegion={onSelectRegion}
              viewport={viewport}
              onViewportChange={setViewport}
              panMode={panMode}
              onTogglePan={() => setPanMode((value) => !value)}
              onFocusRegion={(code) => {
                const shape = shapes.find((item) => item.regionCode === code)
                if (shape) setViewport((current) => revealRegion(current, shape))
              }}
            />
            {mappedRegions.length < regions.length && (
              <p className="text-sm text-gray-60">
                전체 {regions.length}개 중 경계가 연결된 {mappedRegions.length}개 지역만 표시합니다.
              </p>
            )}
          </>
        )}
        <p className="text-xs leading-5 text-gray-50">
          {USE_MOCK
            ? '실제 위치·면적과 무관한 도식입니다. '
            : '제공된 38개 읍·면·동 경계를 지역 코드로 연결했습니다. '}
          손 도구를 켜면 드래그·방향키로 이동하고, 지도에서 Home 키를 누르면 전체 보기로 돌아갑니다.
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {selected
            ? `선택 지역: ${selected.regionName} · ${selected.gu}`
            : '지도에서 지역을 클릭하거나 Tab으로 이동한 뒤 Enter 또는 Space로 선택하세요.'}
        </p>
      </div>
    </Card>
  )
}
