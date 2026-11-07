import { useQuery } from '@tanstack/react-query'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { fetchDashboard, fetchDashboardMap, fetchRegionPreview } from './api'

export const mainKeys = {
  all: ['main'] as const,
  dashboard: (period: Period) => [...mainKeys.all, 'dashboard', period] as const,
  map: (period: Period) => [...mainKeys.all, 'map', period] as const,
  preview: (regionCode: string | null, period: Period) =>
    [...mainKeys.all, 'preview', regionCode, period] as const,
}

export function useDashboard(period: Period) {
  return useQuery({
    queryKey: mainKeys.dashboard(period),
    queryFn: () => fetchDashboard(period),
  })
}

export function useDashboardMap(period: Period) {
  return useQuery({
    queryKey: mainKeys.map(period),
    queryFn: () => fetchDashboardMap(period),
  })
}

export function useRegionPreview(regionCode: string | null, period: Period) {
  return useQuery({
    queryKey: mainKeys.preview(regionCode, period),
    enabled: Boolean(regionCode),
    queryFn: () => {
      if (!regionCode) throw new Error('미리보기를 조회할 지역을 선택해 주세요.')
      return fetchRegionPreview(regionCode, period)
    },
  })
}
