import type { Period } from '@/shared/hooks/usePeriodParams'
import { adaptMainPeriod } from '../adapters'
import {
  apiArray as array,
  apiNullableNumber as nullableNumber,
  apiNumber as number,
  apiObject as object,
  apiText as text,
  invalidApiData as invalid,
} from '../validation'
import { planModes, type IntegratedPlans, type PlanMapRegion, type PlanRegion } from './data'

function mode(value: unknown) {
  const normalized = value === 'BUS' ? 'ROUTE_BUS' : value
  return planModes.find((candidate) => candidate === normalized) ?? invalid()
}

function adaptRegion(value: unknown, included: boolean): PlanRegion {
  const row = object(value)
  return {
    regionCode: text(row.regionCode),
    regionName: text(row.regionName),
    gu: text(row.gu),
    score: nullableNumber(row.score),
    status: included ? 'INCLUDED' : 'OVER_BUDGET',
    mode: mode(row.mode),
    estimatedCost: number(row.cost),
    rank: number(row.rank),
    inclusionOrder: included ? number(row.order) : null,
    action: text(row.action),
    budgetLeftAtSkip: included ? undefined : number(row.budgetLeftAtSkip),
  }
}

function adaptMapRegion(value: unknown): PlanMapRegion {
  const row = object(value)
  const regionCode = text(row.regionCode)
  switch (row.category) {
    case 'SKIPPED':
      return { regionCode, status: 'OVER_BUDGET', mode: null }
    case 'KEEP':
      return { regionCode, status: 'KEEP', mode: null }
    case 'NONE':
      return { regionCode, status: 'INELIGIBLE', mode: null }
    default:
      return { regionCode, status: 'INCLUDED', mode: mode(row.category) }
  }
}

export function adaptIntegratedPlans(
  plansResponse: unknown,
  mapResponse: unknown,
  requested: Period,
): IntegratedPlans {
  const planData = object(plansResponse)
  const mapData = object(mapResponse)
  const period = adaptMainPeriod(planData.period, requested)
  const mapPeriod = adaptMainPeriod(mapData.period, requested)
  if (
    period.responseType !== mapPeriod.responseType ||
    String(period.months?.toSorted()) !== String(mapPeriod.months?.toSorted())
  )
    invalid()

  const rows = array(planData.plans).map(object)
  const plans = rows
    .map((plan) => ({
      summary: {
        planId: number(plan.plan),
        name: text(plan.name),
        description: text(plan.desc),
        sortBasis: text(plan.sortBasis),
        budget: number(plan.budget),
        totalCost: number(plan.totalCost),
        budgetLeft: number(plan.budgetLeft),
        includedRegionCount: number(plan.includedCount),
        includedSeniorPopulation: number(plan.pop65Total),
      },
      regions: [
        ...array(plan.regions).map((row) => adaptRegion(row, true)),
        ...array(plan.skipped).map((row) => adaptRegion(row, false)),
      ],
    }))
    .toSorted((a, b) => a.summary.planId - b.summary.planId)
  const mapRows = array(mapData.plans).map(object)
  const mapByPlan = new Map(
    mapRows.map((plan) => [number(plan.plan), array(plan.regions).map(adaptMapRegion)]),
  )
  if (
    mapRows.length !== mapByPlan.size ||
    plans.length !== mapByPlan.size ||
    new Set(plans.map(({ summary }) => summary.planId)).size !== plans.length ||
    plans.some(({ summary }) => !mapByPlan.get(summary.planId)?.length)
  )
    invalid()

  return { plans, mapByPlan, estimateDays: rows.length ? number(rows[0].days) : undefined }
}
