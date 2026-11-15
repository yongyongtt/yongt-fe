// 백엔드 docs/api-spec.md(v3) API 4~7 응답의 data 부분

/** 응답마다 붙는 기간 정보. 연간은 months가 1~12 전부 */
export type ApiPeriod = {
  year: number
  months: number[]
  type: 'MONTH' | 'YEAR_ALL' | 'YEAR_LATEST'
}

/** API 4. GET /api/regions/{regionCode} */
export type RegionOverview = {
  header: {
    regionCode: string
    regionName: string
    gu: string
    score: number
    rank: number
  }
  period: ApiPeriod
  /** 유형 분류 기준 기간 */
  typePeriod: ApiPeriod
  reliability: {
    low: boolean
    note: string | null
  }
  /** ml_region 행이 없으면 null */
  type: {
    name: string
    desc: string
    /** "정류장까지 도보 김 · 12분 (평균 7분)" 같은 문장 */
    chips: string[]
    sameTypeRegions: Array<{ regionCode: string; regionName: string }>
  } | null
}

/** API 5. GET /api/regions/{regionCode}/comparison */
export type MetricKey = 'TAXI_MATCH_RATE' | 'BUS_STOP_COUNT' | 'ELDERLY_RATIO' | 'FLOATING_POP'

export type ComparisonMetric = {
  key: MetricKey
  label: string
  unit: string
  region: number
  /** 시 평균 행이 없으면 null */
  cityAvg: number | null
}

export type RegionComparison = {
  metrics: ComparisonMetric[]
}

/** API 6. GET /api/regions/{regionCode}/unmatched-trend */
export type TrendPoint = {
  year: number
  month: number
  /** % 정수 */
  unmatchedRate: number
  requestCount: number
  matchedCount: number
  cityAvgRate: number | null
}

export type UnmatchedTrend = {
  points: TrendPoint[]
}

/** API 7. GET /api/regions/{regionCode}/recommendation */
export type TransportMode = 'BUS' | 'DRT' | 'HAPPY_TAXI' | 'KEEP'

export type RecommendationOption = {
  mode: TransportMode
  name: string
  subtitle: string
  desc: string
  status: 'RECOMMENDED' | 'EXCLUDED'
  rank: number | null
  /** KEEP은 null */
  score: number | null
  isCurrent: boolean
  reasons: string[]
  facts: string[]
  /** 추천 2가 있을 때만 문장, 없으면 null */
  together: string | null
}

export type Recommendation = {
  isKeep: boolean
  /** "2026-11-05 11:03" */
  createdAt: string
  options: RecommendationOption[]
  reasons: string[]
  cautions: string[]
  lowReliability: boolean
}

/** API 9-2. GET /api/plans/map (통합 최적안 지도) */
export type PlanCategory = 'BUS' | 'DRT' | 'HAPPY_TAXI' | 'SKIPPED' | 'KEEP' | 'NONE'

export type PlanMap = {
  period: ApiPeriod
  /** 1·2·3안. 안마다 행정동 38곳 전체 */
  plans: Array<{
    plan: number
    regions: Array<{
      regionCode: string
      category: PlanCategory
      categoryName: string
      status: 'INCLUDED' | 'SKIPPED' | 'NOT_CANDIDATE'
    }>
  }>
}
