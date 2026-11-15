import { ApiError } from '@/shared/api/client'
import { EmptyState } from '@/shared/components/EmptyState'

export function ApiFailureState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const code = error instanceof ApiError ? error.code : ''
  const title =
    code === 'NETWORK_ERROR'
      ? '서버에 연결할 수 없습니다.'
      : code === 'TIMEOUT_ERROR'
        ? '서버 응답이 지연되고 있습니다.'
        : code === 'EMPTY_DATA'
          ? '표시할 데이터가 없습니다.'
          : code === 'INVALID_RESPONSE'
            ? '데이터를 표시할 수 없습니다.'
            : '데이터를 불러오지 못했습니다.'
  const description =
    code === 'NETWORK_ERROR'
      ? '인터넷 연결을 확인한 후 다시 시도해 주세요. 연결이 정상이라면 서버가 일시적으로 응답하지 않는 상태일 수 있습니다.'
      : code === 'EMPTY_DATA'
        ? '선택한 조건에 제공되는 데이터가 없습니다. 기간을 변경하거나 다시 시도해 주세요.'
        : code === 'INVALID_RESPONSE'
          ? '서버에서 올바른 데이터를 받지 못했습니다. 잠시 후 다시 시도해 주세요.'
          : error instanceof ApiError
            ? error.message || '잠시 후 다시 시도해 주세요.'
            : '서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.'
  return (
    <div role="alert">
      <EmptyState
        title={title}
        description={description}
        action={{ label: '다시 시도', onClick: onRetry }}
      />
    </div>
  )
}
