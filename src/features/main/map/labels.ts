type Point = readonly [number, number]
type Rings = ReadonlyArray<ReadonlyArray<Point>>

/** evenodd 경계까지의 거리. 경계 밖이나 구멍 안에서는 음수다. */
export function boundaryDistance([x, y]: Point, rings: Rings): number {
  let inside = false
  let minSquared = Infinity
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[j]
      const [bx, by] = ring[i]
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside
      const dx = bx - ax
      const dy = by - ay
      const lengthSquared = dx * dx + dy * dy
      const t = lengthSquared
        ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared))
        : 0
      minSquared = Math.min(minSquared, (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2)
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(minSquared)
}

/** 면적 가중 중심. 구멍은 면적에서 빼고, 섬은 면적에 비례해 더한다. */
export function boundaryCentroid(rings: Rings): Point {
  let totalArea = 0,
    weightedX = 0,
    weightedY = 0
  for (const [index, ring] of rings.entries()) {
    let twiceArea = 0,
      x = 0,
      y = 0
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
      twiceArea += cross
      x += (ring[j][0] + ring[i][0]) * cross
      y += (ring[j][1] + ring[i][1]) * cross
    }
    if (!twiceArea) continue
    const depth = rings.filter(
      (other, i) => i !== index && boundaryDistance(ring[0], [other]) > 0,
    ).length
    const area = Math.abs(twiceArea) * (depth % 2 ? -1 : 1)
    weightedX += (x / (3 * twiceArea)) * area
    weightedY += (y / (3 * twiceArea)) * area
    totalArea += area
  }
  return totalArea ? [weightedX / totalArea, weightedY / totalArea] : rings[0][0]
}

/** 면적 중심을 사용하되, 오목한 경계나 구멍 때문에 중심이 밖에 있으면 내부로 보정한다. */
export function placeBoundaryLabel(rings: Rings): { position: Point; radius: number } {
  const center = boundaryCentroid(rings)
  const radius = boundaryDistance(center, rings)
  if (radius > 0) return { position: center, radius }
  const points = rings.flat()
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const minX = Math.min(...xs),
    maxX = Math.max(...xs)
  const minY = Math.min(...ys),
    maxY = Math.max(...ys)
  const cell = (x: number, y: number, half: number) => {
    const distance = boundaryDistance([x, y], rings)
    return { x, y, half, distance, max: distance + half * Math.SQRT2 }
  }
  let best = cell((minX + maxX) / 2, (minY + maxY) / 2, Math.max(maxX - minX, maxY - minY) / 2)
  const queue = [best]
  // 더 넓은 내부 공간이 있을 가능성이 큰 셀부터 확인한다.
  const enqueue = (next: typeof best) => {
    let low = 0,
      high = queue.length
    while (low < high) {
      const middle = (low + high) >>> 1
      if (queue[middle].max < next.max) low = middle + 1
      else high = middle
    }
    queue.splice(low, 0, next)
  }
  while (queue.length) {
    const current = queue.pop()!
    if (current.distance > best.distance) best = current
    if (current.max - best.distance <= 0.25) continue
    const half = current.half / 2
    for (const dx of [-half, half]) {
      for (const dy of [-half, half]) enqueue(cell(current.x + dx, current.y + dy, half))
    }
  }
  return { position: [best.x, best.y], radius: Math.max(0, best.distance) }
}

export const MAP_LABEL_FONT = 14
export const MIN_MAP_LABEL_FONT = 9
type LabelCandidate = {
  code: string
  x: number
  y: number
  /** 14px 글씨의 실제 렌더링 크기 */
  width: number
  height: number
  radius: number
}

/** 실제 화면 좌표에서 겹치는 라벨을 먼저 줄이고 최소 크기에서도 겹칠 때만 숨긴다. */
export function layoutMapLabels(candidates: LabelCandidate[], selectedCode: string | null) {
  const labels = candidates.map((item) => ({ ...item, fontSize: MAP_LABEL_FONT, visible: true }))
  const overlaps = (a: (typeof labels)[number], b: (typeof labels)[number]) =>
    Math.abs(a.x - b.x) <
      (a.width * a.fontSize + b.width * b.fontSize) / (MAP_LABEL_FONT * 2) + 2 &&
    Math.abs(a.y - b.y) < (a.height * a.fontSize + b.height * b.fontSize) / (MAP_LABEL_FONT * 2) + 2

  for (let step = 0; step < (MAP_LABEL_FONT - MIN_MAP_LABEL_FONT) * 2; step++) {
    const crowded = new Set<(typeof labels)[number]>()
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        if (!overlaps(labels[i], labels[j])) continue
        if (labels[i].fontSize > MIN_MAP_LABEL_FONT) crowded.add(labels[i])
        if (labels[j].fontSize > MIN_MAP_LABEL_FONT) crowded.add(labels[j])
      }
    }
    if (!crowded.size) break
    for (const label of crowded) label.fontSize -= 0.5
  }
  const kept: typeof labels = []
  const ordered = [...labels].sort(
    (a, b) =>
      Number(b.code === selectedCode) - Number(a.code === selectedCode) ||
      b.radius - a.radius ||
      a.code.localeCompare(b.code),
  )
  for (const label of ordered) {
    label.visible = !kept.some((other) => overlaps(label, other))
    if (label.visible) kept.push(label)
  }
  return labels
}
