import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { projectBoundaries, boundaryPath } from '../src/features/main/map/boundaries'
import { focusRegionViewport, MAP_WIDTH, MAP_HEIGHT } from '../src/features/main/map/viewport'
const data = JSON.parse(readFileSync(`${process.cwd()}/public/data/yongin-dong.geojson`, 'utf8'))
test('제공된 38개 실제 경계를 코드·중심점과 연결하고 화면 안에 투영한다', () => {
  const shapes = projectBoundaries(data)
  assert.equal(shapes.length, 38)
  assert.equal(new Set(shapes.map((row) => row.regionCode)).size, 38)
  for (const shape of shapes) {
    assert.ok(shape.points.every(([x, y]) => x >= 0 && x <= MAP_WIDTH && y >= 0 && y <= MAP_HEIGHT))
    assert.ok(boundaryPath(shape).startsWith('M'))
    assert.ok(boundaryPath(shape).endsWith('Z'))
    const viewport = focusRegionViewport(shape)
    assert.ok(viewport.scale >= 1.5 && viewport.scale <= 3.5)
  }
  assert.equal(shapes.find((row) => row.regionCode === '4146125000')?.regionName, '포곡읍')
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
