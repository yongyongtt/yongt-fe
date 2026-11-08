import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MockRegionMap } from '../src/features/main/components/MockRegionMap'
import { RegionMapCard } from '../src/features/main/components/RegionMapCard'
import { mainKeys } from '../src/features/main/hooks'
import { demoRegionShapes } from '../src/features/main/map/demoRegionShapes'
import { describeScore, getVulnerabilityLevel } from '../src/features/main/map/vulnerability'
import { mockGetDashboardMap } from '../src/features/main/mocks'
import type { DashboardMap, DashboardRegion } from '../src/features/main/types'
import { ApiError } from '../src/shared/api/client'
import { INITIAL_VIEWPORT } from '../src/features/main/map/viewport'
import { projectBoundaries } from '../src/features/main/map/boundaries'

const period = { year: 2025, month: null }
const region: DashboardRegion = {
  regionCode: '4146134000',
  regionName: '원삼면',
  gu: '처인구',
  score: 0,
  rank: 1,
}
const noop = () => {}
const mapControls = {
  viewport: INITIAL_VIEWPORT,
  onViewportChange: noop,
  panMode: false,
  onTogglePan: noop,
}

test('확정 색상 구간은 경계값과 100점을 올바르게 분류한다', () => {
  for (const [score, label] of [
    [0, '매우 낮음'],
    [19.9, '매우 낮음'],
    [20, '낮음'],
    [40, '보통'],
    [60, '높음'],
    [80, '매우 높음'],
    [100, '매우 높음'],
  ] as const) {
    assert.equal(getVulnerabilityLevel(score)?.label, label)
  }
})

test('null/잘못된 점수는 0점으로 분류하지 않는다', () => {
  for (const score of [null, undefined, NaN, Infinity, -1, 101]) {
    assert.equal(getVulnerabilityLevel(score), null)
    assert.equal(describeScore(score), '점수 데이터 없음')
  }
  assert.equal(describeScore(0), '0점 · 매우 낮음')
})

test('가상 도형은 기존 상세와 같은 목업 지역 코드에 중복 없이 연결된다', async () => {
  const map = await mockGetDashboardMap(period)
  const shapeCodes = demoRegionShapes.map((shape) => shape.regionCode)
  assert.equal(new Set(shapeCodes).size, shapeCodes.length)
  assert.deepEqual([...shapeCodes].sort(), map.regions.map((item) => item.regionCode).sort())
})

test('지도는 선택 상태·지역명·0점을 노출하고 점수 없음은 회색으로 구분한다', () => {
  const render = (score: number | null) =>
    renderToStaticMarkup(
      <MockRegionMap
        {...mapControls}
        regions={[{ ...region, score }]}
        shapes={demoRegionShapes}
        selectedRegionCode={region.regionCode}
        onSelectRegion={noop}
      />,
    )
  const zero = render(0)
  const missing = render(null)
  assert.ok(zero.includes('aria-pressed="true"'))
  assert.ok(!zero.includes('✓'))
  // 강조선을 라벨을 포함한 지역 도형 뒤에 그려 이웃 경계선이 덮지 않게 한다.
  assert.ok(zero.indexOf('stroke-primary-70') > zero.indexOf('</text>'))
  assert.ok(zero.includes('0점 · 매우 낮음'))
  assert.ok(zero.includes('fill-map-heat-1'))
  assert.ok(missing.includes('점수 데이터 없음'))
  assert.ok(missing.includes('fill-gray-20'))
  assert.equal((zero.match(/role="button"/g) ?? []).length, 1)
})

test('응답이 없는 도형과 도형이 없는 지역에 선택 버튼을 만들지 않는다', () => {
  const html = renderToStaticMarkup(
    <MockRegionMap
      {...mapControls}
      regions={[{ ...region, regionCode: 'UNMAPPED' }]}
      shapes={demoRegionShapes}
      selectedRegionCode={null}
      onSelectRegion={noop}
    />,
  )
  assert.ok(!html.includes('role="button"'))
})

test('실제 지도는 38개 지역을 유지하고 시각 라벨에 구를 넣지 않는다', () => {
  const shapes = projectBoundaries(
    JSON.parse(readFileSync(`${process.cwd()}/public/data/yongin-dong.geojson`, 'utf8')),
  )
  for (const scale of [1, 3.5]) {
    const html = renderToStaticMarkup(
      <MockRegionMap
        {...mapControls}
        viewport={{ scale, tx: 0, ty: 0 }}
        regions={shapes.map((shape, i) => ({
          regionCode: shape.regionCode,
          regionName: shape.regionName,
          gu: shape.gu,
          score: 50,
          rank: i + 1,
        }))}
        shapes={shapes}
        isRealMap
        selectedRegionCode={null}
        onSelectRegion={noop}
      />,
    )
    assert.equal((html.match(/data-region-label=/g) ?? []).length, 38)
    assert.ok(html.indexOf('data-map-labels=') > html.lastIndexOf('stroke-white'))
    for (const shape of shapes) {
      assert.ok(html.includes(`data-region-label="${shape.regionCode}"`))
      assert.ok(html.includes(`${shape.regionName}</text>`))
      assert.ok(!html.includes(`${shape.gu}</tspan>`))
      assert.ok(html.includes(`aria-label="${shape.regionName} · ${shape.gu}`))
    }
  }
})

test('지도 카드는 조회 중·오류·빈 지도 상태를 분리한다', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false, staleTime: Infinity } },
  })
  const render = () =>
    renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <RegionMapCard period={period} selectedRegionCode={null} onSelectRegion={noop} />
      </QueryClientProvider>,
    )
  try {
    assert.ok(render().includes('지도 데이터를 불러오는 중입니다.'))
    const query = client.getQueryCache().find({ queryKey: mainKeys.map(period) })!
    query.setState({
      status: 'error',
      fetchStatus: 'idle',
      error: new ApiError('NETWORK_ERROR', '연결 실패', 0),
    })
    assert.ok(render().includes('다시 시도'))
    client.setQueryData<DashboardMap>(mainKeys.map(period), {
      period: { ...period, availableMonths: [null, 2] },
      regions: [],
    })
    assert.ok(render().includes('표시할 지역 도형이 없습니다.'))
  } finally {
    client.clear()
  }
})
