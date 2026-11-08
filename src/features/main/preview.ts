import type { Recommendation } from '@/features/region-detail/types'
import type { DashboardRegion } from './types'
import { getVulnerabilityLevel } from './map/vulnerability'

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
