import { mockGetOverview, mockGetRecommendation } from '@/features/region-detail/mocks'
import { ApiError } from '@/shared/api/client'
import type { Period } from '@/shared/hooks/usePeriodParams'
import type { Dashboard, DashboardMap, RegionPreview } from './types'

/** 상세 목업에서 지원하는 코드만 사용. 내용과 기간 검증은 기존 조회 함수를 재사용한다. */
const REGION_CODES = ['4146134000', '4146135000', '4146136000', '4146125000', '4146551000'] as const

export const MAIN_MOCK_NOTICE =
  '시연용 데이터입니다. 지도 도형·점수·순위·정책 제안은 실제 행정경계 및 분석 결과가 아닙니다. 현재 목업은 5개 지역만 포함합니다.'

async function getOverviews(period: Period) {
  return Promise.all(REGION_CODES.map((code) => mockGetOverview(code, period)))
}

export async function mockGetDashboard(period: Period): Promise<Dashboard> {
  const overviews = await getOverviews(period)
  const regions = overviews.map(({ header }) => header)

  return {
    period: overviews[0].period,
    summary: {
      totalRegions: regions.length,
      // 시연 전용 기준: 상세 목업의 '양호형' 이외 유형. 실제 취약지역 판정식이 아님.
      vulnerableRegions: overviews.filter(
        (region) => region.type !== null && region.type.name !== '양호형',
      ).length,
      averageVulnerabilityScore:
        Math.round((regions.reduce((sum, region) => sum + region.score, 0) / regions.length) * 10) /
        10,
    },
    // 상세의 전체 지역 기준 순위를 보존한다. 5개 표본 내 순위로 다시 매기지 않는다.
    topRegions: regions.sort((a, b) => a.rank - b.rank).slice(0, 10),
  }
}

export async function mockGetDashboardMap(period: Period): Promise<DashboardMap> {
  const overviews = await getOverviews(period)
  return { period: overviews[0].period, regions: overviews.map(({ header }) => header) }
}

export async function mockGetRegionPreview(
  regionCode: string,
  period: Period,
): Promise<RegionPreview> {
  // 지역/기간 오류가 추천 없음으로 덮이지 않도록 overview부터 검증한다.
  const overview = await mockGetOverview(regionCode, period)
  let recommendation: RegionPreview['recommendation']
  try {
    recommendation = await mockGetRecommendation(regionCode, period.year)
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'RECOMMENDATION_NOT_FOUND') throw error
    recommendation = null
  }
  return {
    header: overview.header,
    period: overview.period,
    type: overview.type,
    reliability: overview.reliability,
    recommendation,
  }
}
