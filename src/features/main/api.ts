import { apiGet } from '@/shared/api/client'
import { USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { mockGetDashboard, mockGetDashboardMap, mockGetRegionPreview } from './mocks'
import type { Dashboard, DashboardMap, RegionPreview } from './types'

export function fetchDashboard({ year, month }: Period) {
  if (USE_MOCK) return mockGetDashboard({ year, month })
  return apiGet<Dashboard>('/dashboard', { year, month })
}

export function fetchDashboardMap({ year, month }: Period) {
  if (USE_MOCK) return mockGetDashboardMap({ year, month })
  return apiGet<DashboardMap>('/dashboard/map', { year, month })
}

export function fetchRegionPreview(regionCode: string, { year, month }: Period) {
  if (USE_MOCK) return mockGetRegionPreview(regionCode, { year, month })
  return apiGet<RegionPreview>(`/regions/${encodeURIComponent(regionCode)}/preview`, {
    year,
    month,
  })
}
