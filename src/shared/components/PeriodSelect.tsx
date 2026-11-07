import { AVAILABLE_YEARS } from '@/shared/constants/period'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { ChevronDownIcon } from './icons'

type PeriodSelectProps = {
  period: Period
  onChange: (next: Period) => void
  /** 고를 수 있는 달. null = 연간(전체). 백엔드 응답의 availableMonths를 그대로 넘김 */
  months: Array<number | null>
  years?: number[]
}

const ALL = 'all'

/** 히어로 오른쪽의 '기준 연도 / 기준 월' 선택 */
export function PeriodSelect({
  period,
  onChange,
  months,
  years = AVAILABLE_YEARS,
}: PeriodSelectProps) {
  return (
    <div className="flex gap-2.5">
      <HeroSelect
        label="기준 연도"
        value={String(period.year)}
        options={years.map((y) => ({ value: String(y), label: `${y}년` }))}
        // 연도를 바꾸면 그 해에 같은 달이 없을 수 있어 연간으로 돌림
        onChange={(v) => onChange({ year: Number(v), month: null })}
      />
      <HeroSelect
        label="기준 월"
        value={period.month === null ? ALL : String(period.month)}
        options={months.map((m) => ({
          value: m === null ? ALL : String(m),
          label: m === null ? '전체' : `${m}월`,
        }))}
        onChange={(v) => onChange({ year: period.year, month: v === ALL ? null : Number(v) })}
      />
    </div>
  )
}

type HeroSelectProps = {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

function HeroSelect({ label, value, options, onChange }: HeroSelectProps) {
  const selected = options.find((o) => o.value === value)

  return (
    <label className="relative flex h-12 items-center rounded-lg border border-white/28 bg-white/10 pr-4 pl-4 focus-within:ring-2 focus-within:ring-white/60">
      <span className="text-sm tracking-[-0.01em] text-hero-sub">{label}</span>
      <span className="ml-2.5 text-base font-bold tracking-[-0.01em] text-white">
        {selected?.label ?? '-'}
      </span>
      <ChevronDownIcon className="ml-[22px] text-white" />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
