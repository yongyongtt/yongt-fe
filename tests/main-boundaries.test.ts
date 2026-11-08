import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { projectBoundaries, boundaryPath } from '../src/features/main/map/boundaries'
import { focusRegionViewport, MAP_WIDTH, MAP_HEIGHT } from '../src/features/main/map/viewport'
import {
  boundaryDistance,
  boundaryCentroid,
  layoutMapLabels,
  MIN_MAP_LABEL_FONT,
  placeBoundaryLabel,
} from '../src/features/main/map/labels'
const data = JSON.parse(readFileSync(`${process.cwd()}/public/data/yongin-dong.geojson`, 'utf8'))
test('제공된 38개 실제 경계를 코드와 연결하고 경계 안쪽 중앙에 라벨을 배치한다', () => {
  const shapes = projectBoundaries(data)
  assert.equal(shapes.length, 38)
  assert.equal(new Set(shapes.map((row) => row.regionCode)).size, 38)
  for (const shape of shapes) {
    assert.ok(shape.points.every(([x, y]) => x >= 0 && x <= MAP_WIDTH && y >= 0 && y <= MAP_HEIGHT))
    assert.ok(boundaryPath(shape).startsWith('M'))
    assert.ok(boundaryPath(shape).endsWith('Z'))
    assert.ok(boundaryDistance(shape.labelPosition, shape.rings!) > 0)
    assert.ok(shape.labelRadius! > 0)
    const viewport = focusRegionViewport(shape)
    assert.ok(viewport.scale >= 1.5 && viewport.scale <= 3.5)
  }
  assert.equal(shapes.find((row) => row.regionCode === '4146125000')?.regionName, '포곡읍')
})

test('오목한 도형·구멍·분리된 섬에서 라벨은 충분한 공간이 있는 내부에 놓인다', () => {
  const square = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
    [0, 0],
  ] as const
  const hole = [
    [35, 35],
    [65, 35],
    [65, 65],
    [35, 65],
    [35, 35],
  ] as const
  const island = [
    [110, 0],
    [120, 0],
    [120, 10],
    [110, 10],
    [110, 0],
  ] as const
  const concave = [
    [0, 0],
    [100, 0],
    [100, 20],
    [20, 20],
    [20, 100],
    [0, 100],
    [0, 0],
  ] as const
  const centered = placeBoundaryLabel([square])
  assert.deepEqual(centered.position, [50, 50])
  assert.equal(centered.radius, 50)
  for (const rings of [[square, hole], [square, island], [concave]]) {
    const label = placeBoundaryLabel(rings)
    assert.ok(boundaryDistance(label.position, rings) > 9)
    assert.ok(label.radius > 9)
  }
  assert.ok(placeBoundaryLabel([square, island]).position[0] < 100)
})

test('비대칭 도형은 가장 넓은 공간이 아닌 면적 중심에 배치한다', () => {
  const triangle = [
    [0, 0],
    [120, 0],
    [0, 120],
    [0, 0],
  ] as const
  assert.deepEqual(boundaryCentroid([triangle]), [40, 40])
  assert.deepEqual(placeBoundaryLabel([triangle]).position, [40, 40])
  assert.deepEqual(placeBoundaryLabel([[...triangle].reverse()]).position, [40, 40])
  const move = projectBoundaries(data).find((shape) => shape.regionName === '이동읍')!
  assert.deepEqual(move.labelPosition, boundaryCentroid(move.rings!))
})

test('겹치는 지역명은 숨기기 전에 글씨를 줄이고 떨어진 이름은 크기를 유지한다', () => {
  const labels = layoutMapLabels(
    [
      { code: 'a', x: 0, y: 0, width: 56, height: 16, radius: 10 },
      { code: 'b', x: 48, y: 0, width: 56, height: 16, radius: 10 },
      { code: 'c', x: 200, y: 0, width: 56, height: 16, radius: 10 },
    ],
    null,
  )
  assert.ok(labels.every((label) => label.visible))
  assert.ok(labels[0].fontSize < 14 && labels[0].fontSize >= MIN_MAP_LABEL_FONT)
  assert.equal(labels[2].fontSize, 14)
})

test('최소 가독 크기에서도 겹치면 하나만 숨기고 선택 지역을 우선한다', () => {
  const labels = layoutMapLabels(
    ['a', 'b'].map((code) => ({ code, x: 0, y: 0, width: 56, height: 16, radius: 10 })),
    'b',
  )
  assert.ok(labels.every((label) => label.fontSize === MIN_MAP_LABEL_FONT))
  assert.deepEqual(
    labels.map((label) => label.visible),
    [false, true],
  )
  const expanded = layoutMapLabels(
    [
      { code: 'a', x: 0, y: 0, width: 56, height: 16, radius: 10 },
      { code: 'b', x: 80, y: 0, width: 56, height: 16, radius: 10 },
    ],
    'b',
  )
  assert.ok(expanded.every((label) => label.visible && label.fontSize === 14))
})
test('빈 경계·잘못된 좌표·중복 코드는 오류로 구분한다', () => {
  assert.throws(() => projectBoundaries({ type: 'FeatureCollection', features: [] }), {
    code: 'INVALID_RESPONSE',
  })
  assert.throws(
    () => projectBoundaries({ ...data, features: [data.features[0], data.features[0]] }),
    { code: 'INVALID_RESPONSE' },
  )
  const invalid = structuredClone(data)
  invalid.features[0].geometry.coordinates[0][0] = [127, NaN]
  assert.throws(() => projectBoundaries(invalid), { code: 'INVALID_RESPONSE' })
})
