import { useReducer, useState } from 'react'
import { USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { RegionMapCard } from './RegionMapCard'
import { DashboardRightPanel } from './DashboardRightPanel'
import { initialSelection, selectionReducer } from '../selection'
import type { OpenRegionDetail } from './RegionPreviewContent'
import { IntegratedPlansSection } from '../integrated-plans/IntegratedPlansSection'
import { getIntegratedPlansMock, type Plan } from '../integrated-plans/data'

type DashboardPanelsProps = {
  period: Period
  onOpenRegionDetail?: OpenRegionDetail
}

/** 지도는 우측 목록/미리보기 전환과 관계없이 같은 위치에서 유지한다. */
export function DashboardPanels({ period, onOpenRegionDetail }: DashboardPanelsProps) {
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showPlanMap, setShowPlanMap] = useState(false)
  const demo = getIntegratedPlansMock(period)
  const activePlan = showPlanMap ? selectedPlan : null
  const planRegions = activePlan
    ? new Map(activePlan.regions.map((region) => [region.regionCode, region]))
    : undefined
  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowPlanMap(true)
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
          planRegions={planRegions}
          onShowVulnerability={() => setShowPlanMap(false)}
          onShowPlan={() => {
            const plan = selectedPlan ?? demo?.plans[0]
            if (plan) selectPlan(plan)
          }}
        />
        <DashboardRightPanel
          period={period}
          selectedRegionCode={selection.regionCode}
          mode={selection.mode}
          onSelectRegion={(regionCode) => dispatch({ type: 'select', regionCode, focusMap: true })}
          onBack={() => dispatch({ type: 'back' })}
          onOpenRegionDetail={onOpenRegionDetail}
          planRegions={planRegions}
          integratedDemo={demo !== null}
        />
      </div>
      {USE_MOCK && (
        <IntegratedPlansSection
          plans={demo?.plans ?? []}
          regions={demo?.dashboard.regions ?? []}
          estimateDays={demo?.estimateDays}
          selectedPlan={selectedPlan}
          onSelect={selectPlan}
        />
      )}
    </div>
  )
}
