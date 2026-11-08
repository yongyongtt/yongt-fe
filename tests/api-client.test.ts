import assert from 'node:assert/strict'
import test from 'node:test'
import { apiGet, ApiError } from '../src/shared/api/client'

const isTimeoutError = (error: unknown) =>
  error instanceof ApiError && error.code === 'TIMEOUT_ERROR' && error.status === 0

test('응답이 없는 요청은 15초 후 중단하고 TIMEOUT_ERROR를 반환한다', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let signal: AbortSignal | undefined
  t.mock.method(globalThis, 'fetch', (_url: unknown, init: RequestInit) => {
    signal = init.signal as AbortSignal
    return new Promise<Response>((_resolve, reject) => {
      signal!.addEventListener('abort', () => reject(signal!.reason), { once: true })
    })
  })

  const result = assert.rejects(apiGet('/dashboard', { year: 2025 }), isTimeoutError)
  t.mock.timers.tick(14_999)
  assert.equal(signal?.aborted, false)
  t.mock.timers.tick(1)
  await result
  assert.equal(signal?.aborted, true)
})

test('헤더를 받은 뒤 응답 본문 수신이 멈춰도 15초 후 중단한다', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    const signal = init.signal as AbortSignal
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"success":true,"data":'))
          signal.addEventListener('abort', () => controller.error(signal.reason), { once: true })
        },
      }),
    )
  })

  const result = assert.rejects(apiGet('/dashboard'), isTimeoutError)
  // fetch의 헤더를 받아 본문을 읽기 시작하도록 한다.
  await Promise.resolve()
  t.mock.timers.tick(15_000)
  await result
})

test('정상 응답의 data·쿼리를 유지하고 완료한 요청의 타이머를 해제한다', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let signal: AbortSignal | undefined
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    assert.equal(url, '/api/dashboard?year=2025')
    signal = init.signal as AbortSignal
    return Response.json({ success: true, data: { regionCount: 38 }, error: null })
  })

  assert.deepEqual(await apiGet('/dashboard', { year: 2025, month: null }), { regionCount: 38 })
  t.mock.timers.tick(15_000)
  assert.equal(signal?.aborted, false)
})

test('네트워크·JSON·백엔드 오류는 기존 코드와 상태를 유지하고 타이머를 해제한다', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const signals: AbortSignal[] = []
  const responses = [
    () => {
      throw new TypeError('network')
    },
    () => new Response('invalid json'),
    () =>
      Response.json(
        { success: false, data: null, error: { code: 'PERIOD_NOT_FOUND', message: '기간 없음' } },
        { status: 404 },
      ),
  ]
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    signals.push(init.signal as AbortSignal)
    return responses.shift()!()
  })

  for (const [code, status] of [
    ['NETWORK_ERROR', 0],
    ['INVALID_RESPONSE', 200],
    ['PERIOD_NOT_FOUND', 404],
  ] as const) {
    await assert.rejects(
      apiGet('/dashboard'),
      (error: unknown) =>
        error instanceof ApiError && error.code === code && error.status === status,
    )
  }
  t.mock.timers.tick(15_000)
  assert.ok(signals.every((signal) => !signal.aborted))
})

test('HTTP 실패에서는 본문이 성공이어도 data를 반환하지 않는다', async (t) => {
  for (const status of [400, 404, 500, 503]) {
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ success: true, data: { regionCount: 38 }, error: null }, { status }),
    )
    await assert.rejects(apiGet('/dashboard'), { name: 'ApiError', code: 'HTTP_ERROR', status })
  }
})

test('성공 응답의 data null은 UNKNOWN 대신 EMPTY_DATA로 구분한다', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ success: true, data: null, error: null }),
  )
  await assert.rejects(apiGet('/dashboard'), { name: 'ApiError', code: 'EMPTY_DATA', status: 200 })
})

test('누락되거나 잘못된 공통 응답은 INVALID_RESPONSE로 거부한다', async (t) => {
  const invalidBodies = [
    null,
    [],
    'not an envelope',
    {},
    { success: 'true', data: {}, error: null },
    { success: 1, data: {}, error: null },
    { success: true, error: null },
    { success: true, data: {} },
    { success: true, data: {}, error: { code: 'ERROR', message: '오류' } },
    { success: false, data: null, error: null },
    { success: false, data: {}, error: { code: 'ERROR', message: '오류' } },
    { success: false, data: null, error: { code: 404, message: '오류' } },
    { success: false, data: null, error: { code: 'ERROR', message: null } },
    { success: false, data: null, error: { code: ' ', message: '오류' } },
  ]
  for (const body of invalidBodies) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body))
    await assert.rejects(apiGet('/dashboard'), {
      name: 'ApiError',
      code: 'INVALID_RESPONSE',
      status: 200,
    })
  }
})

test('HTTP 실패의 HTML·빈 본문·잘못된 JSON도 HTTP_ERROR와 상태를 전달한다', async (t) => {
  for (const body of ['<html>Bad Gateway</html>', '', 'null', '{"success":false}']) {
    t.mock.method(globalThis, 'fetch', async () => new Response(body, { status: 502 }))
    await assert.rejects(apiGet('/dashboard'), {
      name: 'ApiError',
      code: 'HTTP_ERROR',
      status: 502,
    })
  }
})

test('백엔드 실패 코드는 HTTP 성공·실패 모두에서 메시지와 함께 보존한다', async (t) => {
  for (const status of [200, 404, 500]) {
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json(
        { success: false, data: null, error: { code: 'PERIOD_NOT_FOUND', message: '기간 없음' } },
        { status },
      ),
    )
    await assert.rejects(apiGet('/dashboard'), {
      name: 'ApiError',
      code: 'PERIOD_NOT_FOUND',
      message: '기간 없음',
      status,
    })
  }
})

test('0·false·빈 배열 및 내부 필드의 null은 빈 데이터로 오인하지 않는다', async (t) => {
  for (const data of [0, false, '', [], { type: null, recommended: null, summary: null }]) {
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ success: true, data, error: null }),
    )
    assert.deepEqual(await apiGet('/dashboard'), data)
  }
})
