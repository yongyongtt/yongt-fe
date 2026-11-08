import * as Select from '@radix-ui/react-select'
import { AVAILABLE_YEARS } from '@/shared/constants/period'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { CheckIcon, ChevronDownIcon } from './icons'

type PeriodSelectProps = {
  period: Period
  onChange: (next: Period) => void
  /** 고를 수 있는 달. null = 연간(전체) */
  months: Array<number | null>
  years?: number[]
}

const ALL = 'all'
const monthLabel = (m: number | null) => (m === null ? '전체' : `${m}월`)

/** 히어로 오른쪽의 '기준 연도 / 기준 월' 선택 */
export function PeriodSelect({
  period,
  onChange,
  months,
  years = AVAILABLE_YEARS,
}: PeriodSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-2.5">
      <HeroSelect
        label="기준 연도"
        value={String(period.year)}
        displayLabel={`${period.year}년`}
        options={years.map((y) => ({ value: String(y), label: `${y}년` }))}
        // 연도를 바꾸면 그 해에 같은 달이 없을 수 있어 연간으로 돌림
        onChange={(v) => onChange({ year: Number(v), month: null })}
      />
      <HeroSelect
        label="기준 월"
        value={period.month === null ? ALL : String(period.month)}
        displayLabel={monthLabel(period.month)}
        options={months.map((m) => ({ value: m === null ? ALL : String(m), label: monthLabel(m) }))}
        onChange={(v) => onChange({ year: period.year, month: v === ALL ? null : Number(v) })}
        note="분석이 완료된 월만 선택할 수 있습니다."
      />
    </div>
  )
}

type HeroSelectProps = {
  label: string
  value: string
  /** 목록에 없는 값(예: 주소에 직접 넣은 5월)이어도 버튼에 보여 줄 글자 */
  displayLabel: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  note?: string
}

function HeroSelect({ label, value, displayLabel, options, onChange, note }: HeroSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="group flex h-11 min-w-0 items-center rounded-lg border border-white/28 bg-white/10 px-3 transition-colors outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 data-[state=open]:border-white/50 data-[state=open]:bg-white/15 lg:h-12 lg:px-4">
        <span className="shrink-0 text-[13px] tracking-[-0.01em] text-hero-sub lg:text-sm">
          {label}
        </span>
        <span className="ml-2 truncate text-[15px] font-bold tracking-[-0.01em] text-white lg:ml-2.5 lg:text-base">
          {displayLabel}
        </span>
        <Select.Icon asChild>
          <ChevronDownIcon className="ml-auto shrink-0 pl-1 text-white transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none lg:ml-[22px] lg:pl-0" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 w-(--radix-select-trigger-width) min-w-[200px] origin-(--radix-select-content-transform-origin) rounded border border-gray-20 bg-white shadow-[0_4px_6px_rgba(30,33,36,0.1)] data-[state=closed]:animate-dropdown-out data-[state=open]:animate-dropdown-in motion-reduce:animate-none"
        >
          <p aria-hidden className="px-4 pt-3 pb-1.5 text-xs font-bold text-gray-50">
            {label}
          </p>
          <Select.Viewport className="px-[9px]">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className="flex h-11 cursor-pointer items-center justify-between rounded-[2px] border-b border-gray-10 px-2.5 text-[13.5px] text-gray-90 transition-colors outline-none last:border-b-0 data-[state=checked]:bg-primary-5 data-[state=checked]:font-bold data-[state=unchecked]:data-highlighted:bg-gray-5"
              >
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon className="text-primary-50" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          {note ? (
            <p className="px-4 pt-2.5 pb-3 text-xs text-gray-50">{note}</p>
          ) : (
            <div className="h-2" />
          )}
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
