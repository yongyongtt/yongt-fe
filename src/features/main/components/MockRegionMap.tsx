import { useId, useMemo, useRef, useState, type PointerEvent } from 'react'
import { cx } from '@/shared/utils/cx'
import type { RegionShape } from '../map/demoRegionShapes'
import { DEMO_MAP_VIEWBOX } from '../map/demoRegionShapes'
import { describeScore, getVulnerabilityLevel } from '../map/vulnerability'
import type { DashboardRegion } from '../types'
import { VulnerabilityLegend } from './VulnerabilityLegend'
import { MapControls } from './MapControls'
import { boundaryPath } from '../map/boundaries'
import { useMapLabelLayout } from '../map/useMapLabelLayout'
import { MAP_LABEL_FONT } from '../map/labels'
import { clampViewport, INITIAL_VIEWPORT, zoomViewport, type MapViewport } from '../map/viewport'

type MockRegionMapProps = {
  regions: DashboardRegion[]
  shapes: RegionShape[]
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
  viewport: MapViewport
  onViewportChange: (viewport: MapViewport) => void
  panMode: boolean
  onTogglePan: () => void
  onFocusRegion?: (regionCode: string) => void
  isRealMap?: boolean
}

export function MockRegionMap({
  regions,
  shapes,
  selectedRegionCode,
  onSelectRegion,
  viewport,
  onViewportChange,
  panMode,
  onTogglePan,
  onFocusRegion,
  isRealMap = false,
}: MockRegionMapProps) {
  const id = useId()
  const svg = useRef<SVGSVGElement>(null)
  const [hoveredRegionCode, setHoveredRegionCode] = useState<string | null>(null)
  const [focusedRegionCode, setFocusedRegionCode] = useState<string | null>(null)
  const byCode = new Map(regions.map((region) => [region.regionCode, region]))
  const visibleShapes = useMemo(() => {
    const codes = new Set(regions.map((region) => region.regionCode))
    return shapes.filter((shape) => codes.has(shape.regionCode))
  }, [shapes, regions])
  useMapLabelLayout(svg, visibleShapes, viewport.scale, selectedRegionCode, isRealMap)
  const active = byCode.get(hoveredRegionCode ?? focusedRegionCode ?? selectedRegionCode ?? '')
  const drag = useRef<{
    pointerId: number
    x: number
    y: number
    clientX: number
    clientY: number
    viewport: MapViewport
    moved: boolean
  } | null>(null)
  const [dragging, setDragging] = useState(false)
  const pointInMap = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = event.currentTarget.getScreenCTM()
    return matrix
      ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      : null
  }
  const endDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (drag.current && drag.current.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    drag.current = null
    setDragging(false)
  }

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-[10px] border border-gray-10 bg-gray-5"
        role="group"
        aria-label={isRealMap ? '용인시 행정동 지도' : '시연용 가상 지역 지도'}
      >
        <svg
          ref={svg}
          viewBox={DEMO_MAP_VIEWBOX}
          className={cx(
            'block h-[360px] w-full outline-none select-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-inset lg:h-auto',
            panMode
              ? dragging
                ? 'cursor-grabbing touch-none'
                : 'cursor-grab touch-none'
              : 'touch-pan-y',
          )}
          role="group"
          tabIndex={0}
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          onPointerDown={(event) => {
            if (!panMode || !event.isPrimary || event.button !== 0 || drag.current) return
            const point = pointInMap(event)
            if (!point) return
            event.preventDefault()
            event.currentTarget.focus({ preventScroll: true })
            event.currentTarget.setPointerCapture(event.pointerId)
            setHoveredRegionCode(null)
            drag.current = {
              pointerId: event.pointerId,
              x: point.x,
              y: point.y,
              clientX: event.clientX,
              clientY: event.clientY,
              viewport,
              moved: false,
            }
          }}
          onPointerMove={(event) => {
            const current = drag.current
            if (!current || current.pointerId !== event.pointerId) return
            const point = pointInMap(event)
            if (!point) return
            const dx = point.x - current.x
            const dy = point.y - current.y
            if (
              !current.moved &&
              Math.hypot(event.clientX - current.clientX, event.clientY - current.clientY) < 4
            )
              return
            current.moved = true
            setDragging(true)
            onViewportChange(
              clampViewport({
                ...current.viewport,
                tx: current.viewport.tx + dx,
                ty: current.viewport.ty + dy,
              }),
            )
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={() => {
            drag.current = null
            setDragging(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Home') {
              event.preventDefault()
              onViewportChange({ ...INITIAL_VIEWPORT })
              return
            }
            if (event.key === 'Escape' && panMode) {
              onTogglePan()
              return
            }
            const movement: Record<string, [number, number]> = {
              ArrowLeft: [40, 0],
              ArrowRight: [-40, 0],
              ArrowUp: [0, 40],
              ArrowDown: [0, -40],
            }
            const delta = movement[event.key]
            if (panMode && delta) {
              event.preventDefault()
              onViewportChange(
                clampViewport({
                  ...viewport,
                  tx: viewport.tx + delta[0],
                  ty: viewport.ty + delta[1],
                }),
              )
            }
          }}
        >
          <title id={`${id}-title`}>
            {isRealMap ? '용인시 지역별 종합 취약도 지도' : '지역별 종합 취약도 가상 지도'}
          </title>
          <desc id={`${id}-description`}>
            {isRealMap
              ? '용인시 읍·면·동별 종합 취약도를 표시한 지도입니다. '
              : '실제 위치나 행정경계가 아닌 시연용 도형입니다. '}
            Tab 키로 지역을 탐색하고 Enter 또는 Space로 선택하세요.
          </desc>
          <g transform={`translate(${viewport.tx} ${viewport.ty}) scale(${viewport.scale})`}>
            {visibleShapes.map((shape) => {
              const region = byCode.get(shape.regionCode)!
              const regionLabel = `${region.regionName} · ${region.gu} · ${describeScore(region.score)}`
              const level = getVulnerabilityLevel(region.score)
              const selected = selectedRegionCode === region.regionCode
              return (
                <g
                  key={region.regionCode}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  aria-label={regionLabel}
                  className={cx(
                    'group outline-none',
                    panMode ? 'cursor-inherit' : 'cursor-pointer',
                  )}
                  onPointerEnter={() => setHoveredRegionCode(region.regionCode)}
                  onPointerLeave={() => setHoveredRegionCode(null)}
                  onFocus={(event) => {
                    setHoveredRegionCode(null)
                    setFocusedRegionCode(region.regionCode)
                    // 클릭 초점으로 도형이 움직이지 않게 하고 키보드 탐색 때만 화면 안으로 이동한다.
                    if (event.currentTarget.matches(':focus-visible'))
                      onFocusRegion?.(region.regionCode)
                  }}
                  onBlur={() => setFocusedRegionCode(null)}
                  onClick={() => {
                    if (!panMode) onSelectRegion(region.regionCode)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelectRegion(region.regionCode)
                    }
                  }}
                >
                  <title>{regionLabel}</title>
                  <path
                    d={boundaryPath(shape)}
                    fillRule="evenodd"
                    vectorEffect="non-scaling-stroke"
                    className={cx(
                      'transition-colors motion-reduce:transition-none',
                      level?.fill ?? 'fill-gray-20',
                      'stroke-white stroke-[1.5]',
                    )}
                  />
                  <g
                    data-map-label={isRealMap ? region.regionCode : undefined}
                    transform={`translate(${shape.labelPosition.join(' ')})`}
                    style={isRealMap ? { visibility: 'hidden' } : undefined}
                    className="pointer-events-none"
                    aria-hidden="true"
                  >
                    <text
                      data-region-label={region.regionCode}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={cx(
                        isRealMap ? 'font-bold' : 'text-[24px] font-bold sm:text-lg',
                        level?.text ?? 'fill-gray-90',
                      )}
                      style={isRealMap ? { fontSize: MAP_LABEL_FONT } : undefined}
                    >
                      {region.regionName}
                    </text>
                  </g>
                </g>
              )
            })}
            {/* 이웃 도형이 강조선을 덮지 않도록 모든 지역을 그린 뒤 테두리를 겹친다. */}
            <g aria-hidden="true" className="pointer-events-none">
              {visibleShapes
                .filter(
                  (shape) =>
                    shape.regionCode === selectedRegionCode ||
                    shape.regionCode === hoveredRegionCode ||
                    shape.regionCode === focusedRegionCode,
                )
                .map((shape) => (
                  <path
                    key={shape.regionCode}
                    d={boundaryPath(shape)}
                    fillRule="evenodd"
                    vectorEffect="non-scaling-stroke"
                    className="fill-none stroke-primary-70 stroke-[3]"
                  />
                ))}
            </g>
          </g>
        </svg>
      </div>
      <MapControls
        viewport={viewport}
        panMode={panMode}
        onZoom={(factor) => onViewportChange(zoomViewport(viewport, factor))}
        onTogglePan={() => {
          onTogglePan()
          if (!panMode) svg.current?.focus({ preventScroll: true })
        }}
      />
      <div className="pointer-events-none absolute top-3 left-3 max-w-[calc(100%-80px)] rounded-lg border border-gray-10 bg-white px-3 py-2 text-xs leading-5 break-keep text-gray-60 sm:top-4 sm:left-4 sm:text-sm">
        {active ? (
          <p>
            <strong className="text-gray-90">{active.regionName}</strong> · {active.gu} ·{' '}
            {describeScore(active.score)}
            {selectedRegionCode === active.regionCode ? ' · 선택됨' : ''}
          </p>
        ) : (
          <p>
            {isRealMap
              ? '지역을 선택하면 진단 요약이 표시됩니다.'
              : '시연용 도형 · 실제 행정경계 아님'}
          </p>
        )}
      </div>
      <div className="mt-3 w-[258px] max-w-full sm:pointer-events-none sm:absolute sm:bottom-4 sm:left-4 sm:mt-0 sm:max-w-[calc(100%-32px)]">
        <VulnerabilityLegend />
      </div>
    </div>
  )
}
