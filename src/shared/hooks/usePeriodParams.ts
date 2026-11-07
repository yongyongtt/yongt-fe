import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_YEAR } from '@/shared/constants/period'

/** month가 null이면 연간(전체) */
export type Period = { year: number; month: number | null }

/** URL 쿼리(?year=2025&month=2)를 기간 값으로 읽고 씀 */
export function usePeriodParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const period = useMemo<Period>(() => {
    const year = Number(searchParams.get('year'))
    const month = Number(searchParams.get('month'))
    return {
      year: Number.isInteger(year) && year > 0 ? year : DEFAULT_YEAR,
      month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : null,
    }
  }, [searchParams])

  const setPeriod = useCallback(
    (next: Period) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set('year', String(next.year))
          if (next.month === null) params.delete('month')
          else params.set('month', String(next.month))
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { period, setPeriod }
}

/** 기간을 '?year=2025&month=2' 형태로 바꿈 (paths.ts에서 사용) */
export function toPeriodSearch({ year, month }: Period) {
  const params = new URLSearchParams({ year: String(year) })
  if (month !== null) params.set('month', String(month))
  return `?${params}`
}
