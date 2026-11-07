import type { Recommendation, RegionOverview } from '@/features/region-detail/types'

/** 메인 UI용 임시 data 모델. 실제 백엔드 docs/api-spec.md 확보 후 응답 구조 대조 필요. */
export type DashboardRegion = Omit<RegionOverview['header'], 'score'> & {
  /** 데이터가 없는 점수는 0과 구분한다. */
  score: number | null
}

export type DashboardPeriod = RegionOverview['period']

export type Dashboard = {
  period: DashboardPeriod
  summary: {
    totalRegions: number
    vulnerableRegions: number
    averageVulnerabilityScore: number | null
  }
  /** 최대 10개. 목업에 없는 지역을 임의로 추가하지 않는다. */
  topRegions: DashboardRegion[]
}

/** 도형/좌표는 점수 데이터와 분리하고 지도 구현 단계에서 연결한다. */
export type DashboardMap = {
  period: DashboardPeriod
  regions: DashboardRegion[]
}

export type RegionPreview = {
  header: DashboardRegion
  period: DashboardPeriod
  type: RegionOverview['type']
  reliability: RegionOverview['reliability']
  /** 추천이 생성되지 않은 지역은 미리보기 전체 오류 대신 null을 반환한다. */
  recommendation: Recommendation | null
}
