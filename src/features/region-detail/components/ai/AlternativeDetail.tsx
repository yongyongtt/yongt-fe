import type { CSSProperties } from 'react'
import { CloseIcon } from '@/shared/components/icons'
import { cx } from '@/shared/utils/cx'
import type { RecommendationOption } from '../../types'
import { optionChipLabel, optionVariant, togetherLines } from '../../utils/recommendation'
import { VARIANT_STYLE } from './variantStyles'

type AlternativeDetailProps = {
  /** 마지막으로 연 대안. 닫히는 동안에도 내용을 보여 주려고 open과 따로 받음 */
  option: RecommendationOption | null
  open: boolean
  onClose: () => void
  id: string
}

/** 대안 카드 줄 아래에 펼쳐지는 상세 패널. 높이가 0 ↔ 내용 높이로 부드럽게 바뀜 */
export function AlternativeDetail({ option, open, onClose, id }: AlternativeDetailProps) {
  return (
    <div
      id={id}
      inert={!open}
      className={cx(
        'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out',
        open ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="overflow-hidden">{option && <Panel option={option} onClose={onClose} />}</div>
    </div>
  )
}

function Panel({ option, onClose }: { option: RecommendationOption; onClose: () => void }) {
  const variant = optionVariant(option)
  const s = VARIANT_STYLE[variant]
  const isExcluded = variant === 'excluded'

  const sections = [
    { title: isExcluded ? '제외한 이유' : '이 대안을 고른 이유', lines: option.reasons },
    { title: '근거 지표', lines: option.facts },
    { title: '함께 추천된 대안', lines: togetherLines(option.together) },
  ].filter((sec) => sec.lines.length > 0)

  return (
    <section
      aria-label={`${option.name} ${isExcluded ? '제외 이유' : '상세'}`}
      className={cx(
        'rounded-xl px-4 pt-4 pb-4 lg:px-[25px] lg:pt-[18px] lg:pb-6',
        s.box,
        s.panelMobile,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
          <h3 className="text-base font-bold tracking-[-0.01em] text-gray-90 lg:text-lg">
            {option.name} {isExcluded ? '제외 이유' : '상세'}
          </h3>
          <span className={cx('rounded border bg-white px-2.5 text-sm leading-7 font-bold', s.tag)}>
            {optionChipLabel(option)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cx(
            'flex h-[30px] items-center gap-1.5 rounded border bg-white px-2.5 text-sm font-bold hover:bg-gray-5',
            s.tag,
          )}
        >
          <CloseIcon width={12} height={12} />
          닫기
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="mt-3 rounded-[2px] bg-white px-[18px] py-4 text-sm text-gray-50">
          추가 설명이 없습니다.
        </p>
      ) : (
        <div
          className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-(--sec-cols) lg:gap-4"
          style={{ '--sec-cols': `repeat(${sections.length}, minmax(0, 1fr))` } as CSSProperties}
        >
          {sections.map((sec) => (
            <div
              key={sec.title}
              className="rounded-[2px] bg-white px-4 py-3.5 lg:px-[18px] lg:py-4"
            >
              <h4 className="text-sm leading-6 font-bold text-gray-90">{sec.title}</h4>
              <ul className="mt-1 list-disc pl-[18px] text-sm leading-6 text-gray-90 marker:text-gray-50">
                {sec.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
