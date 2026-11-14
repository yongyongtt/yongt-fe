import { ChevronDownIcon } from '@/shared/components/icons'
import { cx } from '@/shared/utils/cx'
import type { RecommendationOption } from '../../types'
import { optionChipLabel, optionVariant } from '../../utils/recommendation'
import { VARIANT_STYLE } from './variantStyles'

type AlternativeCardProps = {
  option: RecommendationOption
  open: boolean
  onToggle: () => void
  /** 펼쳐지는 상세 패널 id (스크린리더 연결용) */
  panelId: string
  /** "통합안 1·3안". 없으면 칩 숨김 */
  planLabel?: string | null
}

/** 대안 하나. 카드 전체가 버튼이라 누르면 아래 상세가 열리고 닫힘 */
export function AlternativeCard({
  option,
  open,
  onToggle,
  panelId,
  planLabel,
}: AlternativeCardProps) {
  const variant = optionVariant(option)
  const s = VARIANT_STYLE[variant]
  const toggleLabel = open ? '접기' : variant === 'excluded' ? '제외 이유' : '자세히 보기'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      className={cx(
        'flex flex-1 flex-col rounded-xl px-5 pt-5 pb-5 text-left transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(3,31,63,0.1)] focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2 focus-visible:outline-none lg:min-h-[244px] lg:px-6 lg:pt-[22px] lg:pb-6',
        s.box,
        open && 'shadow-[0_8px_16px_rgba(3,31,63,0.12)]',
      )}
    >
      <span className="flex flex-wrap items-center gap-1.5">
        <span className={cx('rounded-md px-2.5 text-[13px] leading-7 font-medium', s.chip)}>
          {optionChipLabel(option)}
        </span>
        {option.isCurrent && (
          <span className="rounded-md border border-gray-20 bg-white px-2 text-xs leading-[26px] text-gray-60">
            현재 운영 중
          </span>
        )}
        {planLabel && (
          <span className="rounded-md bg-primary-70 px-2.5 text-[13px] leading-7 font-medium text-white">
            {planLabel}
          </span>
        )}
      </span>
      <span
        className={cx(
          'mt-3 text-[20px] font-bold tracking-[-0.02em] lg:mt-4 lg:text-[22px]',
          s.name,
        )}
      >
        {option.name}
      </span>
      {option.subtitle && (
        <span className={cx('mt-2 text-sm font-medium tracking-[-0.01em]', s.sub)}>
          {option.subtitle}
        </span>
      )}
      <span className={cx('mt-3 text-[15px] leading-6 tracking-[-0.01em] lg:mt-4', s.desc)}>
        {option.desc}
      </span>
      <span className={cx('mt-auto flex items-center gap-1 pt-4 text-sm font-medium', s.accent)}>
        {toggleLabel}
        <ChevronDownIcon
          width={14}
          height={14}
          className={cx('transition-transform duration-300', open && 'rotate-180')}
        />
      </span>
    </button>
  )
}
