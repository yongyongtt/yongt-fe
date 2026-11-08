import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchDashboard, fetchDashboardMap, fetchRegionPreview } from '../src/features/main/api'
import { ApiError } from '../src/shared/api/client'
const period = { year: 2025, month: null }
const responsePeriod = {
  year: 2025,
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  type: 'YEAR_ALL',
}
const region = { regionCode: '4146125000', regionName: '포곡읍', gu: '처인구', score: 60, rank: 7 }
test('실제 분기에서 공통 apiGet으로 메인 3개 경로만 호출한다', async () => {
  const original = globalThis.fetch,
    urls: string[] = []
  try {
    const bodies = [
      {
        period: responsePeriod,
        updatedAt: '2026-11-08 20:55',
        summary: { regionCount: 38, vulnerableCount: 9, avgScore: 39.1 },
        top10: [region],
      },
      { period: responsePeriod, regions: [{ ...region, score: 60 }] },
      {
        ...region,
        period: responsePeriod,
        type: null,
        isKeep: false,
        recommended: [{ mode: 'DRT', name: '똑버스' }],
        summary: '추천 요약',
      },
    ]
    globalThis.fetch = async (url) => {
      urls.push(String(url))
      return Response.json({ success: true, data: bodies.shift(), error: null })
    }
    assert.equal((await fetchDashboard(period)).summary.totalRegions, 38)
    assert.equal((await fetchDashboardMap(period)).regions[0].score, 60)
    assert.equal((await fetchRegionPreview(region.regionCode, period)).summary, '추천 요약')
    assert.deepEqual(urls, [
      '/api/dashboard?year=2025',
      '/api/dashboard/map?year=2025',
      '/api/regions/4146125000/preview?year=2025',
    ])
  } finally {
    globalThis.fetch = original
  }
})
test('백엔드 ApiError의 code와 status를 변경하지 않는다', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () =>
      Response.json(
        { success: false, data: null, error: { code: 'PERIOD_NOT_FOUND', message: '기간 없음' } },
        { status: 404 },
      )
    await assert.rejects(
      fetchDashboard({ year: 2025, month: 5 }),
      (error: unknown) =>
        error instanceof ApiError && error.code === 'PERIOD_NOT_FOUND' && error.status === 404,
    )
    globalThis.fetch = async () => {
      throw new TypeError('network')
    }
    await assert.rejects(
      fetchDashboard(period),
      (error: unknown) =>
        error instanceof ApiError && error.code === 'NETWORK_ERROR' && error.status === 0,
    )
  } finally {
    globalThis.fetch = original
  }
})
test('누락된 API data는 메인 응답 검증에서 거부한다', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => Response.json({ success: true, data: {}, error: null })
    await assert.rejects(
      fetchDashboard(period),
      (error: unknown) => error instanceof ApiError && error.code === 'INVALID_RESPONSE',
    )
  } finally {
    globalThis.fetch = original
  }
})
