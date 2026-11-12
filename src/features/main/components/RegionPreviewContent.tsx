import { Fragment, useState } from 'react'
import { LowReliabilityBanner } from '@/features/region-detail/components/LowReliabilityBanner'
import { USE_MOCK } from '@/shared/api/mock'
import { EmptyState } from '@/shared/components/EmptyState'
import { getPreviewPeriodNotice, getRecommendedOptions } from '../preview'
import type { RegionPreview } from '../types'
import type { Period } from '@/shared/hooks/usePeriodParams'

export type OpenRegionDetail = (regionCode: string, period: Period) => void

export function RegionPreviewContent({
  preview,
  period,
  onOpenRegionDetail,
  showDetail = true,
}: {
  preview: RegionPreview
  period: Period
  onOpenRegionDetail?: OpenRegionDetail
  showDetail?: boolean
}) {
  const [detailNotice, setDetailNotice] = useState(false)
  const recommendation = preview.recommendation
  const options =
    preview.recommended ?? (recommendation ? getRecommendedOptions(recommendation) : [])
  const reasons = preview.summary ? [preview.summary] : (recommendation?.reasons ?? [])
  const isKeep = preview.isKeep ?? recommendation?.isKeep ?? false
  const periodNotice = getPreviewPeriodNotice(preview.period, preview.typePeriod)

  return (
    <>
      <div
        tabIndex={0}
        aria-label="선택 지역 AI 미리보기 내용"
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-inset"
      >
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[25px] leading-[42px] font-bold break-keep">
              {preview.header.regionName}
            </h3>
            <span className="rounded border border-danger-60 px-2.5 py-1 text-[13px] font-bold text-danger-60">
              종합 {preview.header.score === null ? '점수 없음' : `${preview.header.score}점`} ·{' '}
              {preview.header.rank}위
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-6 text-gray-50">
            {preview.header.gu} · 인공지능 진단 결과{USE_MOCK ? ' (시연용)' : ''}
          </p>
          {periodNotice && (
            <p
              aria-label="진단 기준 기간 안내"
              className="mt-2 text-xs leading-5 break-keep text-gray-60"
            >
              {periodNotice}
            </p>
          )}
        </div>
        {preview.reliability?.low && (
          <LowReliabilityBanner
            note={
              preview.reliability.note ?? '이 지역은 지표 신뢰도가 낮습니다. 결과는 참고용입니다.'
            }
            className="[&]:flex-wrap [&]:items-start [&>p:last-child]:ml-0 [&>p:last-child]:w-full [&>p:last-child]:pl-0 [&>p:nth-child(2)]:flex-1 [&>svg]:mt-0.5"
          />
        )}
        <section className="rounded border border-gray-10 px-4 py-3.5">
          <h4 className="text-xs text-gray-50">사각지대 유형</h4>
          <p className="mt-1 text-[15px] leading-7 font-bold break-keep">
            {preview.type?.name ?? '유형 정보 없음'}
          </p>
          {preview.type && (
            <p className="mt-1 text-[13px] leading-6 break-keep text-gray-70">
              {preview.type.desc}
            </p>
          )}
        </section>
        <section>
          <h4 className="mb-2 text-[15px] font-bold">인공지능(AI) 추천 해결방안</h4>
          {!recommendation && !preview.recommended?.length && !preview.summary ? (
            <EmptyState
              title="생성된 AI 추천이 없습니다."
              description="지역 정보와 유형은 확인할 수 있습니다."
            />
          ) : (
            <>
              <div className="rounded border border-gray-10 px-4 py-4">
                <p className="text-xs text-gray-50">
                  {isKeep ? '현재 교통 여건 유지' : '추천 대안 조합'}
                </p>
                {options.length ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    {options.map((option, index) => (
                      <Fragment key={option.mode}>
                        {index > 0 && (
                          <span aria-hidden className="text-gray-50">
                            +
                          </span>
                        )}
                        <span className="flex min-h-10 min-w-0 flex-1 items-center justify-center rounded-sm border border-primary-50 px-3 py-2 text-center text-sm font-bold break-keep text-primary-50">
                          {option.name}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-60">표시할 추천 대안이 없습니다.</p>
                )}
              </div>
              <div className="mt-4">
                <h5 className="text-xs text-gray-50">추천 근거 요약</h5>
                {reasons.length ? (
                  <ul className="mt-1 space-y-2 text-[13px] leading-6 break-keep text-gray-90">
                    {reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-gray-60">추천 근거가 제공되지 않았습니다.</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
      {showDetail && (
        <div className="shrink-0 px-4 pt-3 pb-5">
          <button
            type="button"
            className="min-h-12 w-full rounded bg-primary-50 px-4 py-3 text-sm font-bold text-white outline-none hover:bg-primary-60 focus-visible:ring-2 focus-visible:ring-primary-70 focus-visible:ring-offset-2"
            onClick={() =>
              onOpenRegionDetail
                ? onOpenRegionDetail(preview.header.regionCode, period)
                : setDetailNotice(true)
            }
          >
            상세 진단 보기 →
          </button>
          {detailNotice && (
            <p role="status" className="mt-2 text-xs leading-5 text-gray-60">
              상세 진단 연결을 준비 중입니다.
            </p>
          )}
        </div>
      )}
    </>
  )
}
