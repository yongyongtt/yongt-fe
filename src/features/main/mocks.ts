import {
  MOCK_AVAILABLE_MONTHS,
  mockGetOverview,
  mockGetRecommendation,
} from '@/features/region-detail/mocks'
import { ApiError } from '@/shared/api/client'
import type { Period } from '@/shared/hooks/usePeriodParams'
import type { Dashboard, DashboardMap, RegionPreview } from './types'
import { getPriorityRegions } from './preview'

/** 상세 목업에서 지원하는 코드만 사용. 내용과 기간 검증은 기존 조회 함수를 재사용. */
const REGION_CODES = ['4146134000', '4146135000', '4146136000', '4146125000', '4146551000'] as const

export const MAIN_MOCK_NOTICE =
  '시연용 데이터입니다. 지도 도형·점수·순위·정책 제안은 실제 행정경계 및 분석 결과가 아닙니다. 현재 목업은 5개 지역만 포함합니다.'

/** 상세 목업을 메인 화면 모델로 맞춤 */
const mockPeriod = ({ year, month }: Period) => ({
  year,
  month,
  availableMonths: MOCK_AVAILABLE_MONTHS,
})

async function getOverviews(period: Period) {
  return Promise.all(REGION_CODES.map((code) => mockGetOverview(code, period)))
}

export async function mockGetDashboard(period: Period): Promise<Dashboard> {
  const overviews = await getOverviews(period)
  const regions = overviews.map(({ header }) => header)

  return {
    period: mockPeriod(period),
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
    // 상세의 전체 지역 기준 순위를 보존함. 5개 표본 내 순위로 다시 매기지 않음.
    topRegions: getPriorityRegions(regions),
  }
}

export async function mockGetDashboardMap(period: Period): Promise<DashboardMap> {
  const overviews = await getOverviews(period)
  return { period: mockPeriod(period), regions: overviews.map(({ header }) => header) }
}

export async function mockGetRegionPreview(
  regionCode: string,
  period: Period,
): Promise<RegionPreview> {
  // 지역/기간 오류가 추천 없음으로 덮이지 않도록 overview부터 검증함.
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
    period: mockPeriod(period),
    type: overview.type,
    reliability: overview.reliability,
    recommendation,
  }
}
