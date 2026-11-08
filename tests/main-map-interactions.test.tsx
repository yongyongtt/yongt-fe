import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapControls } from '../src/features/main/components/MapControls'
import { demoRegionShapes } from '../src/features/main/map/demoRegionShapes'
import { searchRegions } from '../src/features/main/map/searchRegions'
import {
  clampViewport,
  focusRegionViewport,
  INITIAL_VIEWPORT,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_ZOOM,
  revealRegion,
  zoomViewport,
} from '../src/features/main/map/viewport'
import { mockGetDashboardMap } from '../src/features/main/mocks'

test('구 이름은 소속 지역 각각을 반환하고 공백·전체 지역명도 검색한다', async () => {
  const { regions } = await mockGetDashboardMap({ year: 2025, month: null })
  const original = regions.map((region) => region.regionCode)
  assert.equal(searchRegions(regions, '처 인 구').length, 4)
  assert.deepEqual(
    searchRegions(regions, '처인구원삼면').map((region) => region.regionName),
    ['원삼면'],
  )
  assert.deepEqual(
    searchRegions(regions, ' 수지구 ').map((region) => region.regionName),
    ['풍덕천1동'],
  )
  assert.deepEqual(searchRegions(regions, ' '), [])
  assert.deepEqual(searchRegions(regions, '없는동'), [])
  assert.deepEqual(
    regions.map((region) => region.regionCode),
    original,
  )
})

test('확대·축소는 배율을 제한하고 최소 배율에서 전체 지도를 복원한다', () => {
  assert.equal(zoomViewport(INITIAL_VIEWPORT, 100).scale, MAX_ZOOM)
  assert.deepEqual(zoomViewport({ scale: 2, tx: -200, ty: -200 }, 0.1), INITIAL_VIEWPORT)
  assert.deepEqual(zoomViewport({ scale: 1, tx: 40, ty: 40 }, 0.8), INITIAL_VIEWPORT)
})

test('확대 시 화면 중앙에 있던 지도 지점을 유지한다', () => {
  const previous = { scale: 2, tx: -300, ty: -200 }
  const next = zoomViewport(previous, 1.25)
  const x = (MAP_WIDTH / 2 - previous.tx) / previous.scale
  const y = (MAP_HEIGHT / 2 - previous.ty) / previous.scale
  assert.ok(Math.abs(x * next.scale + next.tx - MAP_WIDTH / 2) < 0.001)
  assert.ok(Math.abs(y * next.scale + next.ty - MAP_HEIGHT / 2) < 0.001)
})

test('큰 드래그 이동도 허용 범위로 제한한다', () => {
  const right = clampViewport({ scale: 2, tx: 100000, ty: 100000 })
  const left = clampViewport({ scale: 2, tx: -100000, ty: -100000 })
  assert.equal(right.tx, MAP_WIDTH * 0.1)
  assert.equal(right.ty, MAP_HEIGHT * 0.1)
  assert.equal(left.tx, -MAP_WIDTH * 1.1)
  assert.equal(left.ty, -MAP_HEIGHT * 1.1)
})

test('검색 포커스와 키보드 지역 탐색은 해당 지역 라벨을 화면 안에 둔다', () => {
  for (const shape of demoRegionShapes) {
    const focused = focusRegionViewport(shape)
    const revealed = revealRegion({ scale: 3, tx: -2000, ty: -1500 }, shape)
    for (const viewport of [focused, revealed]) {
      const x = shape.labelPosition[0] * viewport.scale + viewport.tx
      const y = shape.labelPosition[1] * viewport.scale + viewport.ty
      assert.ok(viewport.scale >= 1 && viewport.scale <= MAX_ZOOM)
      assert.ok(x >= 0 && x <= MAP_WIDTH)
      assert.ok(y >= 0 && y <= MAP_HEIGHT)
    }
  }
})

test('도구는 최소·최대 확대 제한과 손 도구 선택 상태를 노출한다', () => {
  const render = (scale: number, panMode: boolean) =>
    renderToStaticMarkup(
      <MapControls
        viewport={{ scale, tx: 0, ty: 0 }}
        panMode={panMode}
        onZoom={() => {}}
        onTogglePan={() => {}}
      />,
    )
  const min = render(1, false)
  const max = render(MAX_ZOOM, true)
  assert.ok(/aria-label="지도 축소"[^>]*disabled/.test(min))
  assert.ok(/aria-label="지도 확대"[^>]*disabled/.test(max))
  assert.ok(max.includes('aria-pressed="true"'))
})
