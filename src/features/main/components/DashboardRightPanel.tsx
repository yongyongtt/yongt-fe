import { useEffect, useRef } from 'react'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { ApiError } from '@/shared/api/client'
import { USE_MOCK_REGION_DETAIL } from '@/shared/api/mock'
import { ApiFailureState } from '@/features/main/components/ApiFailureState'
import { ChevronLeftIcon } from '@/shared/components/icons'
import { Skeleton } from '@/shared/components/Skeleton'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { cx } from '@/shared/utils/cx'
import { useRegionPreview } from '../hooks'
import type { DashboardSelection } from '../selection'
import { PriorityRanking } from './PriorityRanking'
import { RegionPreviewContent, type OpenRegionDetail } from './RegionPreviewContent'
import type { PlanRegion } from '../integrated-plans/data'

function PreviewQuery({
  regionCode,
  period,
  onOpenRegionDetail,
  integratedDemo,
}: {
  regionCode: string
  period: Period
  onOpenRegionDetail?: OpenRegionDetail
  integratedDemo: boolean
}) {
  const preview = useRegionPreview(regionCode, period)
  if (preview.isPending)
    return (
      <div role="status" className="space-y-5 p-4">
        <span className="sr-only">선택 지역 진단을 불러오는 중입니다.</span>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  if (
    integratedDemo &&
    preview.error instanceof ApiError &&
    preview.error.code === 'REGION_NOT_FOUND'
  )
    return (
      <div className="p-4">
        <EmptyState
          title="미리보기 데이터가 없습니다."
          description="이 지역의 진단은 시연용 데이터에 포함되지 않습니다."
        />
      </div>
    )
  if (preview.error)
    return (
      <div className="p-4">
        <ApiFailureState error={preview.error} onRetry={() => void preview.refetch()} />
      </div>
    )
  return (
    <RegionPreviewContent
      key={`${regionCode}-${period.year}-${period.month}`}
      preview={preview.data}
      period={period}
      onOpenRegionDetail={onOpenRegionDetail}
      showDetail={!integratedDemo || !USE_MOCK_REGION_DETAIL}
    />
  )
}

type DashboardRightPanelProps = {
  period: Period
  selectedRegionCode: string | null
  mode: DashboardSelection['mode']
  onSelectRegion: (code: string) => void
  onBack: () => void
  onOpenRegionDetail?: OpenRegionDetail
  planRegions?: ReadonlyMap<string, PlanRegion>
  integratedDemo?: boolean
}

export function DashboardRightPanel({
  period,
  selectedRegionCode,
  mode,
  onSelectRegion,
  onBack,
  onOpenRegionDetail,
  planRegions,
  integratedDemo = false,
}: DashboardRightPanelProps) {
  const container = useRef<HTMLDivElement>(null)
  const backButton = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const focusRequest = useRef<'preview' | 'ranking' | null>(null)
  const showingPreview = mode === 'preview' && selectedRegionCode !== null

  useEffect(() => {
    if (focusRequest.current === 'preview' && showingPreview) backButton.current?.focus()
    if (focusRequest.current === 'ranking' && !showingPreview) {
      const row = Array.from(
        container.current?.querySelectorAll<HTMLButtonElement>('[data-region-code]') ?? [],
      ).find((button) => button.dataset.regionCode === selectedRegionCode)
      const target = row ?? heading.current
      target?.focus()
    }
    focusRequest.current = null
  }, [showingPreview, selectedRegionCode])

  return (
    <div ref={container} className="min-w-0 animate-fade-up self-start [animation-delay:380ms]">
      <Card
        className={cx(
          'flex w-full flex-col overflow-hidden',
          showingPreview ? 'h-[630px]' : 'h-[650px] xl:h-[816px]',
        )}
      >
        <div className="shrink-0 border-b border-gray-10 px-6 pt-6 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-[22px] font-bold tracking-[-0.02em] outline-none"
            >
              우선 해결 지역
            </h2>
            <span className="rounded-md bg-danger-5 px-2.5 py-1 text-[13px] font-medium text-danger-60">
              TOP 10
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm leading-6 text-gray-50">
              {showingPreview ? '선택 지역 미리보기' : '종합 취약도가 높은 순서입니다.'}
            </p>
            {showingPreview && (
              <button
                ref={backButton}
                type="button"
                aria-label="우선 해결 지역 목록으로 돌아가기"
                className="flex min-h-8 items-center gap-1 rounded px-2 text-[13px] font-medium text-gray-70 outline-none hover:bg-gray-5 focus-visible:ring-2 focus-visible:ring-primary-50"
                onClick={() => {
                  focusRequest.current = 'ranking'
                  onBack()
                }}
              >
                <ChevronLeftIcon width={16} height={16} />
                목록
              </button>
            )}
          </div>
        </div>
        {showingPreview ? (
          <PreviewQuery
            regionCode={selectedRegionCode}
            period={period}
            onOpenRegionDetail={onOpenRegionDetail}
            integratedDemo={integratedDemo}
          />
        ) : (
          <PriorityRanking
            period={period}
            selectedRegionCode={selectedRegionCode}
            planRegions={planRegions}
            onSelectRegion={(code) => {
              focusRequest.current = 'preview'
              onSelectRegion(code)
            }}
          />
        )}
      </Card>
    </div>
  )
}
