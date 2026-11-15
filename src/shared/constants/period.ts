/** URL에 연도가 없을 때 쓰는 기본값 (현재 DB에는 2025년 데이터만 있음) */
export const DEFAULT_YEAR = 2025

/** 연도 고르기 목록. 백엔드 데이터가 늘면 여기에 추가 */
export const AVAILABLE_YEARS = [2025]

/** 연도별로 조회 가능한 달 (백엔드 공지 기준). 응답에서 목록이 빠져서 프론트가 들고 있음 */
const AVAILABLE_MONTHS: Record<number, number[]> = {
  2025: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

/** 기준 월 목록. null = 연간(전체) */
export function getAvailableMonths(year: number): Array<number | null> {
  return [null, ...(AVAILABLE_MONTHS[year] ?? [])]
}
