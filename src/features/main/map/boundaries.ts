import { ApiError } from '@/shared/api/client'
import type { RegionShape } from './demoRegionShapes'
import { MAP_WIDTH, MAP_HEIGHT } from './viewport'

type Feature = {
  properties: { code: string; name: string; gu: string; centerLat: number; centerLng: number }
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
}
export type BoundaryShape = RegionShape & { regionName: string; gu: string }
const project = ([lng, lat]: readonly number[]): readonly [number, number] => [
  (lng * Math.PI) / 180,
  -Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
]

export function projectBoundaries(value: unknown): BoundaryShape[] {
  const data = value as { type?: string; features?: Feature[] }
  const invalid = (): never => {
    throw new ApiError('INVALID_RESPONSE', '행정경계 자료를 표시할 수 없습니다.', 200)
  }
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features) || !data.features.length)
    return invalid()
  const features = data.features
  const codes = new Set<string>()
  const prepared = features.map((feature) => {
    const p = feature.properties,
      g = feature.geometry
    if (
      !p ||
      !/^\d{10}$/.test(p.code) ||
      codes.has(p.code) ||
      typeof p.name !== 'string' ||
      typeof p.gu !== 'string' ||
      !Number.isFinite(p.centerLat) ||
      !Number.isFinite(p.centerLng)
    )
      return invalid()
    codes.add(p.code)
    if (!g || !['Polygon', 'MultiPolygon'].includes(g.type) || !Array.isArray(g.coordinates))
      return invalid()
    const rings = (
      g.type === 'Polygon' ? g.coordinates : (g.coordinates as number[][][][]).flat()
    ) as number[][][]
    if (
      !rings.length ||
      rings.some(
        (ring) =>
          !Array.isArray(ring) ||
          ring.length < 4 ||
          ring.some(
            (point) =>
              !Array.isArray(point) ||
              point.length < 2 ||
              !point.every(Number.isFinite) ||
              Math.abs(point[1]) >= 90,
          ),
      )
    )
      return invalid()
    return { p, rings: rings.map((ring) => ring.map(project)) }
  })
  const all = prepared.flatMap((row) => row.rings.flat())
  const xs = all.map(([x]) => x),
    ys = all.map(([, y]) => y)
  const minX = Math.min(...xs),
    minY = Math.min(...ys),
    width = Math.max(...xs) - minX,
    height = Math.max(...ys) - minY
  if (width <= 0 || height <= 0) return invalid()
  const scale = Math.min((MAP_WIDTH - 72) / width, (MAP_HEIGHT - 72) / height)
  const left = (MAP_WIDTH - width * scale) / 2,
    top = (MAP_HEIGHT - height * scale) / 2
  const fit = ([x, y]: readonly number[]): readonly [number, number] => [
    left + (x - minX) * scale,
    top + (y - minY) * scale,
  ]
  return prepared.map(({ p, rings }) => ({
    regionCode: p.code,
    regionName: p.name,
    gu: p.gu,
    rings: rings.map((ring) => ring.map(fit)),
    points: rings.flat().map(fit),
    labelPosition: fit(project([p.centerLng, p.centerLat])),
  }))
}

export async function fetchBoundaries(): Promise<BoundaryShape[]> {
  let response: Response
  try {
    response = await fetch(`${import.meta.env.BASE_URL}data/yongin-dong.geojson`, {
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new ApiError('NETWORK_ERROR', '지도 경계 자료를 불러오지 못했습니다.', 0)
  }
  if (!response.ok)
    throw new ApiError('HTTP_ERROR', '지도 경계 자료를 불러오지 못했습니다.', response.status)
  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new ApiError(
      'INVALID_RESPONSE',
      '지도 경계 자료 형식이 올바르지 않습니다.',
      response.status,
    )
  }
  return projectBoundaries(data)
}

export function boundaryPath(shape: RegionShape) {
  return (shape.rings ?? [shape.points])
    .map((ring) => `M${ring.map((point) => point.join(',')).join('L')}Z`)
    .join(' ')
}
