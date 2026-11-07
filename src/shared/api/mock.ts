import { ApiError } from './client'

/** .env.local 의 VITE_USE_MOCK=true 이면 목업 데이터를 씀 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

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
