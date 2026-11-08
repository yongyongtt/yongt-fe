import { AlertCircleIcon } from '@/shared/components/icons'
import { cx } from '@/shared/utils/cx'

/** 신뢰도 판단 기준 (디자인 문구 그대로) */
const CRITERIA = '기준: 월 호출 100건 미만'

/** 신뢰도 낮음 안내 띠. note의 첫 문장은 굵게, 나머지는 보통 글씨 */
export function LowReliabilityBanner({ note, className }: { note: string; className?: string }) {
  const cut = note.indexOf('. ')
  const strong = cut === -1 ? note : note.slice(0, cut + 1)
  const rest = cut === -1 ? '' : note.slice(cut + 1)

  return (
    <div
      role="note"
      className={cx(
        'flex flex-wrap items-start gap-x-3 gap-y-1 rounded-[2px] border-l-4 border-danger-50 bg-danger-5 px-4 py-3.5 lg:flex-nowrap lg:items-center lg:px-5',
        className,
      )}
    >
      <AlertCircleIcon width={20} height={20} className="mt-0.5 shrink-0 text-danger-50 lg:mt-0" />
      <p className="min-w-0 flex-1 text-[14px] leading-6 lg:flex-none">
        <b className="font-bold text-danger-60">{strong}</b>
        <span className="text-gray-90">{rest}</span>
      </p>
      {/* 모바일은 문장 아래 줄, 아이콘 폭(20+12px)만큼 들여 씀 */}
      <p className="w-full pl-8 text-[13px] text-gray-50 lg:ml-auto lg:w-auto lg:shrink-0 lg:pl-6 lg:text-[13.5px]">
        {CRITERIA}
      </p>
    </div>
  )
}
