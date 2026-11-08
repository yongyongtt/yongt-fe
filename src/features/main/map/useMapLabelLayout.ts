import { useLayoutEffect, type RefObject } from 'react'
import type { RegionShape } from './demoRegionShapes'
import {
  insetLabelPosition,
  labelFitsBoundary,
  layoutMapLabels,
  MAP_LABEL_FONT,
  MIN_MAP_LABEL_FONT,
} from './labels'

/** 화면 크기·배율·폰트 로딩이 바뀌면 실제 글자 크기로 겹침을 다시 계산한다. */
export function useMapLabelLayout(
  svg: RefObject<SVGSVGElement | null>,
  shapes: RegionShape[],
  scale: number,
  selectedCode: string | null,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const root = svg.current
    if (!enabled || !root) return
    let disposed = false
    const update = () => {
      if (disposed) return
      const matrix = root.getScreenCTM()
      if (!matrix) return
      const worldScale = Math.hypot(matrix.a, matrix.b) * scale
      if (!worldScale) return
      const groups = [...root.querySelectorAll<SVGGElement>('g[data-map-label]')]
      const candidates = groups.flatMap((group) => {
        const code = group.dataset.mapLabel!
        const shape = shapes.find((item) => item.regionCode === code)
        const text = group.querySelector('text')
        if (!shape || !text) return []
        const box = text.getBBox()
        const rings = shape.rings ?? [shape.points]
        const position = insetLabelPosition(
          shape.labelPosition,
          ((box.width * MIN_MAP_LABEL_FONT) / MAP_LABEL_FONT + 4) / worldScale,
          ((box.height * MIN_MAP_LABEL_FONT) / MAP_LABEL_FONT + 4) / worldScale,
          rings,
          worldScale,
        )
        // 글자의 실제 사각형 중심을 라벨 배치 좌표에 맞춘다.
        text.setAttribute(
          'transform',
          `translate(${-box.x - box.width / 2} ${-box.y - box.height / 2})`,
        )
        return [
          {
            code,
            x: position[0] * worldScale,
            y: position[1] * worldScale,
            width: box.width,
            height: box.height,
            radius: shape.labelRadius ?? 0,
            fits: (fontSize: number) =>
              labelFitsBoundary(
                position,
                ((box.width * fontSize) / MAP_LABEL_FONT + 4) / worldScale,
                ((box.height * fontSize) / MAP_LABEL_FONT + 4) / worldScale,
                rings,
              ),
          },
        ]
      })
      const layout = new Map(
        layoutMapLabels(candidates, selectedCode).map((label) => [label.code, label]),
      )
      for (const group of groups) {
        const label = layout.get(group.dataset.mapLabel!)
        if (!label) continue
        group.setAttribute(
          'transform',
          `translate(${label.x / worldScale} ${label.y / worldScale}) scale(${label.fontSize / (MAP_LABEL_FONT * worldScale)})`,
        )
        group.style.visibility = label.visible ? 'visible' : 'hidden'
        group.dataset.labelFont = String(label.fontSize)
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(root)
    void document.fonts.ready.then(update)
    return () => {
      disposed = true
      observer.disconnect()
    }
  }, [svg, shapes, scale, selectedCode, enabled])
}
