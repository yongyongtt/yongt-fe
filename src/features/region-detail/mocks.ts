import { mockError, mockResponse } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import type {
  ComparisonMetric,
  Recommendation,
  RecommendationOption,
  RegionComparison,
  RegionOverview,
  UnmatchedTrend,
} from './types'

/*
 목업 지역 (주소창에 /regions/<코드>?year=2025 로 확인)
 - 4146134000 원삼면: 기본
 - 4146135000 백암면: 신뢰도 낮음
 - 4146136000 양지면: 기본 (같은 유형 지역 이동 확인용)
 - 4146125000 포곡읍: AI 추천 없음 (404)
 - 4146551000 풍덕천1동: 현행 유지
 - 그 외 코드: 없는 지역 (404)
 기간: 2025년 연간 + 2월만 있음. 그 외는 PERIOD_NOT_FOUND
 수치와 코드는 화면 확인용 가짜 값
*/

const YEAR = 2025
export const MOCK_AVAILABLE_MONTHS: Array<number | null> = [null, 2]

const CODE = {
  wonsam: '4146134000',
  baegam: '4146135000',
  yangji: '4146136000',
  pogok: '4146125000',
  pungdeokcheon: '4146551000',
}

type MockRegion = {
  name: string
  gu: string
  score: number
  rank: number
  typeKey: keyof typeof TYPES
  /** [택시 호출 성사율 %, 버스 정류장 수, 고령인구 비율 %, 생활인구] */
  metrics: [number, number, number, number]
  /** 미배차율 추이에 더할 값 */
  trendOffset: number
  /** 월평균 택시 호출 수 */
  requests: number
}

const REGIONS: Record<string, MockRegion> = {
  [CODE.wonsam]: {
    name: '원삼면',
    gu: '처인구',
    score: 68,
    rank: 1,
    typeKey: 'gap',
    metrics: [12, 8, 28, 3200],
    trendOffset: 0,
    requests: 420,
  },
  [CODE.baegam]: {
    name: '백암면',
    gu: '처인구',
    score: 63,
    rank: 3,
    typeKey: 'gap',
    metrics: [15, 11, 26, 2900],
    trendOffset: -3,
    requests: 38,
  },
  [CODE.yangji]: {
    name: '양지면',
    gu: '처인구',
    score: 61,
    rank: 5,
    typeKey: 'gap',
    metrics: [18, 13, 22, 4100],
    trendOffset: -6,
    requests: 510,
  },
  [CODE.pogok]: {
    name: '포곡읍',
    gu: '처인구',
    score: 60,
    rank: 7,
    typeKey: 'access',
    metrics: [53, 148, 20, 10403],
    trendOffset: -40,
    requests: 2700,
  },
  [CODE.pungdeokcheon]: {
    name: '풍덕천1동',
    gu: '수지구',
    score: 18,
    rank: 35,
    typeKey: 'good',
    metrics: [62, 41, 13, 8800],
    trendOffset: -50,
    requests: 3900,
  },
}

const TYPES = {
  gap: {
    name: '외곽 대중교통 공백형',
    desc: '버스 정류장과 택시 배차가 모두 부족한 외곽 지역이에요',
  },
  access: {
    name: '정류장 접근 취약형',
    desc: '버스는 다니지만 정류장까지 멀어 걷기 힘든 지역이에요',
  },
  good: {
    name: '양호형',
    desc: '시 평균보다 이동 환경이 좋아요',
  },
}

const CITY = { taxi: 31, stops: 23, elderly: 15, floating: 5100 }
const CITY_TREND = [66, 68, 69, 70, 68, 69, 70, 69, 72, 70, 69, 71]
const BASE_TREND = [82, 85, 88, 84, 86, 90, 87, 89, 91, 88, 90, 87]

const LOW_RELIABILITY_NOTE =
  '이 지역은 월평균 택시 호출이 38건으로 적어 지표 신뢰도가 낮아요. 결과는 참고용으로만 봐 주세요.'

// ---------- 에러 확인 ----------

function checkPeriod(year: number, month: number | null) {
  if (year !== YEAR || !MOCK_AVAILABLE_MONTHS.includes(month)) {
    return mockError('PERIOD_NOT_FOUND', '해당 기간의 데이터가 아직 없습니다.')
  }
  return null
}

function findRegion(regionCode: string) {
  return REGIONS[regionCode] ?? null
}

const regionNotFound = () => mockError('REGION_NOT_FOUND', '존재하지 않는 지역입니다.')

// ---------- API 4 ----------

export function mockGetOverview(regionCode: string, { year, month }: Period) {
  const periodError = checkPeriod(year, month)
  if (periodError) return periodError
  const region = findRegion(regionCode)
  if (!region) return regionNotFound()

  const [taxi, stops, elderly] = region.metrics
  const isMonth = month !== null
  const type = TYPES[region.typeKey]

  const data: RegionOverview = {
    header: {
      regionCode,
      regionName: region.name,
      gu: region.gu,
      score: isMonth ? region.score + 3 : region.score,
      rank: region.rank,
    },
    period:
      month === null
        ? { year, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: 'YEAR_ALL' }
        : { year, months: [month], type: 'MONTH' },
    reliability:
      regionCode === CODE.baegam
        ? { low: true, note: LOW_RELIABILITY_NOTE }
        : { low: false, note: null },
    type: {
      ...type,
      chips: [
        `택시 호출 성사율 ${taxi < CITY.taxi ? '낮음' : '높음'} · ${taxi}% (평균 ${CITY.taxi}%)`,
        `버스 정류장 ${stops < CITY.stops ? '적음' : '많음'} · ${stops}개 (평균 ${CITY.stops}개)`,
        `고령인구 ${elderly > CITY.elderly ? '많음' : '적음'} · ${elderly}% (평균 ${CITY.elderly}%)`,
      ],
      sameTypeRegions: Object.entries(REGIONS)
        .filter(([code, r]) => code !== regionCode && r.typeKey === region.typeKey)
        .map(([code, r]) => ({ regionCode: code, regionName: r.name })),
    },
  }
  return mockResponse(data)
}

// ---------- API 5 ----------

export function mockGetComparison(regionCode: string, { year, month }: Period) {
  const periodError = checkPeriod(year, month)
  if (periodError) return periodError
  const region = findRegion(regionCode)
  if (!region) return regionNotFound()

  const [taxi, stops, elderly, floating] = region.metrics
  const isMonth = month !== null
  const metrics: ComparisonMetric[] = [
    {
      key: 'TAXI_MATCH_RATE',
      label: '택시 호출 성사율',
      unit: '%',
      region: isMonth ? taxi - 2 : taxi,
      cityAvg: isMonth ? CITY.taxi - 2 : CITY.taxi,
    },
    {
      key: 'BUS_STOP_COUNT',
      label: '버스 정류장 수',
      unit: '개',
      region: stops,
      cityAvg: CITY.stops,
    },
    {
      key: 'ELDERLY_RATIO',
      label: '고령인구 비율',
      unit: '%',
      region: elderly,
      cityAvg: CITY.elderly,
    },
    {
      key: 'FLOATING_POP',
      label: '생활인구 (시간 평균)',
      unit: '명',
      region: isMonth ? floating - 150 : floating,
      cityAvg: isMonth ? CITY.floating - 200 : CITY.floating,
    },
  ]
  const data: RegionComparison = { metrics }
  return mockResponse(data)
}

// ---------- API 6 ----------

export function mockGetUnmatchedTrend(regionCode: string, year: number) {
  const periodError = checkPeriod(year, null)
  if (periodError) return periodError
  const region = findRegion(regionCode)
  if (!region) return regionNotFound()

  const data: UnmatchedTrend = {
    points: BASE_TREND.map((base, i) => {
      const unmatchedRate = base + region.trendOffset
      const requestCount = region.requests + ((i * 37) % 60) - 30
      return {
        year,
        month: i + 1,
        unmatchedRate,
        requestCount,
        matchedCount: Math.round((requestCount * (100 - unmatchedRate)) / 100),
        cityAvgRate: CITY_TREND[i],
      }
    }),
  }
  return mockResponse(data)
}

// ---------- API 7 ----------

export function mockGetRecommendation(regionCode: string, year: number) {
  const region = findRegion(regionCode)
  if (year !== YEAR || !region || regionCode === CODE.pogok) {
    return mockError('RECOMMENDATION_NOT_FOUND', '생성된 AI 추천이 없습니다.', 404, 800)
  }
  const data =
    regionCode === CODE.pungdeokcheon ? keepRecommendation(region) : gapRecommendation(region)
  data.lowReliability = regionCode === CODE.baegam
  return mockResponse(data, 800)
}

const option = (o: Partial<RecommendationOption> & Pick<RecommendationOption, 'mode' | 'name'>) =>
  ({
    subtitle: '',
    desc: '',
    status: 'EXCLUDED',
    rank: null,
    score: null,
    isCurrent: false,
    reasons: [],
    facts: [],
    together: null,
    ...o,
  }) satisfies RecommendationOption

function gapRecommendation(region: MockRegion): Recommendation {
  const [taxi, stops, elderly] = region.metrics
  return {
    isKeep: false,
    createdAt: '2026-11-05 11:03',
    options: [
      option({
        mode: 'DRT',
        name: '똑버스',
        subtitle: '수요응답형 버스',
        desc: '정해진 노선 없이 호출에 따라 운행해 정류장이 먼 마을을 이어요',
        status: 'RECOMMENDED',
        rank: 1,
        score: 84,
        reasons: [
          `고정 노선이 닿지 않는 마을이 많아요 (정류장 ${stops}개)`,
          '택시를 불러도 10건 중 9건이 배차되지 않아요',
        ],
        facts: [
          `택시 호출 성사율 ${taxi}% (평균 ${CITY.taxi}%)`,
          `버스 정류장 수 ${stops}개 (평균 ${CITY.stops}개)`,
          `고령인구 비율 ${elderly}% (평균 ${CITY.elderly}%)`,
        ],
        // together 형태는 아직 미정. '함께 추천된 대안' 칸 확인용 예시
        together: '행복택시: 똑버스가 닿지 않는 시간대를 보완해요',
      }),
      option({
        mode: 'HAPPY_TAXI',
        name: '행복택시',
        subtitle: '교통 소외지역 택시',
        desc: '정해진 요금으로 마을과 거점을 이어요',
        status: 'RECOMMENDED',
        rank: 2,
        score: 71,
        reasons: [`고령인구 비율이 ${elderly}%로 높아 문 앞까지 오는 교통수단이 도움이 돼요`],
        facts: [`고령인구 비율 ${elderly}% (평균 ${CITY.elderly}%)`],
      }),
      option({
        mode: 'BUS',
        name: '노선버스',
        subtitle: '증차·노선 조정',
        desc: '지금 다니는 버스를 더 자주, 더 가까이 다니게 해요',
        score: 38,
        isCurrent: true,
        reasons: ['인구밀도가 낮아 버스를 늘려도 타는 사람이 적을 것으로 보여요'],
        facts: ['인구밀도 132명/km² (평균 7,364명/km²)'],
      }),
    ],
    reasons: [
      `택시 호출 성사율이 ${taxi}%로 시 평균(${CITY.taxi}%)보다 크게 낮아 택시만으로는 부족해요.`,
      `버스 정류장이 ${stops}개로 시 평균의 절반도 안 돼, 고정 노선 증차보다 호출형 버스가 효율적이에요.`,
      `고령인구 비율(${elderly}%)이 높아 정류장까지 걷는 거리를 줄이는 보완이 필요해요.`,
    ],
    cautions: [
      '똑버스 실제 운영 구역 자료가 없어, 기존 운영 구역과 겹치는지 확인이 필요해요.',
      '정류장 데이터에 위치 좌표가 없어, 정확한 신설 위치는 현장 확인이 필요해요.',
    ],
    lowReliability: false,
  }
}

function keepRecommendation(region: MockRegion): Recommendation {
  const [taxi, stops] = region.metrics
  return {
    isKeep: true,
    createdAt: '2026-11-05 11:03',
    options: [
      option({
        mode: 'KEEP',
        name: '현행 유지',
        subtitle: '지금 교통 여건 유지',
        desc: '지금 다니는 버스와 택시로 이동 수요를 감당하고 있어요',
        status: 'RECOMMENDED',
        rank: 1,
        reasons: ['택시 호출 성사율과 정류장 수가 모두 용인시 평균보다 좋아요'],
        facts: [
          `택시 호출 성사율 ${taxi}% (평균 ${CITY.taxi}%)`,
          `버스 정류장 수 ${stops}개 (평균 ${CITY.stops}개)`,
        ],
      }),
      option({
        mode: 'DRT',
        name: '똑버스',
        subtitle: '수요응답형 버스',
        desc: '정해진 노선 없이 호출에 따라 운행해요',
        score: 22,
        reasons: ['정류장이 충분해 호출형 버스가 따로 필요하지 않아요'],
      }),
      option({
        mode: 'HAPPY_TAXI',
        name: '행복택시',
        subtitle: '교통 소외지역 택시',
        desc: '정해진 요금으로 마을과 거점을 이어요',
        score: 15,
        reasons: ['교통 소외지역 기준에 해당하지 않아요'],
      }),
      option({
        mode: 'BUS',
        name: '노선버스',
        subtitle: '증차·노선 조정',
        desc: '지금 다니는 버스를 더 자주, 더 가까이 다니게 해요',
        score: 30,
        isCurrent: true,
        reasons: ['지금 노선으로 수요를 감당하고 있어 증차가 필요하지 않아요'],
      }),
    ],
    reasons: ['주요 지표가 모두 용인시 평균보다 좋아 새 교통수단을 들일 필요가 낮아요.'],
    cautions: ['출퇴근 시간대 혼잡은 월별 데이터로 따로 확인이 필요해요.'],
    lowReliability: false,
  }
}
