import { useRef } from 'react'
import * as Popover from '@radix-ui/react-popover'
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
  /** 월 목록을 연 상태에서도 배경 페이지의 스크롤을 허용한다. */
  scrollableMonthMenu?: boolean
}

const ALL = 'all'
const monthLabel = (m: number | null) => (m === null ? '전체' : `${m}월`)
const triggerClass =
  'group flex h-11 min-w-0 items-center rounded-lg border border-white/28 bg-white/10 px-3 transition-colors outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 data-[state=open]:border-white/50 data-[state=open]:bg-white/15 lg:h-12 lg:px-4'
const panelClass =
  'z-50 min-w-[200px] rounded border border-gray-20 bg-white shadow-[0_4px_6px_rgba(30,33,36,0.1)] data-[state=closed]:animate-dropdown-out data-[state=open]:animate-dropdown-in motion-reduce:animate-none'
const optionClass =
  'flex h-11 cursor-pointer items-center justify-between rounded-[2px] border-b border-gray-10 px-2.5 text-[13.5px] text-gray-90 transition-colors outline-none last:border-b-0'

/** 히어로 오른쪽의 '기준 연도 / 기준 월' 선택 */
export function PeriodSelect({
  period,
  onChange,
  months,
  years = AVAILABLE_YEARS,
  scrollableMonthMenu = false,
}: PeriodSelectProps) {
  const MonthSelect = scrollableMonthMenu ? ScrollableMonthMenu : HeroSelect
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
      <MonthSelect
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

function HeroSelectLabel({ label, displayLabel }: Pick<HeroSelectProps, 'label' | 'displayLabel'>) {
  return (
    <>
      <span className="shrink-0 text-[13px] tracking-[-0.01em] text-hero-sub lg:text-sm">
        {label}
      </span>
      <span className="ml-2 truncate text-[15px] font-bold tracking-[-0.01em] text-white lg:ml-2.5 lg:text-base">
        {displayLabel}
      </span>
    </>
  )
}

const chevronClass =
  'ml-auto shrink-0 pl-1 text-white transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none lg:ml-[22px] lg:pl-0'

function ScrollableMonthMenu({
  label,
  value,
  displayLabel,
  options,
  onChange,
  note,
}: HeroSelectProps) {
  const list = useRef<HTMLDivElement>(null)

  return (
    <Popover.Root modal={false}>
      <Popover.Trigger type="button" className={triggerClass}>
        <HeroSelectLabel label={label} displayLabel={displayLabel} />
        <ChevronDownIcon className={chevronClass} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          aria-label={label}
          className={`${panelClass} flex max-h-[min(24rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) origin-(--radix-popover-content-transform-origin) flex-col`}
          onOpenAutoFocus={(event) => {
            const option =
              list.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
              list.current?.querySelector('button')
            if (option) {
              event.preventDefault()
              option.focus()
            }
          }}
        >
          <p aria-hidden className="shrink-0 px-4 pt-3 pb-1.5 text-xs font-bold text-gray-50">
            {label}
          </p>
          <div
            ref={list}
            className="min-h-0 overflow-y-auto overscroll-contain px-[9px]"
            onKeyDown={(event) => {
              const buttons = [...event.currentTarget.querySelectorAll('button')]
              const index = buttons.findIndex((button) => button === event.target)
              const next = {
                ArrowUp: Math.max(0, index - 1),
                ArrowDown: Math.min(buttons.length - 1, index + 1),
                Home: 0,
                End: buttons.length - 1,
              }[event.key]
              if (next === undefined || !buttons[next]) return
              event.preventDefault()
              buttons[next].focus()
            }}
          >
            {options.map((option) => (
              <Popover.Close
                key={option.value}
                type="button"
                aria-pressed={option.value === value}
                className={`${optionClass} w-full text-left hover:bg-gray-5 focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-inset aria-pressed:bg-primary-5 aria-pressed:font-bold`}
                onClick={() => onChange(option.value)}
              >
                {option.label}
                {option.value === value && <CheckIcon className="text-primary-50" />}
              </Popover.Close>
            ))}
            {options.length === 0 && (
              <p className="px-2.5 py-2 text-sm text-gray-60">선택할 수 있는 월이 없습니다.</p>
            )}
          </div>
          {note && <p className="shrink-0 px-4 pt-2.5 pb-3 text-xs text-gray-50">{note}</p>}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function HeroSelect({ label, value, displayLabel, options, onChange, note }: HeroSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={triggerClass}>
        <HeroSelectLabel label={label} displayLabel={displayLabel} />
        <Select.Icon asChild>
          <ChevronDownIcon className={chevronClass} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className={`${panelClass} w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin)`}
        >
          <p aria-hidden className="px-4 pt-3 pb-1.5 text-xs font-bold text-gray-50">
            {label}
          </p>
          <Select.Viewport className="px-[9px]">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className={`${optionClass} data-[state=checked]:bg-primary-5 data-[state=checked]:font-bold data-[state=unchecked]:data-highlighted:bg-gray-5`}
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
