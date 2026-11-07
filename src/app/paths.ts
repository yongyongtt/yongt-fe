import { toPeriodSearch, type Period } from '@/shared/hooks/usePeriodParams'

/**
 * 페이지 이동 주소는 여기서만 만듦
 * 기간(year, month)을 넘겨야 메인 ↔ 상세를 오가도 고른 기간이 유지됨
 *
 * 예) navigate(paths.regionDetail('4146134000', period))
 */
export const paths = {
  main: (period?: Period) => `/${period ? toPeriodSearch(period) : ''}`,
  regionDetail: (regionCode: string, period?: Period) =>
    `/regions/${regionCode}${period ? toPeriodSearch(period) : ''}`,
}
