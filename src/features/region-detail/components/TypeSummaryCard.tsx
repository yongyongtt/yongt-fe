import { Fragment } from 'react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { cx } from '@/shared/utils/cx'
import type { RegionOverview } from '../types'
import { parseChip } from '../utils/parseChip'
import { TypeGuidePopover } from './TypeGuidePopover'

/** 같은 유형 지역은 앞의 몇 곳만 링크로 보여 주고 나머지는 '외 N곳' */
const SAME_TYPE_LIMIT = 2

type TypeSummaryCardProps = {
  /** 없으면 불러오는 중 */
  type?: RegionOverview['type']
  period: Period
  className?: string
}

export function TypeSummaryCard({ type, period, className }: TypeSummaryCardProps) {
  return (
    <Card
      className={cx(
        'grid min-h-[255px] grid-cols-[520px_1fr] shadow-[0_8px_12px_rgba(3,31,63,0.08)]',
        className,
      )}
    >
      <div className="border-r border-gray-10 px-9 pt-[34px] pb-8">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-medium tracking-[-0.01em] text-gray-60">사각지대 유형</p>
          <TypeGuidePopover currentType={type?.name} />
        </div>

        {type === undefined ? (
          <div className="mt-4 flex flex-col gap-3">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-80" />
            <Skeleton className="mt-6 h-4 w-48" />
          </div>
        ) : type === null ? (
          <p className="mt-4 text-[17px] text-gray-50">이 지역의 유형 정보가 아직 없습니다.</p>
        ) : (
          <>
            <h2 className="mt-3 text-[34px] leading-[46px] font-bold tracking-[-0.03em] text-type-name">
              {type.name}
            </h2>
            <p className="mt-3 text-[17px] leading-[27px] tracking-[-0.01em] text-gray-70">
              {type.desc}
            </p>
            <SameTypeRegions regions={type.sameTypeRegions} period={period} />
          </>
        )}
      </div>

      <div className="px-9 pt-8 pb-8">
        <p className="text-[17px] font-bold tracking-[-0.01em] text-gray-90">
          이 유형으로 분류된 주요 지표
        </p>
        <div className="mt-[22px] grid grid-cols-3 gap-4">
          {type === undefined
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[146px] rounded-[10px]" />)
            : type?.chips.map((chip) => <StatChip key={chip} chip={chip} />)}
        </div>
      </div>
    </Card>
  )
}

function StatChip({ chip }: { chip: string }) {
  const { label, level, value, unit, compare } = parseChip(chip)

  // ' · '가 없는 문장은 그대로 보여 줌
  if (value === undefined) {
    return (
      <div className="flex min-h-[146px] items-center rounded-[10px] border border-gray-10 px-[22px] py-5">
        <p className="text-[15px] leading-6 font-medium text-gray-90">{label}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[146px] flex-col rounded-[10px] border border-gray-10 px-[22px] pt-5 pb-[18px]">
      <p className="text-sm font-medium tracking-[-0.01em] text-gray-60">{label}</p>
      <p className="mt-2 flex items-baseline gap-0.5">
        <span className="text-4xl leading-[43px] font-bold tracking-[-0.02em] text-gray-90">
          {value}
        </span>
        {unit && <span className="text-[17px] font-medium text-gray-70">{unit}</span>}
      </p>
      <p className="mt-auto text-sm tracking-[-0.01em] text-gray-50">
        {compare && (
          <>{level ? `${compare}${compare.endsWith('대비') ? ' ' : '보다 '}` : compare}</>
        )}
        {level && <b className="font-bold text-danger-50">{level}</b>}
      </p>
    </div>
  )
}

function SameTypeRegions({
  regions,
  period,
}: {
  regions: Array<{ regionCode: string; regionName: string }>
  period: Period
}) {
  if (regions.length === 0) return null

  const shown = regions.slice(0, SAME_TYPE_LIMIT)
  const rest = regions.length - shown.length

  return (
    <p className="mt-6 text-sm tracking-[-0.01em] text-gray-50">
      같은 유형 지역 ·{' '}
      {shown.map((r, i) => (
        <Fragment key={r.regionCode}>
          {i > 0 && ', '}
          <Link
            to={paths.regionDetail(r.regionCode, period)}
            className="font-medium text-primary-60 underline underline-offset-2 hover:text-primary-70"
          >
            {r.regionName}
          </Link>
        </Fragment>
      ))}
      {rest > 0 && ` 외 ${rest}곳`}
    </p>
  )
}
