import { apiGet } from '@/shared/api/client'
import { USE_MOCK_REGION_DETAIL as USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import {
  mockGetComparison,
  mockGetOverview,
  mockGetRecommendation,
  mockGetUnmatchedTrend,
} from './mocks'
import type { Recommendation, RegionComparison, RegionOverview, UnmatchedTrend } from './types'

/** API 4. 헤더·유형·신뢰도 (month는 헤더 점수·순위에만 영향) */
export function fetchRegionOverview(regionCode: string, { year, month }: Period) {
  if (USE_MOCK) return mockGetOverview(regionCode, { year, month })
  return apiGet<RegionOverview>(`/regions/${regionCode}`, { year, month })
}

/** API 5. 시 평균 비교 */
export function fetchRegionComparison(regionCode: string, { year, month }: Period) {
  if (USE_MOCK) return mockGetComparison(regionCode, { year, month })
  return apiGet<RegionComparison>(`/regions/${regionCode}/comparison`, { year, month })
}

/** API 6. 미배차율 추이 (연도만) */
export function fetchUnmatchedTrend(regionCode: string, year: number) {
  if (USE_MOCK) return mockGetUnmatchedTrend(regionCode, year)
  return apiGet<UnmatchedTrend>(`/regions/${regionCode}/unmatched-trend`, { year })
}

/** API 7. AI 추천 해결방안 (연도만) */
export function fetchRecommendation(regionCode: string, year: number) {
  if (USE_MOCK) return mockGetRecommendation(regionCode, year)
  return apiGet<Recommendation>(`/regions/${regionCode}/recommendation`, { year })
}
