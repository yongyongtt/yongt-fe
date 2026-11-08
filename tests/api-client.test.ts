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
