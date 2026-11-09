import type { Recommendation } from '@/features/region-detail/types'
import type { DashboardPeriod, DashboardRegion } from './types'
import { getVulnerabilityLevel } from './map/vulnerability'

export function formatPreviewPeriod(period: DashboardPeriod | null | undefined): string {
  if (!period) return '정보 없음'
  if (period.responseType === 'YEAR_LATEST') {
    const latestMonth = period.months?.[0]
    return latestMonth == null ? '정보 없음' : `${period.year}년 ${latestMonth}월 (최신)`
  }
  return `${period.year}년 ${period.month === null ? '전체' : `${period.month}월`}`
}

export function getPriorityRegions(regions: DashboardRegion[]) {
  return regions
    .filter(
      (region) =>
        Number.isInteger(region.rank) &&
        region.rank >= 1 &&
        region.rank <= 10 &&
        getVulnerabilityLevel(region.score) !== null,
    )
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10)
}

export function getRecommendedOptions(recommendation: Recommendation) {
  return recommendation.options
    .filter(
      (option) =>
        option.status === 'RECOMMENDED' &&
        (recommendation.isKeep ? option.mode === 'KEEP' : option.mode !== 'KEEP'),
    )
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
}
