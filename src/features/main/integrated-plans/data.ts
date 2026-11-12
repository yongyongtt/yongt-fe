import { USE_MOCK } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import fixture from './integrated-plans.mock.json'

export type Plan = (typeof fixture.plans)[number]
export type PlanRegion = Plan['regions'][number]
export type PlanMode = keyof Plan['summary']['modeCounts']

const mockData = USE_MOCK ? fixture : null

export function getIntegratedPlansMock({ year, month }: Period) {
  return mockData && year === mockData.period.year && month === mockData.period.month
    ? mockData
    : null
}

export const integratedPlansMockMonth = mockData?.period.month

export const planModes = ['ROUTE_BUS', 'DRT', 'HAPPY_TAXI'] as const satisfies readonly PlanMode[]
export const planLegendKeys = [...planModes, 'KEEP', 'OVER_BUDGET', 'INELIGIBLE'] as const

export const planStyles = {
  ROUTE_BUS: {
    label: '노선버스',
    fill: 'fill-primary-70',
    badge: 'bg-primary-5 text-primary-70',
    swatch: 'bg-primary-70',
    text: 'fill-white',
  },
  DRT: {
    label: '똑버스',
    fill: 'fill-amber-800',
    badge: 'bg-amber-50 text-amber-800',
    swatch: 'bg-amber-800',
    text: 'fill-white',
  },
  HAPPY_TAXI: {
    label: '행복택시',
    fill: 'fill-teal-800',
    badge: 'bg-teal-50 text-teal-800',
    swatch: 'bg-teal-800',
    text: 'fill-white',
  },
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
    label: '대상 제외',
    fill: 'fill-white',
    badge: 'bg-gray-5 text-gray-70',
    swatch: 'border border-gray-50 bg-white',
    text: 'fill-gray-90',
  },
}

export function getPlanRegionStyle(region?: PlanRegion) {
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
