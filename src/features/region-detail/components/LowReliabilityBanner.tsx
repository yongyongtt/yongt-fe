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
        'flex items-center gap-3 rounded-[2px] border-l-4 border-danger-50 bg-danger-5 px-5 py-3.5',
        className,
      )}
    >
      <AlertCircleIcon width={20} height={20} className="shrink-0 text-danger-50" />
      <p className="text-[14px] leading-6">
        <b className="font-bold text-danger-60">{strong}</b>
        <span className="text-gray-90">{rest}</span>
      </p>
      <p className="ml-auto shrink-0 pl-6 text-[13.5px] text-gray-50">{CRITERIA}</p>
    </div>
  )
}
