import { apiGet } from '@/shared/api/client'
import { mockResponse, USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { mockGetDashboard, mockGetDashboardMap, mockGetRegionPreview } from './mocks'
import { adaptDashboard, adaptDashboardMap, adaptRegionPreview } from './adapters'
import { adaptIntegratedPlans } from './integrated-plans/adapters'
import { getIntegratedPlansMock, type IntegratedPlans } from './integrated-plans/data'

export async function fetchIntegratedPlans(period: Period): Promise<IntegratedPlans> {
  if (USE_MOCK) {
    const mock = getIntegratedPlansMock(period)
    const plans: IntegratedPlans['plans'] = mock?.plans ?? []
    return mockResponse({
      plans,
      mapByPlan: new Map(plans.map(({ summary, regions }) => [summary.planId, regions])),
      estimateDays: mock?.estimateDays,
    })
  }
  const { year, month } = period
  const [plans, map] = await Promise.all([
    apiGet<unknown>('/plans', { year, month }),
    apiGet<unknown>('/plans/map', { year, month }),
  ])
  return adaptIntegratedPlans(plans, map, period)
}

export async function fetchDashboard({ year, month }: Period) {
  if (USE_MOCK) return mockGetDashboard({ year, month })
  return adaptDashboard(await apiGet<unknown>('/dashboard', { year, month }), { year, month })
}

export async function fetchDashboardMap({ year, month }: Period) {
  if (USE_MOCK) return mockGetDashboardMap({ year, month })
  return adaptDashboardMap(await apiGet<unknown>('/dashboard/map', { year, month }), {
    year,
    month,
  })
}

export async function fetchRegionPreview(regionCode: string, { year, month }: Period) {
  if (USE_MOCK) return mockGetRegionPreview(regionCode, { year, month })
  return adaptRegionPreview(
    await apiGet<unknown>(`/regions/${encodeURIComponent(regionCode)}/preview`, {
      year,
      month,
    }),
    { year, month },
  )
}
