import { useId } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'
import { useUnmatchedTrend } from '../hooks'
import type { TrendPoint } from '../types'
import { CardError } from './CardError'

/** 차트는 SVG 속성에 색을 넣어야 해서 hex로 씀 (index.css 토큰과 같은 값) */
const COLOR = {
  region: '#de3412', // danger-50
  city: '#b1b8be', // gray-30
  grid: '#e6e8ea', // gray-10
  axis: '#6d7882', // gray-50
}

type ChartPoint = TrendPoint & { label: string }

type UnmatchedTrendCardProps = {
  regionCode: string
  regionName?: string
  year: number
  className?: string
}

export function UnmatchedTrendCard({
  regionCode,
  regionName,
  year,
  className,
}: UnmatchedTrendCardProps) {
  const { data, isPending, isError, refetch } = useUnmatchedTrend(regionCode, year)

  return (
    <Card className={cx('px-5 pt-6 pb-6 lg:min-h-[536px] lg:px-8 lg:pt-7 lg:pb-8', className)}>
      <h2 className="text-[19px] font-bold tracking-[-0.02em] text-gray-90 lg:text-[22px]">
        미배차율 추이
      </h2>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] lg:mt-[18px] lg:text-sm">
        <p className="text-gray-50">택시를 불렀지만 배차되지 않은 비율 (월별)</p>
        <div className="flex items-center gap-4 text-gray-60">
          <LegendLine color={COLOR.region} label={regionName ?? '이 지역'} />
          <LegendLine color={COLOR.city} label="용인시 평균" dashed />
        </div>
      </div>

      {isPending ? (
        <Skeleton className="mt-6 h-[240px] w-full sm:h-[300px]" />
      ) : isError ? (
        <CardError onRetry={() => refetch()} />
      ) : data.points.length === 0 ? (
        <EmptyState className="mt-6" title="표시할 데이터가 없습니다." />
      ) : (
        <TrendChart points={data.points} />
      )}
    </Card>
  )
}

function TrendChart({ points }: { points: TrendPoint[] }) {
  const fillId = useId()
  const data: ChartPoint[] = points.map((p) => ({
    ...p,
    label: `${String(p.year).slice(2)}.${String(p.month).padStart(2, '0')}`,
  }))
  const [min, max] = yRange(points)
  const ticks = Array.from({ length: (max - min) / 10 + 1 }, (_, i) => min + i * 10)
  const lastIndex = data.length - 1
  // 좁은 화면은 월 라벨이 겹쳐서 한 칸씩 건너뛰어 표시
  const isWide = useMediaQuery('(min-width: 640px)')

  return (
    <div className="mt-6 h-[240px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 22, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR.region} stopOpacity={0.18} />
              <stop offset="100%" stopColor={COLOR.region} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={COLOR.grid} />
          <XAxis
            dataKey="label"
            interval={isWide ? 0 : 1}
            tickLine={false}
            axisLine={{ stroke: COLOR.grid }}
            tick={{ fill: COLOR.axis, fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            domain={[min, max]}
            ticks={ticks}
            tickFormatter={(v: number) => `${v}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLOR.axis, fontSize: 12 }}
            width={52}
          />
          <Tooltip
            cursor={{ stroke: COLOR.grid, strokeWidth: 1.5 }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TrendTooltip point={payload[0].payload as ChartPoint} />
              ) : null
            }
          />
          <Line
            dataKey="cityAvgRate"
            stroke={COLOR.city}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4, fill: COLOR.city, stroke: '#fff', strokeWidth: 2 }}
            animationBegin={500}
            animationDuration={900}
          />
          <Area
            dataKey="unmatchedRate"
            stroke={COLOR.region}
            strokeWidth={2.5}
            fill={`url(#${fillId})`}
            // 마지막 달만 꽉 찬 점으로 강조
            dot={({ cx: x, cy: y, index }) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={index === lastIndex ? 5 : 4}
                fill={index === lastIndex ? COLOR.region : '#fff'}
                stroke={index === lastIndex ? '#fff' : COLOR.region}
                strokeWidth={2}
              />
            )}
            activeDot={{ r: 6, fill: COLOR.region, stroke: '#fff', strokeWidth: 2 }}
            animationBegin={400}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendTooltip({ point }: { point: ChartPoint }) {
  return (
    <div className="w-[210px] rounded border border-gray-20 bg-white px-3.5 py-3 shadow-[0_4px_6px_rgba(30,33,36,0.1)]">
      <p className="text-sm leading-[21px] text-gray-50">
        {point.year}.{String(point.month).padStart(2, '0')}
      </p>
      <p className="mt-0.5 text-[17px] leading-[27px] font-bold text-danger-50">
        미배차율 {point.unmatchedRate}%
      </p>
      <p className="text-[13px] leading-[21px] text-gray-90">
        호출 {point.requestCount.toLocaleString('ko-KR')}건 · 배차 성공{' '}
        {point.matchedCount.toLocaleString('ko-KR')}건
      </p>
      <p className="text-[13px] leading-[21px] text-gray-50">
        시 평균 {point.cityAvgRate === null ? '정보 없음' : `${point.cityAvgRate}%`}
      </p>
    </div>
  )
}

/** 값이 들어갈 만큼 10 단위로 y축 범위를 잡음 (0~100 안에서) */
function yRange(points: TrendPoint[]): [number, number] {
  const values = points.flatMap((p) =>
    p.cityAvgRate === null ? [p.unmatchedRate] : [p.unmatchedRate, p.cityAvgRate],
  )
  const min = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10)
  const max = Math.min(100, Math.ceil((Math.max(...values) + 5) / 10) * 10)
  return [min, max === min ? min + 10 : max]
}

function LegendLine({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width="18" height="3" aria-hidden>
        <line
          x1="0"
          y1="1.5"
          x2="18"
          y2="1.5"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={dashed ? '5 3' : undefined}
        />
      </svg>
      {label}
    </span>
  )
}
