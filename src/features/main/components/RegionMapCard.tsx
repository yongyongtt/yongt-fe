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
import { cx } from '@/shared/utils/cx'
import type { Plan, PlanRegion } from '../integrated-plans/data'

type RegionMapCardProps = {
  period: Period
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
  focusRequest?: MapFocusRequest | null
  integratedDemo?: boolean
  activePlan?: Plan['summary']
  planRegions?: ReadonlyMap<string, PlanRegion>
  onShowVulnerability?: () => void
  onShowPlan?: () => void
}

export function RegionMapCard({
  period,
  selectedRegionCode,
  onSelectRegion,
  focusRequest,
  integratedDemo = false,
  activePlan,
  planRegions,
  onShowVulnerability,
  onShowPlan,
}: RegionMapCardProps) {
  const useRealBoundaries = !USE_MOCK || integratedDemo
  const boundaries = useMapBoundaries(useRealBoundaries)
  const shapes = useRealBoundaries ? (boundaries.data ?? []) : demoRegionShapes
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
  const modeButton =
    'min-h-9 rounded-md px-3 py-1 text-sm break-keep focus-visible:outline-2 focus-visible:outline-primary-50 aria-pressed:bg-white aria-pressed:font-bold aria-pressed:text-primary-70 disabled:opacity-55'

  return (
    <Card className="flex min-h-[480px] min-w-0 animate-fade-up flex-col [animation-delay:320ms] xl:min-h-[816px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-10 px-7 py-5">
        <h2 className="text-lg font-bold">{activePlan ? '통합 최적안 지도' : '종합 취약도'}</h2>
        {USE_MOCK && onShowPlan && (
          <div
            role="group"
            aria-label="지도 모드"
            className="flex rounded-lg border border-gray-10 bg-gray-5 p-0.5 text-gray-70"
          >
            <button
              type="button"
              className={modeButton}
              aria-pressed={!activePlan}
              onClick={onShowVulnerability}
            >
              종합 취약도
            </button>
            <button
              type="button"
              className={cx(modeButton, 'enabled:hover:text-primary-70')}
              aria-pressed={Boolean(activePlan)}
              disabled={!integratedDemo}
              onClick={onShowPlan}
            >
              통합 최적안
            </button>
          </div>
        )}
        <span className="rounded bg-gray-5 px-2 py-1 text-xs font-medium text-gray-60">
          {useRealBoundaries ? '용인시 행정동 지도' : '시연용 가상 지도'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-7">
        {activePlan && (
          <p className="text-sm break-keep text-gray-60">
            {activePlan.planId}안 {activePlan.name}의 결과를 투입 수단과 상태별로 표시합니다.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RegionSearch
            key={`${period.year}-${period.month}`}
            regions={mappedRegions}
            disabled={
              map.isPending || Boolean(map.error) || (useRealBoundaries && boundaries.isPending)
            }
            onSelectRegion={(code) => {
              const shape = shapes.find((item) => item.regionCode === code)
              if (!shape) return
              onSelectRegion(code)
              setViewport(focusRegionViewport(shape))
              setPanMode(false)
            }}
          />
          <MethodologyPopover isSchematic={!useRealBoundaries} />
        </div>
        {map.isPending || (useRealBoundaries && boundaries.isPending) ? (
          <div role="status">
            <span className="sr-only">지도 데이터를 불러오는 중입니다.</span>
            <Skeleton className="h-[360px] w-full" />
          </div>
        ) : map.error ? (
          <ApiFailureState error={map.error} onRetry={() => void map.refetch()} />
        ) : useRealBoundaries && boundaries.error ? (
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
              isRealMap={useRealBoundaries}
              planRegions={planRegions}
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
          {!useRealBoundaries && '실제 위치·면적과 무관한 도식입니다. '}손 도구를 켜면
          드래그·방향키로 이동합니다. 지도에 초점을 둔 상태에서 키보드의 Home 키를 누르면 전체
          보기로 돌아갑니다.
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
