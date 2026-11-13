import * as Popover from '@radix-ui/react-popover'
import { useId, useState } from 'react'
import { Card } from '@/shared/components/Card'
import { cx } from '@/shared/utils/cx'
import type { DashboardRegion } from '../types'
import { planModes, planStyles, type Plan, type PlanRegion } from './data'
import comparisonInfo from './comparison-info.svg'
import selectedPlanCheck from './selected-plan-check.svg'
import unitCostInfo from './unit-cost-info.svg'

const decimal = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })
const budgetFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('ko-KR')
const planCopy: Record<number, { title: string; criterion: string; allocation: string }> = {
  1: {
    title: '같은 예산으로 더 많은 주민에게',
    criterion: '효과 ÷ 비용이 높은 순',
    allocation: '효과 ÷ 비용이 높은 순으로 줄 세워 담고, 남은 예산보다 비싼 지역은 건너뜁니다.',
  },
  2: {
    title: '가장 취약한 곳부터',
    criterion: '종합 취약도가 높은 순',
    allocation: '종합 취약도가 높은 순으로 담고, 남은 예산보다 비싼 지역은 건너뜁니다.',
  },
  3: {
    title: '효율과 형평의 절충',
    criterion: '효율·취약도 순위의 평균 순',
    allocation:
      '효율과 취약도 순위의 평균이 앞선 지역부터 담고, 남은 예산보다 비싼 지역은 건너뜁니다.',
  },
}

const hatch =
  'bg-[repeating-linear-gradient(135deg,var(--color-gray-5)_0_5px,var(--color-gray-10)_5px_7px)]'

function formatCost(won: number | null) {
  if (won === null) return '—'
  return won >= 10_000_000 ? `${decimal.format(won / 100_000_000)}억` : `${number.format(won)}원`
}

function formatPopulation(population: number) {
  return population >= 10_000
    ? `${decimal.format(population / 10_000)}만`
    : number.format(population)
}

function transportMode(region: PlanRegion) {
  return (
    planModes.find((mode) => mode === region.mode) ??
    (region.excludeReason === 'DRT_ALREADY_OPERATING' ? 'DRT' : undefined)
  )
}

function regionStatus(region?: PlanRegion) {
  if (region?.excludeReason === 'DRT_ALREADY_OPERATING') return '이미 운영 중'
  if (region?.status === 'OVER_BUDGET') return '예산 밖'
  if (region?.status === 'KEEP') return '현행 유지'
  return '대상 제외'
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
  const activePlan =
    plans.find(({ summary }) => summary.planId === selectedPlan?.summary.planId) ?? plans[0]

  if (!activePlan) {
    return (
      <Card className="space-y-3 p-4 lg:p-7">
        <h2 className="text-2xl font-bold">통합 최적안</h2>
        <p className="text-sm text-gray-60">선택한 기간의 통합 최적안 데이터가 없습니다.</p>
      </Card>
    )
  }

  const regionByCode = new Map(regions.map((region) => [region.regionCode, region]))
  const { budget } = activePlan.summary
  const budgetLabel = `${budgetFormat.format(budget / 100_000_000)}억`

  return (
    <section className="min-w-0 space-y-6 px-0 lg:px-6" aria-labelledby="integrated-plans-title">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="integrated-plans-title"
              className="text-2xl leading-tight font-bold tracking-tight"
            >
              통합 최적안
            </h2>
            <span className="rounded-md bg-primary-5 px-2.5 py-1 text-[13px] font-semibold text-primary-60">
              2개월 예산 {budgetLabel} 원
            </span>
          </div>
          <p className="text-sm break-keep text-gray-60">
            AI가 추천한 수단에 비용을 더해, 예산 안에서 어느 지역부터 넣을지 세 가지 기준으로
            비교합니다.
          </p>
        </div>
        <Popover.Root>
          <Popover.Trigger className="inline-flex items-center gap-2 rounded-md border border-gray-20 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-5 focus-visible:outline-2 focus-visible:outline-primary-50">
            <img src={unitCostInfo} width={16} height={16} alt="" /> 단가 기준
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              aria-label="단가 기준"
              className="z-50 max-w-[min(20rem,calc(100vw-2rem))] space-y-2 rounded-lg border border-gray-20 bg-white p-4 text-sm shadow-lg"
            >
              <p className="font-bold">단가 기준</p>
              <p className="break-keep text-gray-60">
                수단별 공개 단가와 투입 규모를 반영한 2개월
                {estimateDays ? `(${estimateDays}일)` : ''} 추정 비용입니다. 화면의 수치와 순위는
                예시입니다.
              </p>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </header>

      <div role="group" aria-label="최적안 비교" className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const {
            planId,
            name,
            description,
            includedRegionCount,
            totalCost,
            includedSeniorPopulation,
          } = plan.summary
          const selected = activePlan === plan
          const copy = planCopy[planId]
          return (
            <button
              key={planId}
              type="button"
              aria-label={`${planId}안 ${name}`}
              aria-pressed={selected}
              onClick={() => onSelect(plan)}
              className={cx(
                '@container flex min-w-0 flex-col gap-[18px] rounded-xl border bg-white px-3 pt-6 pb-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2 lg:px-5 xl:px-7',
                selected
                  ? 'border-primary-50 bg-linear-to-b from-primary-5 to-white shadow-md ring-1 ring-primary-50'
                  : 'border-gray-10 hover:border-primary-50',
              )}
            >
              <span className="flex w-full items-center gap-2.5">
                <span
                  className={cx(
                    'rounded-md px-2.5 py-1 text-sm leading-4 font-bold whitespace-nowrap',
                    selected ? 'bg-primary-50 text-white' : 'bg-primary-5 text-primary-60',
                  )}
                >
                  {planId}안
                </span>
                <span className="text-lg leading-6 font-bold">{name}</span>
                <span
                  aria-hidden
                  className={cx(
                    'ml-auto grid size-6 shrink-0 place-items-center rounded-full',
                    selected ? 'bg-primary-50' : 'border-2 border-gray-20',
                  )}
                >
                  {selected && <img src={selectedPlanCheck} width={14} height={14} alt="" />}
                </span>
              </span>
              <span className="flex flex-col gap-1 break-keep">
                <span className="text-sm leading-tight font-bold">
                  {copy?.title ?? description}
                </span>
                {copy && (
                  <span className="text-[13px] leading-tight text-gray-60">{copy.criterion}</span>
                )}
              </span>
              <span className="mt-auto grid w-full grid-cols-3 gap-1 border-t border-gray-10 pt-[19px] text-center @min-[280px]:gap-3">
                <PlanMetric label="포함 지역" value={`${includedRegionCount}곳`} />
                <PlanMetric label="총비용" value={formatCost(totalCost)} />
                <PlanMetric
                  label="커버 고령 인구"
                  value={`${formatPopulation(includedSeniorPopulation)} 명`}
                />
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <BudgetAllocation plan={activePlan} regionByCode={regionByCode} budgetLabel={budgetLabel} />
        <PlanComparison plans={plans} activePlan={activePlan} regionByCode={regionByCode} />
      </div>
    </section>
  )
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] whitespace-nowrap text-gray-60 @min-[240px]:text-xs">
        {label}
      </span>
      <strong className="text-sm leading-tight whitespace-nowrap tabular-nums @min-[240px]:text-lg @min-[320px]:text-[22px]">
        {value}
      </strong>
    </span>
  )
}

type RegionIndex = Map<string, DashboardRegion>

function BudgetAllocation({
  plan,
  regionByCode,
  budgetLabel,
}: {
  plan: Plan
  regionByCode: RegionIndex
  budgetLabel: string
}) {
  const { planId, name, budget, totalCost, description } = plan.summary
  const included = plan.regions
    .filter((region) => region.inclusionOrder !== null && region.status === 'INCLUDED')
    .toSorted((a, b) => (a.inclusionOrder ?? 0) - (b.inclusionOrder ?? 0))
  const remaining = Math.max(0, budget - totalCost)
  const percentage = (amount: number) => (budget > 0 ? (amount / budget) * 100 : 0)
  const usedModes = planModes.filter((mode) => included.some((region) => region.mode === mode))
  return (
    <Card className="@container min-w-0 space-y-5 p-4 lg:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold">예산 담기</h3>
            <span className="rounded-md bg-primary-5 px-2.5 py-1 text-[13px] font-semibold text-primary-60">
              {planId}안 {name}
            </span>
          </div>
          <p className="text-sm break-keep text-gray-60">
            {planCopy[planId]?.allocation ?? description}
          </p>
        </div>
        <p
          aria-live="polite"
          className="flex flex-wrap items-baseline gap-2 text-gray-60 tabular-nums"
        >
          <span className="text-sm">사용</span>
          <strong className="text-2xl leading-none text-primary-50">{formatCost(totalCost)}</strong>
          <span className="text-xs">
            / {budgetLabel} · {Math.round(percentage(totalCost))}%
          </span>
        </p>
      </header>
      <div className="space-y-2">
        <p className="hidden text-xs text-gray-60 @max-[682px]:block">
          예산 막대를 옆으로 밀어 보기
        </p>
        <div
          role="region"
          aria-label="지역별 예산 분배"
          tabIndex={0}
          className="overflow-x-auto rounded-lg border border-gray-10 focus-visible:outline-2 focus-visible:outline-primary-50"
        >
          <div className="flex h-16 min-w-[680px] overflow-hidden">
            {included.map((region) => {
              const mode = transportMode(region)
              const name = regionByCode.get(region.regionCode)?.regionName
              const cost = formatCost(region.estimatedCost)
              const label = `${region.inclusionOrder}순위 : ${name}`
              return (
                <div
                  key={region.regionCode}
                  title={`${label} · ${cost}`}
                  className={cx(
                    'flex shrink-0 flex-col justify-center gap-0.5 overflow-hidden border-r-2 border-white px-1.5 text-center text-xs leading-tight whitespace-nowrap sm:px-2',
                    mode ? planStyles[mode].swatch : 'bg-gray-70',
                  )}
                  style={{ width: `${percentage(region.estimatedCost ?? 0)}%` }}
                >
                  <strong className="truncate text-white">{label}</strong>
                  <span className="text-white">{cost}</span>
                </div>
              )
            })}
            {remaining > 0 && (
              <div
                title={`남은 예산 ${formatCost(remaining)}`}
                className={cx(
                  'grid place-items-center overflow-hidden px-1 text-center text-xs leading-tight text-gray-70',
                  hatch,
                )}
                style={{ width: `${percentage(remaining)}%` }}
              >
                <span>남은 {formatCost(remaining)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ul
        aria-label="예산 분배 범례"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-70"
      >
        {usedModes.map((mode) => (
          <li key={mode} className="flex items-center gap-1.5">
            <span aria-hidden className={cx('size-3 rounded-sm', planStyles[mode].swatch)} />
            {planStyles[mode].label}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden className={cx('size-3 rounded-sm border border-gray-20', hatch)} />
          남은 예산
        </li>
        <li className="text-gray-60">· 막대 길이 = 2개월 비용</li>
      </ul>
      <DeploymentTable
        key={planId}
        plan={plan}
        included={included}
        regionByCode={regionByCode}
        remaining={remaining}
      />
    </Card>
  )
}

function DeploymentTable({
  plan,
  included,
  regionByCode,
  remaining,
}: {
  plan: Plan
  included: PlanRegion[]
  regionByCode: RegionIndex
  remaining: number
}) {
  const additionalRowsId = useId()
  const [expanded, setExpanded] = useState(false)
  const { planId, name } = plan.summary
  const skipped = plan.regions
    .filter((region) => region.status === 'OVER_BUDGET')
    .toSorted((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
  const retained = plan.regions.filter(
    (region) => region.status === 'KEEP' || region.excludeReason === 'DRT_ALREADY_OPERATING',
  )
  const additionalRegions = [...skipped, ...retained]

  return (
    <div className="space-y-3">
      <p className="hidden text-xs text-gray-60 @max-[650px]:block">표를 옆으로 밀어 보기</p>
      <div
        role="region"
        aria-label="실행 지역 목록"
        tabIndex={0}
        className="overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-primary-50"
      >
        <table className="w-full min-w-[650px] text-left text-sm tabular-nums">
          <caption className="sr-only">
            {planId}안 {name} 실행 지역 목록
          </caption>
          <thead className="bg-gray-5 text-gray-70">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">
                순서
              </th>
              <th scope="col" className="w-full px-4 py-2.5 font-medium">
                지역
              </th>
              <th scope="col" className="px-4 py-2.5 text-center font-medium">
                투입
              </th>
              <th scope="col" className="px-4 py-2.5 text-center font-medium whitespace-nowrap">
                비용(2개월)
              </th>
              <th scope="col" className="px-4 py-2.5 text-center font-medium whitespace-nowrap">
                종합 취약도
              </th>
              <th scope="col" className="px-4 py-2.5 text-center font-medium">
                상태
              </th>
            </tr>
          </thead>
          {[{ rows: included }, { rows: additionalRegions, id: additionalRowsId }].map(
            ({ rows, id }) => (
              <tbody
                key={id ?? 'included'}
                id={id}
                hidden={Boolean(id) && !expanded}
                className="divide-y divide-gray-10 border-b border-gray-10"
              >
                {rows.map((region) => {
                  const dashboard = regionByCode.get(region.regionCode)
                  const score = dashboard?.score ?? null
                  const mode = transportMode(region)
                  const isIncluded = region.status === 'INCLUDED'
                  const status = isIncluded ? '포함' : regionStatus(region)
                  return (
                    <tr
                      key={region.regionCode}
                      className={cx(!isIncluded && 'bg-gray-5/65 text-gray-70')}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={cx(
                            'inline-grid size-[29px] place-items-center rounded-full font-bold',
                            isIncluded
                              ? 'bg-primary-50 text-white'
                              : 'border border-gray-20 bg-white text-gray-60',
                          )}
                        >
                          {region.inclusionOrder ?? '–'}
                        </span>
                      </td>
                      <th scope="row" className="px-4 py-3">
                        <span className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-bold">
                            {dashboard?.regionName ?? region.regionCode}
                          </span>
                          <span className="text-xs font-normal text-gray-60">{dashboard?.gu}</span>
                        </span>
                        {region.status === 'OVER_BUDGET' && (
                          <span className="block text-xs font-normal text-gray-60">
                            남은 예산 {formatCost(remaining)} &lt; 필요{' '}
                            {formatCost(region.estimatedCost)}
                          </span>
                        )}
                      </th>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {mode ? (
                          <span
                            className={cx(
                              'inline-block rounded-md px-2.5 py-1 text-xs font-semibold',
                              planStyles[mode].badge,
                            )}
                          >
                            {planStyles[mode].label}
                            {region.vehicleCount !== null && ` ${region.vehicleCount}대`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {formatCost(region.estimatedCost)}
                      </td>
                      <td
                        className={cx(
                          'px-4 py-3 text-center font-semibold',
                          score !== null && score >= 60 ? 'text-danger-50' : 'text-gray-90',
                        )}
                      >
                        {score ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cx(
                            'rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap',
                            isIncluded
                              ? 'bg-primary-5 text-primary-60'
                              : 'bg-gray-5 text-gray-70 ring-1 ring-gray-10',
                          )}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            ),
          )}
        </table>
      </div>
      {additionalRegions.length > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={additionalRowsId}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-20 bg-white px-3 py-2 text-sm font-medium text-gray-70 hover:bg-gray-5 focus-visible:outline-2 focus-visible:outline-primary-50"
        >
          {expanded ? '건너뛴 지역 접기' : `건너뛴 지역 보기 (${additionalRegions.length}곳)`}
          <span
            aria-hidden
            className={cx('size-1.5 border-r border-b', expanded ? 'rotate-225' : 'rotate-45')}
          />
        </button>
      )}
    </div>
  )
}

function PlanComparison({
  plans,
  activePlan,
  regionByCode,
}: {
  plans: Plan[]
  activePlan: Plan
  regionByCode: RegionIndex
}) {
  const planRegions = plans.map(
    (plan) => new Map(plan.regions.map((region) => [region.regionCode, region])),
  )
  const includedCodes = new Set(
    plans.flatMap((plan) =>
      plan.regions
        .filter((region) => region.status === 'INCLUDED')
        .map((region) => region.regionCode),
    ),
  )
  const comparisonRegions = [...regionByCode.values()]
    .filter((region) => includedCodes.has(region.regionCode))
    .toSorted((a, b) => (b.score ?? -1) - (a.score ?? -1))
  const activeColumn = (plan: Plan) =>
    plan === activePlan ? 'bg-primary-5/55 text-primary-60' : ''
  return (
    <Card className="flex min-w-0 flex-col gap-5 p-4 lg:px-6 lg:pt-6">
      <header className="space-y-2">
        <h3 className="text-xl font-bold">안별 비교</h3>
        <p className="text-sm leading-tight break-keep text-gray-60">
          같은 지역도 기준에 따라 순서가 바뀌거나 빠집니다.
        </p>
      </header>
      <table className="w-full table-fixed text-center text-[13px] tabular-nums">
        <caption className="sr-only">지역별 투입 순서와 안별 비용 및 고령 인구 비교</caption>
        <colgroup>
          <col className="w-[32%]" />
          {plans.map(({ summary }) => (
            <col key={summary.planId} />
          ))}
        </colgroup>
        <thead className="border-b border-gray-10 text-gray-70">
          <tr>
            <th scope="col" className="px-1.5 py-2.5 text-center font-medium">
              지역
            </th>
            {plans.map((plan) => (
              <th
                key={plan.summary.planId}
                scope="col"
                aria-current={plan === activePlan || undefined}
                className={cx(
                  'rounded-t-lg py-2.5 font-medium',
                  plan === activePlan && 'bg-primary-5 font-bold text-primary-60',
                )}
              >
                {plan.summary.planId}안
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-10 border-b border-gray-10">
          {comparisonRegions.map((region) => (
            <tr key={region.regionCode}>
              <th scope="row" className="px-1.5 py-2">
                <span className="inline-flex flex-wrap items-baseline justify-center">
                  {region.regionName}
                  <span className="text-xs font-normal whitespace-nowrap text-gray-60">
                    {region.score === null ? '(—)' : `(${region.score}점)`}
                  </span>
                </span>
              </th>
              {plans.map((plan, index) => {
                const entry = planRegions[index]?.get(region.regionCode)
                const order = entry?.inclusionOrder
                return (
                  <td key={plan.summary.planId} className={cx('py-2', activeColumn(plan))}>
                    {order != null ? (
                      <span
                        className={cx(
                          'inline-grid size-[29px] place-items-center rounded-full font-bold',
                          plan === activePlan
                            ? 'bg-primary-50 text-white'
                            : 'border border-primary-10 text-primary-60',
                        )}
                      >
                        {order}
                      </span>
                    ) : (
                      <span className="text-xs break-keep text-gray-60">{regionStatus(entry)}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <th scope="row" className="px-1.5 py-2.5 font-medium text-gray-70">
              총비용
            </th>
            {plans.map((plan) => (
              <td key={plan.summary.planId} className={cx('py-2.5 font-bold', activeColumn(plan))}>
                {formatCost(plan.summary.totalCost)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="px-1.5 py-2.5 font-medium text-gray-70">
              고령 인구
            </th>
            {plans.map((plan) => (
              <td key={plan.summary.planId} className={cx('py-2.5 font-bold', activeColumn(plan))}>
                {formatPopulation(plan.summary.includedSeniorPopulation)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-auto flex items-start gap-2.5 rounded-lg bg-gray-5 p-4 text-[13px] leading-relaxed break-keep text-gray-60">
        <img src={comparisonInfo} width={18} height={18} alt="" className="shrink-0" />
        비용은 공개 단가 기준 추정치입니다. 효과는 종합 취약도 × 65세 이상 인구로 계산합니다.
      </p>
    </Card>
  )
}
