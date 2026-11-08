/** 백엔드 공통 응답 형태: { success, data, error } */
type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
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

    let body: ApiResponse<T>
    try {
      body = await res.json()
    } catch {
      throw new ApiError('INVALID_RESPONSE', '서버 응답을 읽지 못했습니다.', res.status)
    }

    if (!body.success || body.data === null) {
      throw new ApiError(
        body.error?.code ?? 'UNKNOWN',
        body.error?.message ?? '알 수 없는 오류가 발생했습니다.',
        res.status,
      )
    }
    return body.data
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError('TIMEOUT_ERROR', '서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.', 0)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
