import {
  apiObject as object,
  apiArray as array,
  apiText as text,
  apiNumber as number,
  apiNullableNumber as nullableNumber,
  invalidApiData as invalid,
} from '@/features/main/validation'
import type { Period } from '@/shared/hooks/usePeriodParams'
import type { Dashboard, DashboardMap, DashboardRegion, RegionPreview } from './types'

export function adaptRegion(value: unknown): DashboardRegion {
  const row = object(value)
  return {
    regionCode: text(row.regionCode),
    regionName: text(row.regionName),
    gu: text(row.gu),
    score: nullableNumber(row.score),
    rank: number(row.rank),
  }
}
export function adaptDashboard(value: unknown): Dashboard {
  const data = object(value),
    period = object(data.period),
    summary = object(data.summary)
  return {
    period: {
      year: number(period.year),
      month: nullableNumber(period.month),
      availableMonths: array(period.availableMonths).map(nullableNumber),
      availableYears:
        period.availableYears == null ? undefined : array(period.availableYears).map(number),
      updatedAt: period.updatedAt == null ? null : text(period.updatedAt),
    },
    summary: {
      totalRegions: number(summary.regionCount),
      vulnerableRegions: number(summary.vulnerableCount),
      averageVulnerabilityScore: nullableNumber(summary.avgScore),
    },
    topRegions: array(data.top10).map(adaptRegion),
  }
}
export function adaptDashboardMap(value: unknown, period: Period): DashboardMap {
  return {
    period: { ...period, availableMonths: [] },
    regions: array(object(value).regions).map(adaptRegion),
  }
}
export function adaptRegionPreview(value: unknown, period: Period): RegionPreview {
  const data = object(value),
    type = data.type == null ? null : object(data.type)
  if (typeof data.isKeep !== 'boolean') invalid()
  return {
    header: adaptRegion(data),
    period: { ...period, availableMonths: [] },
    type: type ? { name: text(type.name), desc: text(type.desc) } : null,
    recommendation: null,
    isKeep: data.isKeep as boolean,
    recommended:
      data.recommended === null
        ? null
        : array(data.recommended).map((value) => {
            const row = object(value)
            return { mode: text(row.mode), name: text(row.name) }
          }),
    summary: data.summary == null ? null : text(data.summary),
  }
}
