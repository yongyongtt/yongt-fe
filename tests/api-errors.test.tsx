import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { apiGet, ApiError } from '../src/shared/api/client'
import { ApiFailureState } from '../src/features/main/components/ApiFailureState'
test('네트워크·시간 초과·빈 데이터 오류 화면은 각각 안내와 재시도를 제공한다', () => {
  for (const [code, title] of [
    ['NETWORK_ERROR', '서버에 연결할 수 없습니다.'],
    ['TIMEOUT_ERROR', '서버 응답이 지연되고 있습니다.'],
    ['EMPTY_DATA', '표시할 데이터가 없습니다.'],
    ['INVALID_RESPONSE', '데이터를 표시할 수 없습니다.'],
  ]) {
    const html = renderToStaticMarkup(
      <ApiFailureState error={new ApiError(code, '오류', 0)} onRetry={() => {}} />,
    )
    assert.ok(html.includes(title))
    assert.ok(html.includes('role="alert"'))
    assert.ok(html.includes('다시 시도'))
  }
})

test('공통 요청의 실제 EMPTY_DATA 오류가 메인 빈 데이터 안내로 연결된다', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ success: true, data: null, error: null }),
  )
  let error: unknown
  try {
    await apiGet('/dashboard')
  } catch (caught) {
    error = caught
  }
  assert.ok(error instanceof ApiError)
  const html = renderToStaticMarkup(<ApiFailureState error={error} onRetry={() => {}} />)
  assert.ok(html.includes('표시할 데이터가 없습니다.'))
  assert.ok(html.includes('다시 시도'))
})
