import type { Recommendation } from '@/features/region-detail/types'
import type { DashboardPeriod, DashboardRegion } from './types'
import { getVulnerabilityLevel } from './map/vulnerability'

export function getPreviewPeriodNotice(
  score: DashboardPeriod,
  type: DashboardPeriod | null | undefined,
): string | null {
  if (!type) return null
  const months = (period: DashboardPeriod) =>
    period.months ??
    (period.month === null ? Array.from({ length: 12 }, (_, i) => i + 1) : [period.month])
  const scoreMonths = months(score),
    typeMonths = months(type)
  if (
    score.year === type.year &&
    scoreMonths.length === typeMonths.length &&
    scoreMonths.every((month) => typeMonths.includes(month))
  )
    return null
  const latest = type.responseType === 'YEAR_LATEST'
  const month = latest ? type.months?.[0] : type.month
  if (latest && month == null) return null
  const label = `${type.year}년 ${month === null ? '전체' : `${month}월`}`
  return `유형·추천은 ${label}${latest ? ' 최신' : ''} 자료 기준입니다.`
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
