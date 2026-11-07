import { EmptyState } from '@/shared/components/EmptyState'

/** 카드 하나를 못 불러왔을 때 카드 안에 보여 주는 안내 */
export function CardError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      className="mt-6"
      title="데이터를 불러오지 못했습니다"
      description="잠시 후 다시 시도해 주십시오."
      action={{ label: '다시 시도', onClick: onRetry }}
    />
  )
}
