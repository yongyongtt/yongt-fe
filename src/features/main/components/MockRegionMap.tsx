import { useId, useState } from 'react'
import { cx } from '@/shared/utils/cx'
import type { RegionShape } from '../map/demoRegionShapes'
import { DEMO_MAP_VIEWBOX } from '../map/demoRegionShapes'
import { describeScore, getVulnerabilityLevel } from '../map/vulnerability'
import type { DashboardRegion } from '../types'
import { VulnerabilityLegend } from './VulnerabilityLegend'

type MockRegionMapProps = {
  regions: DashboardRegion[]
  shapes: RegionShape[]
  selectedRegionCode: string | null
  onSelectRegion: (regionCode: string) => void
}

export function MockRegionMap({
  regions,
  shapes,
  selectedRegionCode,
  onSelectRegion,
}: MockRegionMapProps) {
  const id = useId()
  const [hoveredRegionCode, setHoveredRegionCode] = useState<string | null>(null)
  const [focusedRegionCode, setFocusedRegionCode] = useState<string | null>(null)
  const byCode = new Map(regions.map((region) => [region.regionCode, region]))
  const visibleShapes = shapes.filter((shape) => byCode.has(shape.regionCode))
  const active = byCode.get(hoveredRegionCode ?? focusedRegionCode ?? selectedRegionCode ?? '')

  return (
    <div className="relative">
      <div
        className="overflow-x-auto rounded-[10px] border border-gray-10 bg-gray-5"
        role="group"
        aria-label="시연용 가상 지역 지도"
      >
        <svg
          viewBox={DEMO_MAP_VIEWBOX}
          className="block w-full min-w-[560px]"
          role="group"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
        >
          <title id={`${id}-title`}>지역별 종합 취약도 가상 지도</title>
          <desc id={`${id}-description`}>
            실제 위치나 행정경계가 아닌 시연용 도형입니다. Tab 키로 지역을 탐색하고 Enter 또는
            Space로 선택하세요.
          </desc>
          {visibleShapes.map((shape) => {
            const region = byCode.get(shape.regionCode)!
            const regionLabel = `${region.regionName} · ${region.gu} · ${describeScore(region.score)}`
            const level = getVulnerabilityLevel(region.score)
            const selected = selectedRegionCode === region.regionCode
            const highlighted =
              selected ||
              hoveredRegionCode === region.regionCode ||
              focusedRegionCode === region.regionCode
            return (
              <g
                key={region.regionCode}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={regionLabel}
                className="group cursor-pointer outline-none"
                onPointerEnter={() => setHoveredRegionCode(region.regionCode)}
                onPointerLeave={() => setHoveredRegionCode(null)}
                onFocus={() => {
                  setHoveredRegionCode(null)
                  setFocusedRegionCode(region.regionCode)
                }}
                onBlur={() => setFocusedRegionCode(null)}
                onClick={() => onSelectRegion(region.regionCode)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectRegion(region.regionCode)
                  }
                }}
              >
                <title>{regionLabel}</title>
                <polygon
                  points={shape.points.map((point) => point.join(',')).join(' ')}
                  vectorEffect="non-scaling-stroke"
                  className={cx(
                    'transition-colors motion-reduce:transition-none',
                    level?.fill ?? 'fill-gray-20',
                    highlighted ? 'stroke-primary-70 stroke-[3]' : 'stroke-white stroke-[1.5]',
                  )}
                />
                <text
                  x={shape.labelPosition[0]}
                  y={shape.labelPosition[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cx(
                    'pointer-events-none text-[24px] font-bold sm:text-lg',
                    level?.text ?? 'fill-gray-90',
                  )}
                >
                  {selected ? `✓ ${region.regionName}` : region.regionName}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="pointer-events-none absolute top-3 left-3 max-w-[calc(100%-24px)] rounded-lg border border-gray-10 bg-white px-3 py-2 text-xs leading-5 text-gray-60 sm:top-4 sm:left-4 sm:text-sm">
        {active ? (
          <p>
            <strong className="text-gray-90">{active.regionName}</strong> · {active.gu} ·{' '}
            {describeScore(active.score)}
            {selectedRegionCode === active.regionCode ? ' · 선택됨' : ''}
          </p>
        ) : (
          <p>시연용 도형 · 실제 행정경계 아님</p>
        )}
      </div>
      <div className="mt-3 w-[258px] max-w-full sm:pointer-events-none sm:absolute sm:bottom-4 sm:left-4 sm:mt-0 sm:max-w-[calc(100%-32px)]">
        <VulnerabilityLegend />
      </div>
    </div>
  )
}
