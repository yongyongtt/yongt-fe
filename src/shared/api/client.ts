/** 백엔드 공통 응답 형태: { success, data, error } */
type ApiResponse<T> =
  | { success: true; data: T | null; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const body = value as Record<string, unknown>
  if (body.success === true) {
    return Object.hasOwn(body, 'data') && body.error === null
  }
  if (body.success !== false || body.data !== null) return false
  const error = body.error
  return (
    typeof error === 'object' &&
    error !== null &&
    !Array.isArray(error) &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code.trim().length > 0 &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim().length > 0
  )
}

/** 백엔드 에러 코드: REGION_NOT_FOUND, PERIOD_NOT_FOUND, RECOMMENDATION_NOT_FOUND 등 */
export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

type QueryValue = string | number | null | undefined
const REQUEST_TIMEOUT_MS = 15_000

/**
 * GET 요청을 보내고 data만 꺼내 줌. 실패하면 ApiError를 던짐.
 * null/undefined인 쿼리 값은 보내지 않음 (month: null → 연간)
 * 응답 본문 수신까지 15초가 지나면 요청을 중단하고 TIMEOUT_ERROR를 던짐.
 */
export async function apiGet<T>(path: string, query: Record<string, QueryValue> = {}): Promise<T> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) params.set(key, String(value))
  }
  const search = params.size ? `?${params}` : ''

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    let res: Response
    try {
      res = await fetch(`/api${path}${search}`, { signal: controller.signal })
    } catch {
      throw new ApiError('NETWORK_ERROR', '서버에 연결하지 못했습니다.', 0)
    }

    let body: unknown
    try {
      body = await res.json()
    } catch {
      throw new ApiError(
        res.ok ? 'INVALID_RESPONSE' : 'HTTP_ERROR',
        res.ok ? '서버 응답을 읽지 못했습니다.' : '서버 요청을 처리하지 못했습니다.',
        res.status,
      )
    }

    if (!isApiResponse(body)) {
      throw new ApiError(
        res.ok ? 'INVALID_RESPONSE' : 'HTTP_ERROR',
        res.ok ? '서버 응답 형식이 올바르지 않습니다.' : '서버 요청을 처리하지 못했습니다.',
        res.status,
      )
    }
    if (!body.success) {
      throw new ApiError(body.error.code, body.error.message, res.status)
    }
    if (!res.ok) {
      throw new ApiError('HTTP_ERROR', '서버 요청을 처리하지 못했습니다.', res.status)
    }
    if (body.data === null) {
      throw new ApiError('EMPTY_DATA', '표시할 데이터가 없습니다.', res.status)
    }
    return body.data as T
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError('TIMEOUT_ERROR', '서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.', 0)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
