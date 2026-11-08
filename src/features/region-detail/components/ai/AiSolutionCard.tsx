import { useId, useState, type CSSProperties } from 'react'
import { ApiError } from '@/shared/api/client'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InfoCircleIcon,
  SparkleIcon,
  WarningIcon,
} from '@/shared/components/icons'
import { Skeleton } from '@/shared/components/Skeleton'
import { DESKTOP_QUERY, useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'
import { useRecommendation } from '../../hooks'
import type { Recommendation, TransportMode } from '../../types'
import { formatCreatedAt } from '../../utils/recommendation'
import { AlternativeCard } from './AlternativeCard'
import { AlternativeDetail } from './AlternativeDetail'
import { BulletBox } from './BulletBox'

type AiSolutionCardProps = {
  regionCode: string
  regionName?: string
  year: number
  className?: string
}

/*
 AI 추천 해결방안 카드
 지역이 바뀌면 펼친 상태가 남지 않게 페이지에서 key={regionCode}로 씀
*/
export function AiSolutionCard({ regionCode, regionName, year, className }: AiSolutionCardProps) {
  const { data, isPending, error, refetch } = useRecommendation(regionCode, year)

  return (
    <Card className={cx('px-5 pt-6 pb-6 lg:px-9 lg:pt-[34px] lg:pb-8', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <h2 className="text-[19px] font-bold tracking-[-0.02em] text-gray-90 lg:text-[22px]">
            인공지능(AI) 추천 해결방안
          </h2>
          <span className="flex h-7 items-center gap-1.5 rounded-full bg-linear-to-r from-ai-from to-primary-50 px-3 text-[13px] font-bold text-white">
            <SparkleIcon />
            AI 생성
          </span>
        </div>
        {data && <p className="text-sm text-gray-50">{formatCreatedAt(data.createdAt)} 생성</p>}
      </div>

      {isPending ? (
        <LoadingBody />
      ) : error ? (
        <ErrorBody error={error} onRetry={() => refetch()} />
      ) : (
        <ResultBody data={data} regionName={regionName ?? '이 지역'} />
      )}
    </Card>
  )
}

function ResultBody({ data, regionName }: { data: Recommendation; regionName: string }) {
  const panelId = useId()
  // PC는 카드 줄 아래 상세 하나, 모바일은 누른 카드 바로 아래에 상세를 펼침
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [openMode, setOpenMode] = useState<TransportMode | null>(null)
  // 닫히는 애니메이션 동안에도 내용을 보여 주려고 마지막에 연 대안을 따로 기억
  const [shownMode, setShownMode] = useState<TransportMode | null>(null)

  const toggle = (mode: TransportMode) => {
    if (openMode === mode) {
      setOpenMode(null)
    } else {
      setOpenMode(mode)
      setShownMode(mode)
    }
  }

  const alternatives = data.options.filter((o) => o.mode !== 'KEEP')
  const names = alternatives.map((o) => o.name).join(' · ')
  const intro = data.isKeep
    ? `미리 정한 대안 ${alternatives.length}가지(${names})를 검토한 결과, ${regionName}에는 현행 유지를 권장합니다.`
    : `미리 정한 대안 ${alternatives.length}가지(${names}) 중 ${regionName}에 맞는 조합을 골랐습니다.`

  return (
    <>
      <p className="mt-3 text-[15px] tracking-[-0.01em] text-gray-70 lg:text-base">{intro}</p>

      {data.lowReliability && (
        <p className="mt-3 flex items-start gap-2 rounded bg-danger-5 px-3.5 py-2.5 text-sm text-danger-60 lg:items-center">
          <AlertCircleIcon width={16} height={16} className="mt-0.5 shrink-0 lg:mt-0" />
          호출 건수가 적어 추천 결과의 신뢰도가 낮습니다. 참고용으로만 확인해 주십시오.
        </p>
      )}

      <div
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-6 lg:grid-cols-(--alt-cols) lg:gap-4"
        style={{ '--alt-cols': `repeat(${data.options.length}, minmax(0, 1fr))` } as CSSProperties}
      >
        {data.options.map((o, i) => (
          <div
            key={o.mode}
            className="flex animate-fade-up flex-col"
            style={{ animationDelay: `${450 + i * 70}ms` }}
          >
            <AlternativeCard
              option={o}
              open={openMode === o.mode}
              onToggle={() => toggle(o.mode)}
              panelId={isDesktop ? panelId : `${panelId}-${o.mode}`}
            />
            {!isDesktop && (
              <AlternativeDetail
                id={`${panelId}-${o.mode}`}
                option={o}
                open={openMode === o.mode}
                onClose={() => setOpenMode(null)}
              />
            )}
          </div>
        ))}
      </div>

      {isDesktop && (
        <AlternativeDetail
          id={panelId}
          option={data.options.find((o) => o.mode === shownMode) ?? null}
          open={openMode !== null}
          onClose={() => setOpenMode(null)}
        />
      )}

      {(data.reasons.length > 0 || data.cautions.length > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:gap-4">
          {data.reasons.length > 0 && (
            <BulletBox
              className="bg-primary-5"
              icon={<CheckCircleIcon className="text-primary-50" />}
              title={data.isKeep ? '판단 근거' : '추천 근거'}
              lines={data.reasons}
            />
          )}
          {data.cautions.length > 0 && (
            <BulletBox
              className="bg-warning-5"
              icon={<WarningIcon className="text-gray-80" />}
              title="주의사항"
              lines={data.cautions}
            />
          )}
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 text-[13px] text-gray-50 lg:items-center">
        <InfoCircleIcon className="mt-0.5 shrink-0 lg:mt-0" />
        문장은 AI가 작성하고, 수치는 서버가 계산한 값만 사용합니다.
      </p>
    </>
  )
}

function LoadingBody() {
  return (
    <>
      <Skeleton className="mt-4 h-5 w-full max-w-[520px]" />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[180px] rounded-xl lg:h-[244px]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <Skeleton className="h-[165px] rounded-xl" />
        <Skeleton className="h-[165px] rounded-xl" />
      </div>
    </>
  )
}

function ErrorBody({ error, onRetry }: { error: Error; onRetry: () => void }) {
  if (error instanceof ApiError && error.code === 'RECOMMENDATION_NOT_FOUND') {
    return (
      <EmptyState
        className="mt-6"
        title="아직 생성된 해결방안이 없습니다."
        description="이 지역은 AI 추천 결과가 준비되지 않았습니다."
      />
    )
  }
  return (
    <EmptyState
      className="mt-6"
      title="해결방안을 불러오지 못했습니다."
      description="네트워크 또는 서버 문제입니다. 잠시 후 다시 시도해 주십시오."
      action={{ label: '다시 시도', onClick: onRetry }}
    />
  )
}
