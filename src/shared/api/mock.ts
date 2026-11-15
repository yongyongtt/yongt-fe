import { ApiError } from './client'

/** .env.local 의 VITE_USE_MOCK=true 이면 목업 데이터를 씀 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 상세 페이지만 따로 목업을 켜고 끔. 값을 안 넣으면 VITE_USE_MOCK을 따름
 * (메인 API 연동 전에도 상세는 실제 서버로 볼 수 있게)
 */
export const USE_MOCK_REGION_DETAIL =
  import.meta.env.VITE_MOCK_REGION_DETAIL === undefined ||
  import.meta.env.VITE_MOCK_REGION_DETAIL === ''
    ? USE_MOCK
    : import.meta.env.VITE_MOCK_REGION_DETAIL === 'true'

/** 목업 응답에 실제 네트워크처럼 약간의 지연을 줌 */
export function mockResponse<T>(data: T, delayMs = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delayMs))
}

/** 목업에서 404 같은 에러를 흉내 냄 */
export function mockError(code: string, message: string, status = 404, delayMs = 400) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new ApiError(code, message, status)), delayMs),
  )
}
