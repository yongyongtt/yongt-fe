import assert from 'node:assert/strict'
import test from 'node:test'
import { mockGetOverview } from '../src/features/region-detail/mocks'
import {
  mockGetDashboard,
  mockGetDashboardMap,
  mockGetRegionPreview,
} from '../src/features/main/mocks'
import { mainKeys } from '../src/features/main/hooks'

test('연간/2월의 메인 지역·점수·순위·기간은 상세 목업과 일치한다', async () => {
  for (const month of [null, 2]) {
    const period = { year: 2025, month }
    const [dashboard, map] = await Promise.all([
      mockGetDashboard(period),
      mockGetDashboardMap(period),
    ])
    assert.deepEqual(dashboard.period, { ...period, availableMonths: [null, 2] })
    assert.equal(dashboard.summary.totalRegions, 5)
    assert.equal(dashboard.summary.vulnerableRegions, 4)
    assert.equal(dashboard.summary.averageVulnerabilityScore, month === null ? 54 : 57)
    assert.equal(dashboard.topRegions.length, 5)
    assert.deepEqual(
      dashboard.topRegions.map((region) => region.rank),
      [1, 3, 5, 7, 35],
    )
    assert.deepEqual(map.regions, dashboard.topRegions)
    const details = await Promise.all(
      map.regions.map((region) => mockGetOverview(region.regionCode, period)),
    )
    assert.deepEqual(
      map.regions,
      details.map((detail) => detail.header),
    )
  }
})

test('지원하지 않는 기간과 없는 지역을 오류로 구분한다', async () => {
  for (const period of [
    { year: 2025, month: 6 },
    { year: 2024, month: null },
  ]) {
    await assert.rejects(mockGetDashboard(period), { code: 'PERIOD_NOT_FOUND', status: 404 })
    await assert.rejects(mockGetDashboardMap(period), { code: 'PERIOD_NOT_FOUND', status: 404 })
    await assert.rejects(mockGetRegionPreview('4146134000', period), {
      code: 'PERIOD_NOT_FOUND',
      status: 404,
    })
  }
  await assert.rejects(mockGetRegionPreview('MOCK-01', { year: 2025, month: null }), {
    code: 'REGION_NOT_FOUND',
    status: 404,
  })
})

test('미리보기는 추천 없음·현행 유지·낮은 신뢰도를 보존한다', async () => {
  const period = { year: 2025, month: 2 }
  const [pogok, keep, low] = await Promise.all([
    mockGetRegionPreview('4146125000', period),
    mockGetRegionPreview('4146551000', period),
    mockGetRegionPreview('4146135000', period),
  ])
  assert.equal(pogok.recommendation, null)
  assert.equal(keep.recommendation?.isKeep, true)
  assert.equal(low.reliability.low, true)
  assert.equal(low.recommendation?.lowReliability, true)
  assert.equal(low.header.score, 66)
  assert.deepEqual(low.period, { ...period, availableMonths: [null, 2] })
})

test('캐시 키는 기간과 선택 지역을 구분한다', () => {
  const annual = { year: 2025, month: null }
  const monthly = { year: 2025, month: 2 }
  assert.notDeepEqual(mainKeys.dashboard(annual), mainKeys.dashboard(monthly))
  assert.notDeepEqual(mainKeys.map(annual), mainKeys.map(monthly))
  assert.notDeepEqual(mainKeys.dashboard(annual), mainKeys.map(annual))
  assert.notDeepEqual(mainKeys.preview('a', annual), mainKeys.preview('a', monthly))
  assert.notDeepEqual(mainKeys.preview('a', annual), mainKeys.preview('b', annual))
})
