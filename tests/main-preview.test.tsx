import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { DashboardRightPanel } from '../src/features/main/components/DashboardRightPanel'
import { RegionPreviewContent } from '../src/features/main/components/RegionPreviewContent'
import { mainKeys } from '../src/features/main/hooks'
import { mockGetDashboard, mockGetRegionPreview } from '../src/features/main/mocks'
import { getPriorityRegions, getRecommendedOptions } from '../src/features/main/preview'
import { initialSelection, selectionReducer } from '../src/features/main/selection'
import type { DashboardRegion } from '../src/features/main/types'
import { ApiError } from '../src/shared/api/client'
import type { Period } from '../src/shared/hooks/usePeriodParams'

const period: Period = { year: 2025, month: null }
const noop = () => {}
const createClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, retryOnMount: false } },
  })
const renderPanel = (
  client: QueryClient,
  code: string | null,
  mode: 'ranking' | 'preview',
  selectedPeriod = period,
) =>
  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DashboardRightPanel
        period={selectedPeriod}
        selectedRegionCode={code}
        mode={mode}
        onSelectRegion={noop}
        onBack={noop}
      />
    </QueryClientProvider>,
  )

test('목록 복귀는 선택과 지도 포커스 요청을 보존하고 같은 지역을 다시 열 수 있다', () => {
  assert.equal(initialSelection.mode, 'ranking')
  const selected = selectionReducer(initialSelection, { type: 'select', regionCode: '4146134000' })
  const back = selectionReducer(selected, { type: 'back' })
  assert.equal(back.mode, 'ranking')
  assert.equal(back.regionCode, selected.regionCode)
  assert.equal(back.focusRequest, selected.focusRequest)
  const reopened = selectionReducer(back, { type: 'select', regionCode: selected.regionCode! })
  assert.equal(reopened.mode, 'preview')
  assert.equal(reopened.focusRequest?.version, 2)
  const next = selectionReducer(reopened, { type: 'select', regionCode: '4146135000' })
  assert.equal(next.regionCode, '4146135000')
  assert.equal(next.focusRequest?.version, 3)
})

test('우선 순위는 점수 순서로 최대 10개이며 null은 빼고 0점과 기존 순위는 보존한다', () => {
  const base: DashboardRegion = {
    regionCode: 'a',
    regionName: '지역',
    gu: '처인구',
    score: 0,
    rank: 35,
  }
  const regions = [
    { ...base, score: null },
    { ...base, regionCode: 'zero' },
    { ...base, regionCode: 'high', score: 70, rank: 3 },
  ]
  const result = getPriorityRegions(regions)
  assert.deepEqual(
    result.map((region) => region.regionCode),
    ['high', 'zero'],
  )
  assert.equal(result[1].rank, 35)
  assert.equal(regions[0].score, null)
  assert.equal(
    getPriorityRegions(
      Array.from({ length: 15 }, (_, index) => ({
        ...base,
        regionCode: String(index),
        score: index,
      })),
    ).length,
    10,
  )
})

test('추천 조합은 상세의 추천된 대안만 사용하고 제외 대안은 표시하지 않는다', async () => {
  const preview = await mockGetRegionPreview('4146134000', period)
  assert.deepEqual(
    getRecommendedOptions(preview.recommendation!).map((option) => option.name),
    ['똑버스', '행복택시'],
  )
  const html = renderToStaticMarkup(<RegionPreviewContent preview={preview} period={period} />)
  assert.ok(html.includes('추천 근거 요약'))
  assert.ok(!html.includes('노선버스'))
  assert.ok(!html.includes('정류장 추가'))
})

test('기본 목록은 5개 목업의 실제 순위를 유지한다', async () => {
  const client = createClient()
  try {
    client.setQueryData(mainKeys.dashboard(period), await mockGetDashboard(period))
    const html = renderPanel(client, null, 'ranking')
    assert.equal((html.match(/data-region-code=/g) ?? []).length, 5)
    assert.ok(html.includes('18점 · 35위'))
    assert.ok(!html.includes('선택 지역 미리보기'))
  } finally {
    client.clear()
  }
})

test('추천 없음·현행 유지·낮은 신뢰도를 기존 상세 목업대로 표시한다', async () => {
  const [none, keep, low] = await Promise.all(
    ['4146125000', '4146551000', '4146135000'].map((code) => mockGetRegionPreview(code, period)),
  )
  const render = (preview: typeof none) =>
    renderToStaticMarkup(<RegionPreviewContent preview={preview} period={period} />)
  assert.ok(render(none).includes('생성된 AI 추천이 없습니다.'))
  const keepHtml = render(keep)
  assert.ok(keepHtml.includes('현행 유지'))
  assert.ok(!keepHtml.includes('똑버스'))
  assert.ok(render(low).includes('지표 신뢰도가 낮아요'))
})

test('지역을 바꿔 렌더링하면 이전 지역 대신 해당 키의 미리보기만 표시한다', async () => {
  const client = createClient()
  try {
    const [a, b] = await Promise.all(
      ['4146134000', '4146136000'].map((code) => mockGetRegionPreview(code, period)),
    )
    client.setQueryData(mainKeys.preview(a.header.regionCode, period), a)
    client.setQueryData(mainKeys.preview(b.header.regionCode, period), b)
    assert.ok(renderPanel(client, a.header.regionCode, 'preview').includes('>원삼면</h3>'))
    const html = renderPanel(client, b.header.regionCode, 'preview')
    assert.ok(html.includes('>양지면</h3>'))
    assert.ok(!html.includes('>원삼면</h3>'))
  } finally {
    client.clear()
  }
})

test('조회 중이나 오류에서도 목록 복귀를 제공하며 이전 추천을 보여주지 않는다', () => {
  const client = createClient()
  try {
    const code = 'unknown'
    const pending = renderPanel(client, code, 'preview')
    assert.ok(pending.includes('선택 지역 진단을 불러오는 중입니다.'))
    assert.ok(pending.includes('우선 해결 지역 목록으로 돌아가기'))
    const query = client.getQueryCache().find({ queryKey: mainKeys.preview(code, period) })!
    query.setState({
      status: 'error',
      fetchStatus: 'idle',
      error: new ApiError('REGION_NOT_FOUND', '없는 지역', 404),
    })
    const error = renderPanel(client, code, 'preview')
    assert.ok(error.includes('미리보기 다시 불러오기'))
    assert.ok(error.includes('우선 해결 지역 목록으로 돌아가기'))
    assert.ok(!error.includes('추천 대안 조합'))
  } finally {
    client.clear()
  }
})

test('기간별 미리보기는 해당 기간 점수를 표시한다', async () => {
  const client = createClient()
  try {
    const monthly = { year: 2025, month: 2 }
    const code = '4146134000'
    const [annual, month] = await Promise.all([
      mockGetRegionPreview(code, period),
      mockGetRegionPreview(code, monthly),
    ])
    client.setQueryData(mainKeys.preview(code, period), annual)
    client.setQueryData(mainKeys.preview(code, monthly), month)
    assert.ok(renderPanel(client, code, 'preview').includes('종합 68점'))
    assert.ok(renderPanel(client, code, 'preview', monthly).includes('종합 71점'))
  } finally {
    client.clear()
  }
})
