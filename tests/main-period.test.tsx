import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { mainKeys } from '../src/features/main/hooks'
import { SummaryCards } from '../src/features/main/components/SummaryCards'
import { mockGetDashboard } from '../src/features/main/mocks'
import { MainPage } from '../src/pages/main/MainPage'
import { ApiError } from '../src/shared/api/client'

function renderPage(client: QueryClient, url: string) {
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <MainPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('URL 기간으로 로딩을 표시하고 조회 전에는 상세 링크를 표시하지 않는다', () => {
  const client = new QueryClient()
  try {
    const html = renderPage(client, '/?year=2025&month=2')
    assert.ok(html.includes('2025년 2월 데이터를 불러오는 중입니다.'))
    assert.ok(!html.includes('href="/regions/'))
  } finally {
    client.clear()
  }
})

test('연간/월간 URL과 동일한 Query 데이터를 표시하고 임시 상세 링크는 노출하지 않는다', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  try {
    for (const month of [null, 2]) {
      const period = { year: 2025, month }
      client.setQueryData(mainKeys.dashboard(period), await mockGetDashboard(period))
      const search = month === null ? '?year=2025' : '?year=2025&month=2'
      const html = renderPage(client, `/${search}`)
      assert.ok(html.includes(`2025년 ${month === null ? '연간' : '2월'} 데이터를 불러왔습니다.`))
      assert.ok(html.includes(`>${month === null ? '54' : '57'}</span>`))
      assert.ok(!html.includes('상세 페이지 이동 예시'))
      assert.ok(!html.includes('href="/regions/'))
    }
  } finally {
    client.clear()
  }
})

test('KPI는 0점과 점수 데이터 없음을 구분한다', () => {
  const zero = renderToStaticMarkup(
    <SummaryCards
      isPending={false}
      summary={{ totalRegions: 0, vulnerableRegions: 0, averageVulnerabilityScore: 0 }}
    />,
  )
  const missing = renderToStaticMarkup(
    <SummaryCards
      isPending={false}
      summary={{ totalRegions: 0, vulnerableRegions: 0, averageVulnerabilityScore: null }}
    />,
  )
  assert.ok(!zero.includes('데이터 없음'))
  assert.ok(missing.includes('데이터 없음'))
})

test('지원하지 않는 URL 기간은 자동 변경하지 않고 연간 조회 복구 동작을 표시한다', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  })
  try {
    const key = mainKeys.dashboard({ year: 2025, month: 6 })
    const query = client.getQueryCache().build(client, { queryKey: key })
    query.setState({
      status: 'error',
      fetchStatus: 'idle',
      error: new ApiError('PERIOD_NOT_FOUND', '해당 기간의 데이터가 아직 없습니다.', 404),
    })
    const html = renderPage(client, '/?year=2025&month=6')
    assert.ok(html.includes('해당 기간의 데이터가 없습니다.'))
    assert.ok(html.includes('기본 연간 조회로 돌아가기'))
    assert.ok(!html.includes('href="/regions/'))
  } finally {
    client.clear()
  }
})
