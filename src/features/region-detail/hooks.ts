import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Period } from '@/shared/hooks/usePeriodParams'
import {
  fetchPlanMap,
  fetchRecommendation,
  fetchRegionComparison,
  fetchRegionOverview,
  fetchUnmatchedTrend,
} from './api'
import { plansByMode } from './utils/recommendation'

export const regionDetailKeys = {
  all: (regionCode: string) => ['region-detail', regionCode] as const,
  overview: (regionCode: string, period: Period) =>
    [...regionDetailKeys.all(regionCode), 'overview', period] as const,
  comparison: (regionCode: string, period: Period) =>
    [...regionDetailKeys.all(regionCode), 'comparison', period] as const,
  trend: (regionCode: string, year: number) =>
    [...regionDetailKeys.all(regionCode), 'trend', year] as const,
  recommendation: (regionCode: string, period: Period) =>
    [...regionDetailKeys.all(regionCode), 'recommendation', period] as const,
  /** 지역과 상관없는 응답이라 지역 키 밖에 둠 */
  planMap: (period: Period) => ['region-detail', 'plan-map', period] as const,
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

export function useRecommendation(regionCode: string, period: Period) {
  return useQuery({
    queryKey: regionDetailKeys.recommendation(regionCode, period),
    queryFn: () => fetchRecommendation(regionCode, period),
    placeholderData: keepIfSameRegion(regionCode),
  })
}

/** 이 지역이 들어간 통합 최적안 번호를 수단별로 돌려줌. 실패하면 빈 값 */
export function usePlanInclusion(regionCode: string, period: Period) {
  return useQuery({
    queryKey: regionDetailKeys.planMap(period),
    queryFn: () => fetchPlanMap(period),
    select: (data) => plansByMode(data, regionCode),
    placeholderData: keepPreviousData,
    retry: false,
  })
}
