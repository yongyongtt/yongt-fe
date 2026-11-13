import { USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import fixture from './integrated-plans.mock.json'

type MockPlan = (typeof fixture.plans)[number]
export type PlanMode = keyof MockPlan['summary']['modeCounts']
export type PlanMapRegion = {
  regionCode: string
  categoryName?: string
  status: 'INCLUDED' | 'OVER_BUDGET' | 'KEEP' | 'INELIGIBLE'
  mode: PlanMode | null
}
export type PlanRegion = PlanMapRegion & {
  estimatedCost: number | null
  rank: number | null
  inclusionOrder: number | null
  excludeReason?: string | null
  vehicleCount?: number | null
  action?: string
  regionName?: string
  gu?: string
  score?: number | null
  budgetLeftAtSkip?: number
}
export type Plan = {
  summary: Omit<MockPlan['summary'], 'modeCounts'> & {
    sortBasis?: string
    budgetLeft?: number
    estimateDays?: number
    skippedCount?: number
  }
  regions: PlanRegion[]
}
export type IntegratedPlans = {
  plans: Plan[]
  mapByPlan: ReadonlyMap<number, PlanMapRegion[]>
  estimateDays?: number
}

export function getIncludedPlanRegions(plan: Plan) {
  return plan.regions
    .filter(
      (region): region is PlanRegion & { inclusionOrder: number } =>
        region.status === 'INCLUDED' && region.inclusionOrder !== null,
    )
    .toSorted((a, b) => a.inclusionOrder - b.inclusionOrder)
}

// TypeScript widens string literals imported from JSON.
const mockData = USE_MOCK ? (fixture as typeof fixture & { plans: Plan[] }) : null

export function getIntegratedPlansMock({ year, month }: Period) {
  return mockData && year === mockData.period.year && month === mockData.period.month
    ? mockData
    : null
}

export const integratedPlansMockMonth = mockData?.period.month

export const planModes = ['ROUTE_BUS', 'DRT', 'HAPPY_TAXI'] as const satisfies readonly PlanMode[]
export const planLegendKeys = [...planModes, 'KEEP', 'OVER_BUDGET', 'INELIGIBLE'] as const

function transportModeStyle(label: string, textColor: string, badgeBackground: string) {
  return {
    label,
    fill: `fill-current ${textColor}`,
    badge: `${badgeBackground} ${textColor}`,
    swatch: `bg-current ${textColor}`,
    text: 'fill-white',
  }
}

export const planStyles = {
  ROUTE_BUS: transportModeStyle('노선버스', 'text-green-700', 'bg-green-50'),
  DRT: transportModeStyle('똑버스', 'text-primary-70', 'bg-primary-5'),
  HAPPY_TAXI: transportModeStyle('행복택시', 'text-orange-700', 'bg-orange-50'),
  KEEP: {
    label: '현행 유지',
    fill: 'fill-gray-40',
    badge: 'bg-gray-20 text-gray-90',
    swatch: 'bg-gray-40',
    text: 'fill-gray-90',
  },
  OVER_BUDGET: {
    label: '예산 밖',
    fill: 'fill-gray-20',
    badge: 'bg-gray-10 text-gray-90',
    swatch: 'bg-gray-20',
    text: 'fill-gray-90',
  },
  INELIGIBLE: {
    label: '기타 미포함',
    fill: 'fill-white',
    badge: 'bg-gray-5 text-gray-70',
    swatch: 'border border-gray-50 bg-white',
    text: 'fill-gray-90',
  },
}

export function getPlanRegionStyle(region?: PlanMapRegion) {
  switch (region?.status) {
    case 'INCLUDED':
      return planStyles[planModes.find((mode) => mode === region.mode) ?? 'INELIGIBLE']
    case 'KEEP':
      return planStyles.KEEP
    case 'OVER_BUDGET':
      return planStyles.OVER_BUDGET
    default:
      return planStyles.INELIGIBLE
  }
}
