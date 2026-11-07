import { useNavigate } from 'react-router'
import { paths } from '@/app/paths'
import { ApiError } from '@/shared/api/client'
import { EmptyState } from '@/shared/components/EmptyState'
import { DEFAULT_YEAR } from '@/shared/constants/period'
import type { Period } from '@/shared/hooks/usePeriodParams'

type RegionDetailErrorProps = {
  error: Error
  period: Period
  onPeriodChange: (next: Period) => void
  onRetry: () => void
}

/** 상세 페이지 전체를 못 그릴 때(개요 API 실패) 보여 주는 안내 */
export function RegionDetailError({
  error,
  period,
  onPeriodChange,
  onRetry,
}: RegionDetailErrorProps) {
  const navigate = useNavigate()
  const code = error instanceof ApiError ? error.code : null

  if (code === 'REGION_NOT_FOUND') {
    return (
      <EmptyState
        title="지역을 찾을 수 없습니다."
        description="주소가 잘못되었거나 분석 대상이 아닌 지역입니다."
        action={{ label: '메인으로 가기', onClick: () => navigate(paths.main(period)) }}
      />
    )
  }

  if (code === 'PERIOD_NOT_FOUND') {
    return (
      <EmptyState
        title="해당 기간의 데이터가 아직 없습니다."
        description="연간(전체) 데이터로 다시 확인할 수 있습니다."
        action={{
          label: '연간 데이터 보기',
          onClick: () => onPeriodChange({ year: DEFAULT_YEAR, month: null }),
        }}
      />
    )
  }

  return (
    <EmptyState
      title="정보를 불러오지 못했습니다."
      description="네트워크 또는 서버 문제입니다. 잠시 후 다시 시도해 주십시오."
      action={{ label: '다시 시도', onClick: onRetry }}
    />
  )
}
