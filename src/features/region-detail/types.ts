// 백엔드 docs/api-spec.md(v3) API 4~7 응답의 data 부분

/** API 4. GET /api/regions/{regionCode} */
export type RegionOverview = {
  header: {
    regionCode: string
    regionName: string
    gu: string
    score: number
    rank: number
  }
  period: {
    year: number
    month: number | null
    /** null = 연간 */
    availableMonths: Array<number | null>
  }
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
  /** 형태 미정. 지금은 항상 null */
  together: unknown
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
