import {
  apiObject as object,
  apiArray as array,
  apiText as text,
  apiNumber as number,
  apiNullableNumber as nullableNumber,
  invalidApiData as invalid,
} from '@/features/main/validation'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { getMainAvailableMonths, MAIN_AVAILABLE_YEARS } from './period'
import type {
  Dashboard,
  DashboardMap,
  DashboardPeriod,
  DashboardRegion,
  RegionPreview,
} from './types'

/** period.months는 현재 응답의 집계 기간이며, 선택 가능한 월 목록으로 사용하지 않는다. */
export function adaptMainPeriod(value: unknown, requested?: Period): DashboardPeriod {
  const period = object(value)
  const year = number(period.year)
  const months = array(period.months).map(number)
  const responseType = period.type
  if (
    !Number.isInteger(year) ||
    year <= 0 ||
    !months.length ||
    new Set(months).size !== months.length ||
    months.some((month) => !Number.isInteger(month) || month < 1 || month > 12) ||
    typeof responseType !== 'string' ||
    !['YEAR_ALL', 'YEAR_LATEST', 'MONTH'].includes(responseType) ||
    (responseType !== 'YEAR_ALL' && months.length !== 1)
  )
    invalid()
  const month = responseType === 'MONTH' ? months[0] : null
  if (requested && (year !== requested.year || month !== requested.month)) invalid()
  return {
    year,
    month,
    months,
    responseType: responseType as DashboardPeriod['responseType'],
    availableMonths: [],
  }
}

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
export function adaptDashboard(value: unknown, requested?: Period): Dashboard {
  const data = object(value),
    summary = object(data.summary)
  const period = adaptMainPeriod(data.period, requested)
  return {
    period: {
      ...period,
      availableMonths: getMainAvailableMonths(period.year),
      availableYears: MAIN_AVAILABLE_YEARS,
      updatedAt: data.updatedAt == null ? null : text(data.updatedAt),
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
  const data = object(value)
  return {
    period: adaptMainPeriod(data.period, period),
    regions: array(data.regions).map(adaptRegion),
  }
}
export function adaptRegionPreview(value: unknown, period: Period): RegionPreview {
  const data = object(value),
    type = data.type == null ? null : object(data.type)
  if (typeof data.isKeep !== 'boolean') invalid()
  return {
    header: adaptRegion(data),
    period: adaptMainPeriod(data.period, period),
    typePeriod: data.typePeriod == null ? null : adaptMainPeriod(data.typePeriod),
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
