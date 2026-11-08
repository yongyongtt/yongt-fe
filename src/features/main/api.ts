import { apiGet } from '@/shared/api/client'
import { USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { mockGetDashboard, mockGetDashboardMap, mockGetRegionPreview } from './mocks'
import { adaptDashboard, adaptDashboardMap, adaptRegionPreview } from './adapters'

export async function fetchDashboard({ year, month }: Period) {
  if (USE_MOCK) return mockGetDashboard({ year, month })
  return adaptDashboard(await apiGet<unknown>('/dashboard', { year, month }))
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
