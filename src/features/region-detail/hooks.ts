import { useQuery } from '@tanstack/react-query'
import type { Period } from '@/shared/hooks/usePeriodParams'
import {
  fetchRecommendation,
  fetchRegionComparison,
  fetchRegionOverview,
  fetchUnmatchedTrend,
} from './api'

export const regionDetailKeys = {
  all: (regionCode: string) => ['region-detail', regionCode] as const,
  overview: (regionCode: string, period: Period) =>
    [...regionDetailKeys.all(regionCode), 'overview', period] as const,
  comparison: (regionCode: string, period: Period) =>
    [...regionDetailKeys.all(regionCode), 'comparison', period] as const,
  trend: (regionCode: string, year: number) =>
    [...regionDetailKeys.all(regionCode), 'trend', year] as const,
  recommendation: (regionCode: string, year: number) =>
    [...regionDetailKeys.all(regionCode), 'recommendation', year] as const,
}

/** 같은 지역에서 기간만 바꿀 때는 이전 값을 보여 줘서 화면이 깜빡이지 않게 함 */
function keepIfSameRegion<T>(regionCode: string) {
  return (prev: T | undefined, prevQuery?: { queryKey: readonly unknown[] }) =>
    prevQuery?.queryKey[1] === regionCode ? prev : undefined
}

export function useRegionOverview(regionCode: string, period: Period) {
  return useQuery({
    queryKey: regionDetailKeys.overview(regionCode, period),
    queryFn: () => fetchRegionOverview(regionCode, period),
    placeholderData: keepIfSameRegion(regionCode),
  })
}

export function useRegionComparison(regionCode: string, period: Period) {
  return useQuery({
    queryKey: regionDetailKeys.comparison(regionCode, period),
    queryFn: () => fetchRegionComparison(regionCode, period),
    placeholderData: keepIfSameRegion(regionCode),
  })
}

export function useUnmatchedTrend(regionCode: string, year: number) {
  return useQuery({
    queryKey: regionDetailKeys.trend(regionCode, year),
    queryFn: () => fetchUnmatchedTrend(regionCode, year),
    placeholderData: keepIfSameRegion(regionCode),
  })
}

export function useRecommendation(regionCode: string, year: number) {
  return useQuery({
    queryKey: regionDetailKeys.recommendation(regionCode, year),
    queryFn: () => fetchRecommendation(regionCode, year),
    placeholderData: keepIfSameRegion(regionCode),
  })
}
