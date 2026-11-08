import type { RegionShape } from './demoRegionShapes'

export type MapViewport = { scale: number; tx: number; ty: number }
export const MAP_WIDTH = 942
export const MAP_HEIGHT = 612
export const MIN_ZOOM = 1
export const MAX_ZOOM = 3.5
export const INITIAL_VIEWPORT: MapViewport = { scale: 1, tx: 0, ty: 0 }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** 지도 전체를 화면 밖으로 잃어버리지 않도록 여유 폭을 포함해 이동량을 제한한다. */
export function clampViewport(viewport: MapViewport): MapViewport {
  const scale = clamp(viewport.scale, MIN_ZOOM, MAX_ZOOM)
  return {
    scale,
    tx: clamp(viewport.tx, MAP_WIDTH * (1 - scale) - MAP_WIDTH * 0.1, MAP_WIDTH * 0.1),
    ty: clamp(viewport.ty, MAP_HEIGHT * (1 - scale) - MAP_HEIGHT * 0.1, MAP_HEIGHT * 0.1),
  }
}

/** 화면 중심의 지점을 유지하며 확대/축소한다. 최소 배율에서는 전체 지도로 복원한다. */
export function zoomViewport(viewport: MapViewport, factor: number): MapViewport {
  const scale = clamp(viewport.scale * factor, MIN_ZOOM, MAX_ZOOM)
  if (scale === MIN_ZOOM) return { ...INITIAL_VIEWPORT }
  const ratio = scale / viewport.scale
  return clampViewport({
    scale,
    tx: MAP_WIDTH / 2 - (MAP_WIDTH / 2 - viewport.tx) * ratio,
    ty: MAP_HEIGHT / 2 - (MAP_HEIGHT / 2 - viewport.ty) * ratio,
  })
}

export function focusRegionViewport(shape: RegionShape): MapViewport {
  const xs = shape.points.map(([x]) => x)
  const ys = shape.points.map(([, y]) => y)
  const width = Math.max(...xs) - Math.min(...xs)
  const height = Math.max(...ys) - Math.min(...ys)
  const scale = clamp(
    Math.min((MAP_WIDTH * 0.65) / Math.max(width, 1), (MAP_HEIGHT * 0.6) / Math.max(height, 1)),
    1.5,
    MAX_ZOOM,
  )
  return clampViewport({
    scale,
    tx: MAP_WIDTH / 2 - shape.labelPosition[0] * scale,
    ty: MAP_HEIGHT / 2 - shape.labelPosition[1] * scale,
  })
}

/** 확대 후에도 Tab으로 초점을 받은 지역의 라벨이 화면 밖에 남지 않게 한다. */
export function revealRegion(viewport: MapViewport, shape: RegionShape): MapViewport {
  const x = shape.labelPosition[0] * viewport.scale + viewport.tx
  const y = shape.labelPosition[1] * viewport.scale + viewport.ty
  if (x >= 80 && x <= MAP_WIDTH - 80 && y >= 80 && y <= MAP_HEIGHT - 80) return viewport
  return clampViewport({
    ...viewport,
    tx: MAP_WIDTH / 2 - shape.labelPosition[0] * viewport.scale,
    ty: MAP_HEIGHT / 2 - shape.labelPosition[1] * viewport.scale,
  })
}
