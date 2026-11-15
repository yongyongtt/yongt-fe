import { ApiError } from '@/shared/api/client'
export const invalidApiData = (): never => {
  throw new ApiError('INVALID_RESPONSE', '서버 데이터 형식이 올바르지 않습니다.', 200)
}
export const apiObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : invalidApiData()
export const apiArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : invalidApiData()
export const apiText = (value: unknown): string =>
  typeof value === 'string' ? value : invalidApiData()
export const apiNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : invalidApiData()
export const apiNullableNumber = (value: unknown): number | null =>
  value === null ? null : apiNumber(value)
export const apiBoolean = (value: unknown): boolean =>
  typeof value === 'boolean' ? value : invalidApiData()
export const apiNullableText = (value: unknown): string | null =>
  value === null ? null : apiText(value)
