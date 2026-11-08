import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  adaptDashboard,
  adaptDashboardMap,
  adaptRegionPreview,
} from '../src/features/main/adapters'
import { RegionPreviewContent } from '../src/features/main/components/RegionPreviewContent'
const period = { year: 2025, month: null }
const region = { regionCode: '4146125000', regionName: '포곡읍', gu: '처인구', score: 60, rank: 7 }
test('API KPI·전체 순위·갱신 시각과 선택 가능한 기간을 보존한다', () => {
  const result = adaptDashboard({
    period: {
      ...period,
      availableMonths: [null, 2],
      availableYears: [2025],
      updatedAt: '2026-11-05 11:02',
    },
    summary: { regionCount: 38, vulnerableCount: 9, avgScore: 39.1 },
    top10: [region],
  })
  assert.deepEqual(result.summary, {
    totalRegions: 38,
    vulnerableRegions: 9,
    averageVulnerabilityScore: 39.1,
  })
  assert.deepEqual(result.period.availableMonths, [null, 2])
  assert.deepEqual(result.topRegions, [region])
  const map = adaptDashboardMap(
    {
      regions: [
        { ...region, score: 60.4 },
        { ...region, score: null },
      ],
    },
    period,
  )
  assert.equal(map.regions[0].score, 60.4)
  assert.equal(map.regions[1].score, null)
  assert.throws(() => adaptDashboard({}), { code: 'INVALID_RESPONSE' })
})
test('미리보기 전용 API의 추천 수단과 한 줄 요약을 그대로 표시한다', () => {
  const preview = adaptRegionPreview(
    {
      ...region,
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
    { ...region, type: null, isKeep: false, recommended: null, summary: null },
    period,
  )
  assert.ok(
    renderToStaticMarkup(<RegionPreviewContent preview={missing} period={period} />).includes(
      '생성된 AI 추천이 없습니다.',
    ),
  )
})
