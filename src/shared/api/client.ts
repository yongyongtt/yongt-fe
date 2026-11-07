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

/**
 * GET 요청을 보내고 data만 꺼내 줌. 실패하면 ApiError를 던짐.
 * null/undefined인 쿼리 값은 보내지 않음 (month: null → 연간)
 */
export async function apiGet<T>(path: string, query: Record<string, QueryValue> = {}): Promise<T> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) params.set(key, String(value))
  }
  const search = params.size ? `?${params}` : ''

  let res: Response
  try {
    res = await fetch(`/api${path}${search}`)
  } catch {
    throw new ApiError('NETWORK_ERROR', '서버에 연결하지 못했어요.', 0)
  }

  let body: ApiResponse<T>
  try {
    body = await res.json()
  } catch {
    throw new ApiError('INVALID_RESPONSE', '서버 응답을 읽지 못했어요.', res.status)
  }

  if (!body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? '알 수 없는 오류가 발생했어요.',
      res.status,
    )
  }
  return body.data
}
