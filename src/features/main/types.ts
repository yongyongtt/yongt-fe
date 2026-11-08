import type { Recommendation, RegionOverview } from '@/features/region-detail/types'

/** API 응답은 adapters.ts에서 이 화면 모델로 변환한다. */
export type DashboardRegion = Omit<RegionOverview['header'], 'score'> & {
  /** 데이터가 없는 점수는 0과 구분한다. */
  score: number | null
}

export type DashboardPeriod = RegionOverview['period'] & {
  /** API 응답의 집계 대상 기간. 조회 가능한 월 목록과 다르다. */
  months?: number[]
  responseType?: 'YEAR_ALL' | 'YEAR_LATEST' | 'MONTH'
  availableYears?: number[]
  updatedAt?: string | null
}

export type Dashboard = {
  period: DashboardPeriod
  summary: {
    totalRegions: number
    vulnerableRegions: number
    averageVulnerabilityScore: number | null
  }
  /** 전체 지역 기준 1~10위만. 목업에 없는 순위를 임의로 채우지 않는다. */
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
  type: Pick<NonNullable<RegionOverview['type']>, 'name' | 'desc'> | null
  reliability?: RegionOverview['reliability']
  recommended?: Array<{ mode: string; name: string }> | null
  summary?: string | null
  isKeep?: boolean
  /** 추천이 생성되지 않은 지역은 미리보기 전체 오류 대신 null을 반환한다. */
  recommendation: Recommendation | null
}
