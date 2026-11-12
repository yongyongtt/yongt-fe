/** 조회 가능 기간 API가 제공될 때까지 사용하는 메인 한정 임시 설정. 백엔드 공지 기준. */
const MAIN_AVAILABLE_MONTHS: Record<number, readonly number[]> = {
  2025: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

export const MAIN_AVAILABLE_YEARS = Object.keys(MAIN_AVAILABLE_MONTHS).map(Number)

export function getMainAvailableMonths(year: number): Array<number | null> {
  const months = MAIN_AVAILABLE_MONTHS[year]
  return months ? [null, ...months] : []
}
