import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  adaptDashboard,
  adaptDashboardMap,
  adaptRegionPreview,
  adaptMainPeriod,
} from '../src/features/main/adapters'
import { RegionPreviewContent } from '../src/features/main/components/RegionPreviewContent'
const period = { year: 2025, month: null }
const responsePeriod = {
  year: 2025,
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  type: 'YEAR_ALL',
}
const region = { regionCode: '4146125000', regionName: '포곡읍', gu: '처인구', score: 60, rank: 7 }
test('최신 API의 KPI·전체 순위·data.updatedAt과 집계 기간을 보존한다', () => {
  const result = adaptDashboard({
    period: responsePeriod,
    updatedAt: '2026-11-08 20:55',
    summary: { regionCount: 38, vulnerableCount: 9, avgScore: 39.1 },
    top10: [region],
  })
  assert.deepEqual(result.summary, {
    totalRegions: 38,
    vulnerableRegions: 9,
    averageVulnerabilityScore: 39.1,
  })
  assert.equal(result.period.month, null)
  assert.deepEqual(result.period.months, responsePeriod.months)
  assert.deepEqual(result.period.availableMonths, [null, 1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(result.period.availableYears, [2025])
  assert.equal(result.period.updatedAt, '2026-11-08 20:55')
  assert.deepEqual(result.topRegions, [region])
  const map = adaptDashboardMap(
    {
      period: responsePeriod,
      regions: [
        { ...region, score: 60 },
        { ...region, score: null },
      ],
    },
    period,
  )
  assert.equal(map.regions[0].score, 60)
  assert.equal(map.regions[1].score, null)
  assert.throws(() => adaptDashboard({}), { code: 'INVALID_RESPONSE' })
})
test('미리보기 전용 API의 추천 수단과 한 줄 요약을 그대로 표시한다', () => {
  const preview = adaptRegionPreview(
    {
      ...region,
      period: responsePeriod,
      type: { name: '정류장 접근 취약형', desc: '정류장까지 먼 지역' },
      isKeep: false,
      recommended: [{ mode: 'DRT', name: '똑버스' }],
      summary: '정류장까지 멀어 똑버스 도입 검토',
    },
    period,
  )
  const html = renderToStaticMarkup(<RegionPreviewContent preview={preview} period={period} />)
  assert.ok(html.includes('정류장까지 멀어 똑버스 도입 검토'))
  assert.ok(html.includes('똑버스'))
  assert.ok(!html.includes('생성된 AI 추천이 없습니다.'))
  assert.equal(preview.reliability, undefined)
  const missing = adaptRegionPreview(
    {
      ...region,
      period: responsePeriod,
      type: null,
      isKeep: false,
      recommended: null,
      summary: null,
    },
    period,
  )
  assert.ok(
    renderToStaticMarkup(<RegionPreviewContent preview={missing} period={period} />).includes(
      '생성된 AI 추천이 없습니다.',
    ),
  )
})

test('월간 period를 읽고 요청과 다른 기간이나 잘못된 기간은 거부한다', () => {
  const monthly = { year: 2025, months: [7], type: 'MONTH' }
  assert.equal(adaptMainPeriod(monthly, { year: 2025, month: 7 }).month, 7)
  assert.throws(() => adaptMainPeriod(monthly, period), { code: 'INVALID_RESPONSE' })
  for (const value of [
    { ...monthly, months: [] },
    { ...monthly, months: [7, 8] },
    { ...monthly, months: [13] },
    { ...monthly, months: [1, 1] },
    { ...monthly, type: 'UNKNOWN' },
    { ...monthly, year: '2025' },
  ])
    assert.throws(() => adaptMainPeriod(value), { code: 'INVALID_RESPONSE' })
})

test('월간 응답의 months 한 개로 선택 목록이 축소되지 않고 동순위도 유지한다', () => {
  const result = adaptDashboard(
    {
      period: { year: 2025, months: [7], type: 'MONTH' },
      updatedAt: null,
      summary: { regionCount: 38, vulnerableCount: 9, avgScore: 38.7 },
      top10: [
        { ...region, regionCode: 'a', rank: 1 },
        { ...region, regionCode: 'b', rank: 1 },
      ],
    },
    { year: 2025, month: 7 },
  )
  assert.equal(result.period.month, 7)
  assert.deepEqual(result.period.availableMonths, [null, 1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(
    result.topRegions.map((row) => row.rank),
    [1, 1],
  )
})

test('연간 점수와 최신 월 유형·추천의 기준 기간을 구분해 표시한다', () => {
  const preview = adaptRegionPreview(
    {
      ...region,
      period: responsePeriod,
      typePeriod: { year: 2025, months: [7], type: 'YEAR_LATEST' },
      type: { name: '정류장 접근 취약형', desc: '정류장까지 먼 지역' },
      isKeep: false,
      recommended: [{ mode: 'DRT', name: '똑버스' }],
      summary: '똑버스 도입 검토',
    },
    period,
  )
  assert.equal(preview.period.responseType, 'YEAR_ALL')
  assert.equal(preview.typePeriod?.responseType, 'YEAR_LATEST')
  assert.deepEqual(preview.typePeriod?.months, [7])
  const html = renderToStaticMarkup(<RegionPreviewContent preview={preview} period={period} />)
  assert.ok(html.includes('점수·순위 기준'))
  assert.ok(html.includes('2025년 전체'))
  assert.ok(html.includes('유형·추천 기준'))
  assert.ok(html.includes('2025년 7월 (최신)'))
})

test('월간은 각 응답의 월을 표시하고 유형 기준 기간이 없으면 추정하지 않는다', () => {
  const monthly = { year: 2025, months: [3], type: 'MONTH' }
  const data = {
    ...region,
    period: monthly,
    typePeriod: monthly,
    type: null,
    isKeep: false,
    recommended: null,
    summary: null,
  }
  const selected = { year: 2025, month: 3 }
  const preview = adaptRegionPreview(data, selected)
  const html = renderToStaticMarkup(<RegionPreviewContent preview={preview} period={selected} />)
  assert.equal((html.match(/2025년 3월/g) ?? []).length, 2)
  assert.ok(!html.includes('(최신)'))
  const missing = adaptRegionPreview({ ...data, typePeriod: null }, selected)
  assert.equal(missing.typePeriod, null)
  assert.ok(
    renderToStaticMarkup(<RegionPreviewContent preview={missing} period={selected} />).includes(
      '정보 없음',
    ),
  )
  assert.throws(
    () => adaptRegionPreview({ ...data, typePeriod: { ...monthly, months: [] } }, selected),
    { code: 'INVALID_RESPONSE' },
  )
})
