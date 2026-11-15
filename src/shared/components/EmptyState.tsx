import { cx } from '@/shared/utils/cx'
import { AlertCircleIcon } from './icons'

type EmptyStateProps = {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

/** 회색 박스 안내 (에러, 데이터 없음). 디자인: AI 해결방안 '생성 실패' 박스 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-1.5 rounded bg-gray-5 px-5 py-10 text-center',
        className,
      )}
    >
      <AlertCircleIcon className="text-gray-90" />
      <p className="pt-3.5 text-[17px] leading-[30px] font-bold text-gray-90">{title}</p>
      {description && <p className="text-[13px] leading-[22.5px] text-gray-50">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-3 h-10 rounded bg-primary-50 px-4 text-[13.5px] font-bold text-white hover:bg-primary-60"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
