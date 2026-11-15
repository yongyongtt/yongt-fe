import { useSyncExternalStore } from 'react'

/** Tailwind lg(1024px)와 같은 기준. 이 이상이면 PC 배치 */
export const DESKTOP_QUERY = '(min-width: 1024px)'

/**
 * 화면 크기 조건이 맞는지 알려 줌. 창 크기를 바꾸면 자동으로 다시 그려짐
 * CSS(lg: 클래스)로 안 되는 경우에만 사용 (예: 차트 옵션, 펼침 위치)
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
