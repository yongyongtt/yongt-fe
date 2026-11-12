import { Card } from '@/shared/components/Card'
import { cx } from '@/shared/utils/cx'
import type { DashboardRegion } from '../types'
import { getPlanRegionStyle, planModes, planStyles, type Plan, type PlanRegion } from './data'

const numberFormat = new Intl.NumberFormat('ko-KR')
const eokFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

function formatCost(won: number | null) {
  if (won === null) return '—'
  return won >= 10_000_000
    ? `${eokFormat.format(won / 100_000_000)}억 원`
    : `${numberFormat.format(won)}원`
}

function deploymentLabel(region: PlanRegion) {
  const name = region.busType === 'CITY_BUS' ? '시내버스' : getPlanRegionStyle(region).label
  return region.vehicleCount === null ? `${name} 투입` : `${name} ${region.vehicleCount}대 투입`
}

type Props = {
  plans: Plan[]
  regions: DashboardRegion[]
  estimateDays?: number
  selectedPlan: Plan | null
  onSelect: (plan: Plan) => void
}

export function IntegratedPlansSection({
  plans,
  regions,
  estimateDays,
  selectedPlan,
  onSelect,
}: Props) {
  return (
    <Card className="min-w-0 space-y-3 p-4 lg:p-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">통합 최적안</h2>
        {plans[0] && (
          <span className="rounded-md bg-primary-5 px-2.5 py-1 text-xs font-semibold text-primary-70">
            공통 예산 {formatCost(plans[0].summary.budget)} · 예시
          </span>
        )}
      </div>
      {plans.length === 0 ? (
        <p className="text-sm text-gray-60">선택한 기간의 통합 최적안 데이터가 없습니다.</p>
      ) : (
        <>
          <p className="text-sm leading-6 break-keep text-gray-60">
            같은 예산에서 세 가지 투입 순서를 비교합니다. 카드를 선택하면 지도와 TOP 10에 결과가
            표시됩니다.
          </p>
          <div role="group" aria-label="최적안 비교" className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const { summary } = plan
              const selected = selectedPlan === plan
              const metrics = [
                ['포함 지역', `${numberFormat.format(summary.includedRegionCount)}곳`],
                ['2개월 추정 비용', formatCost(summary.totalCost)],
                ['65세 이상 인구', `${numberFormat.format(summary.includedSeniorPopulation)}명`],
              ]
              return (
                <button
                  key={summary.planId}
                  type="button"
                  aria-label={`${summary.planId}안 ${summary.name}`}
                  aria-pressed={selected}
                  onClick={() => onSelect(plan)}
                  className={cx(
                    'flex min-w-0 flex-col gap-2 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2 lg:p-5',
                    selected
                      ? 'border-primary-60 bg-primary-5'
                      : 'border-gray-20 bg-white hover:bg-gray-5',
                  )}
                >
                  <span className="flex w-full flex-wrap items-center justify-between gap-1">
                    <span className="rounded bg-primary-5 px-2 py-0.5 text-xs font-semibold text-primary-70">
                      {summary.planId}안
                    </span>
                    {selected && (
                      <span className="text-xs font-semibold text-primary-70">✓ 선택한 안</span>
                    )}
                  </span>
                  <span className="text-xl font-bold">{summary.name}</span>
                  <span className="text-sm break-keep text-gray-60">{summary.description}</span>
                  <span className="grid w-full grid-cols-3 gap-x-2">
                    {metrics.map(([label, value]) => (
                      <span key={label} className="flex flex-col gap-1">
                        <span className="text-xs break-keep text-gray-60">{label}</span>
                        <span className="font-bold break-keep tabular-nums">{value}</span>
                      </span>
                    ))}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {planModes.map((mode) => (
                      <span
                        key={mode}
                        className={cx(
                          'rounded px-2 py-1 text-xs font-semibold',
                          planStyles[mode].badge,
                        )}
                      >
                        {planStyles[mode].label} {summary.modeCounts[mode]}
                      </span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          {selectedPlan && <PlanOrderTable plan={selectedPlan} regions={regions} />}
          <p className="text-xs leading-5 break-keep text-gray-60">
            2개월({estimateDays}일) 추정 비용을 기준으로 한 우선 투입 순서입니다. 수치와 순위는 화면
            예시입니다.
          </p>
        </>
      )}
    </Card>
  )
}

function PlanOrderTable({ plan, regions }: { plan: Plan; regions: DashboardRegion[] }) {
  const names = new Map(regions.map((region) => [region.regionCode, region.regionName]))
  const included = plan.regions
    .filter((region) => region.status === 'INCLUDED' && region.inclusionOrder !== null)
    .toSorted((a, b) => (a.inclusionOrder ?? 0) - (b.inclusionOrder ?? 0))
  const example = plan.regions.find(
    (region) =>
      region.regionCode === plan.budgetExampleRegionCode &&
      region.status === 'OVER_BUDGET' &&
      region.excludeReason === 'INSUFFICIENT_BUDGET',
  )
  const { planId, name, budget, totalCost } = plan.summary
  const title = `${planId}안 ${name} · 투입 순서`
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <div
        role="region"
        aria-label={title}
        tabIndex={0}
        className="max-w-full overflow-x-auto rounded-lg border border-gray-20 focus-visible:outline-2 focus-visible:outline-primary-50"
      >
        <table className="w-full min-w-[650px] text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-gray-5 text-gray-70">
            <tr>
              {['투입 순서', '지역', '투입안', '수단', '2개월 추정 비용', '후보 순위'].map(
                (label) => (
                  <th key={label} scope="col" className="px-3 py-2.5">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-10">
            {included.map((region) => (
              <tr key={region.regionCode}>
                <td className="px-3 py-2.5 font-semibold text-primary-70 tabular-nums">
                  {region.inclusionOrder}
                </td>
                <th scope="row" className="px-3 py-2.5">
                  {names.get(region.regionCode)}
                </th>
                <td className="px-3 py-2.5">{deploymentLabel(region)}</td>
                <td className="px-3 py-2.5">{getPlanRegionStyle(region).label}</td>
                <td className="px-3 py-2.5 font-semibold tabular-nums">
                  {formatCost(region.estimatedCost)}
                </td>
                <td className="px-3 py-2.5">{region.rank === null ? '—' : `${region.rank}위`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {example && (
        <p className="text-sm leading-6 break-keep text-gray-70">
          <span
            className={cx(
              'mr-2 rounded px-2 py-1 text-xs font-semibold',
              planStyles.OVER_BUDGET.badge,
            )}
          >
            예산 밖
          </span>
          {names.get(example.regionCode)} · 후보 {example.rank}위 · 추정 비용{' '}
          {formatCost(example.estimatedCost)} · 남은 예산 {formatCost(budget - totalCost)}
        </p>
      )}
    </div>
  )
}
