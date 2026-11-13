import { useReducer, useState } from 'react'
import { ApiError } from '@/shared/api/client'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { RegionMapCard } from './RegionMapCard'
import { DashboardRightPanel } from './DashboardRightPanel'
import { initialSelection, selectionReducer } from '../selection'
import type { OpenRegionDetail } from './RegionPreviewContent'
import { IntegratedPlansSection } from '../integrated-plans/IntegratedPlansSection'
import {
  getIncludedPlanRegions,
  getIntegratedPlansMock,
  getPlanRegionStyle,
  type Plan,
} from '../integrated-plans/data'
import { useDashboardMap, useIntegratedPlans } from '../hooks'
import { ApiFailureState } from './ApiFailureState'

type DashboardPanelsProps = {
  period: Period
  onOpenRegionDetail?: OpenRegionDetail
}

/** 지도는 우측 목록/미리보기 전환과 관계없이 같은 위치에서 유지한다. */
export function DashboardPanels({ period, onOpenRegionDetail }: DashboardPanelsProps) {
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [showPlanMap, setShowPlanMap] = useState(false)
  const demo = getIntegratedPlansMock(period)
  const map = useDashboardMap(period)
  const query = useIntegratedPlans(period)
  const unavailable =
    query.error instanceof ApiError &&
    ['PERIOD_NOT_FOUND', 'SUITABILITY_NOT_READY', 'PLAN_NOT_FOUND', 'EMPTY_DATA'].includes(
      query.error.code,
    )
  const data = query.error ? undefined : query.data
  const selectedPlan = data?.plans.find(({ summary }) => summary.planId === selectedPlanId) ?? null
  const activePlan = showPlanMap ? (selectedPlan ?? data?.plans[0]) : null
  const activeMap = activePlan && data?.mapByPlan.get(activePlan.summary.planId)
  const planRegions = activeMap
    ? new Map(activeMap.map((region) => [region.regionCode, region]))
    : undefined
  const mapRegions = map.error ? [] : (map.data?.regions ?? [])
  const selectedDeployment = activePlan
    ? getIncludedPlanRegions(activePlan).find(
        ({ regionCode }) => regionCode === selection.regionCode,
      )
    : undefined
  const selectedPlanRegion = selection.regionCode
    ? planRegions?.get(selection.regionCode)
    : undefined
  const previewRankLabel = showPlanMap
    ? selectedDeployment
      ? `투입 ${selectedDeployment.inclusionOrder}순위`
      : (selectedPlanRegion?.categoryName ??
        (planRegions ? getPlanRegionStyle(selectedPlanRegion).label : '투입 순위 없음'))
    : undefined
  const selectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.summary.planId)
  }
  const switchMapMode = (nextShowPlanMap: boolean) => {
    if (nextShowPlanMap === showPlanMap) return
    setShowPlanMap(nextShowPlanMap)
    dispatch({ type: 'reset' })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1000fr)_minmax(0,416fr)]">
        <RegionMapCard
          period={period}
          selectedRegionCode={selection.regionCode}
          onSelectRegion={(regionCode) => dispatch({ type: 'select', regionCode, focusMap: false })}
          focusRequest={selection.focusRequest}
          integratedDemo={demo !== null}
          showingPlan={showPlanMap}
          planRegions={planRegions}
          onShowVulnerability={() => switchMapMode(false)}
          onShowPlan={() => switchMapMode(true)}
        />
        <DashboardRightPanel
          period={period}
          selectedRegionCode={selection.regionCode}
          mode={selection.mode}
          onSelectRegion={(regionCode) => dispatch({ type: 'select', regionCode, focusMap: true })}
          onBack={() => dispatch({ type: 'back' })}
          onOpenRegionDetail={onOpenRegionDetail}
          planRegions={planRegions}
          previewRankLabel={previewRankLabel}
          integratedDemo={demo !== null}
        />
      </div>
      {showPlanMap &&
        (query.isPending ? (
          <Card className="space-y-3 p-4 lg:p-7">
            <h2 className="text-2xl font-bold">통합 최적안</h2>
            <span className="sr-only" role="status">
              통합 최적안을 불러오는 중입니다.
            </span>
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : query.error && !unavailable ? (
          <Card className="space-y-3 p-4 lg:p-7">
            <h2 className="text-2xl font-bold">통합 최적안</h2>
            <ApiFailureState error={query.error} onRetry={() => void query.refetch()} />
          </Card>
        ) : (
          <IntegratedPlansSection
            plans={data?.plans ?? []}
            regions={mapRegions}
            estimateDays={data?.estimateDays}
            isMock={USE_MOCK}
            selectedPlan={selectedPlan}
            onSelect={selectPlan}
          />
        ))}
    </div>
  )
}
