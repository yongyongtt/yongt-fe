import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { DashboardRightPanel } from '../src/features/main/components/DashboardRightPanel'
import type { PlanMapRegion } from '../src/features/main/integrated-plans/data'
import { RegionPreviewContent } from '../src/features/main/components/RegionPreviewContent'
import { mainKeys } from '../src/features/main/hooks'
import {
  mockGetDashboard,
  mockGetDashboardMap,
  mockGetRegionPreview,
} from '../src/features/main/mocks'
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
  planRegions?: ReadonlyMap<string, PlanMapRegion>,
) =>
  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DashboardRightPanel
        period={selectedPeriod}
        selectedRegionCode={code}
        mode={mode}
        onSelectRegion={noop}
        onBack={noop}
        planRegions={planRegions}
      />
    </QueryClientProvider>,
  )

test('통합 최적안 태그는 지역 코드로 연결하고 대시보드 순위와 점수는 유지한다', async () => {
  const client = createClient()
  const dashboard = await mockGetDashboard(period)
  client.setQueryData(mainKeys.dashboard(period), dashboard)
  const [first, second] = getPriorityRegions(dashboard.topRegions)
  const planRegions = new Map<string, PlanMapRegion>([
    [
      second.regionCode,
      { regionCode: second.regionCode, status: 'INCLUDED', mode: 'DRT', categoryName: '똑버스' },
    ],
    [
      first.regionCode,
      { regionCode: first.regionCode, status: 'OVER_BUDGET', mode: null, categoryName: '예산 밖' },
    ],
  ])
  const markup = renderPanel(client, null, 'ranking', period, planRegions)
  assert.ok(
    markup.includes(
      `${first.regionName} · ${first.gu} · ${first.score}점 · ${first.rank}위 · 예산 밖`,
    ),
  )
  assert.ok(
    markup.includes(
      `${second.regionName} · ${second.gu} · ${second.score}점 · ${second.rank}위 · 똑버스`,
    ),
  )
  assert.ok(markup.indexOf(first.regionName) < markup.indexOf(second.regionName))
  assert.match(markup, /TOP 10/)
})

test('목록 복귀는 선택과 지도 포커스 요청을 보존하고 같은 지역을 다시 열 수 있다', () => {
  assert.equal(initialSelection.mode, 'ranking')
  const selected = selectionReducer(initialSelection, {
    type: 'select',
    regionCode: '4146134000',
    focusMap: true,
  })
  const back = selectionReducer(selected, { type: 'back' })
  assert.equal(back.mode, 'ranking')
  assert.equal(back.regionCode, selected.regionCode)
  assert.equal(back.focusRequest, selected.focusRequest)
  const reopened = selectionReducer(back, {
    type: 'select',
    regionCode: selected.regionCode!,
    focusMap: true,
  })
  assert.equal(reopened.mode, 'preview')
  assert.equal(reopened.focusRequest?.version, 2)
  const next = selectionReducer(reopened, {
    type: 'select',
    regionCode: '4146135000',
    focusMap: true,
  })
  assert.equal(next.regionCode, '4146135000')
  assert.equal(next.focusRequest?.version, 3)
})

test('지도 직접 선택은 미리보기만 바꾸고 이전 확대 요청을 유지한다', () => {
  const first = selectionReducer(initialSelection, {
    type: 'select',
    regionCode: '4146134000',
    focusMap: false,
  })
  assert.equal(first.focusRequest, null)
  assert.equal(first.mode, 'preview')
  const ranked = selectionReducer(first, {
    type: 'select',
    regionCode: '4146135000',
    focusMap: true,
  })
  const clicked = selectionReducer(ranked, {
    type: 'select',
    regionCode: '4146136000',
    focusMap: false,
  })
  assert.equal(clicked.regionCode, '4146136000')
  assert.equal(clicked.focusRequest, ranked.focusRequest)
  const next = selectionReducer(clicked, {
    type: 'select',
    regionCode: '4146125000',
    focusMap: false,
  })
  assert.equal(next.regionCode, '4146125000')
  assert.equal(next.focusRequest, ranked.focusRequest)
})

test('TOP10은 1~10위만 표시하고 null은 제외하되 0점과 원래 순위는 보존한다', () => {
  const base: DashboardRegion = {
    regionCode: 'a',
    regionName: '지역',
    gu: '처인구',
    score: 0,
    rank: 10,
  }
  const regions = [
    { ...base, score: null },
    { ...base, regionCode: 'zero' },
    { ...base, regionCode: 'high', score: 70, rank: 3 },
    { ...base, regionCode: 'eleventh', score: 99, rank: 11 },
    { ...base, regionCode: 'thirty-fifth', score: 100, rank: 35 },
    ...[0, -1, 1.5, NaN, Infinity].map((rank) => ({ ...base, rank })),
  ]
  const result = getPriorityRegions(regions)
  assert.deepEqual(
    result.map((region) => region.regionCode),
    ['high', 'zero'],
  )
  assert.equal(result[1].rank, 10)
  assert.equal(regions[0].score, null)
  assert.equal(
    getPriorityRegions(
      Array.from({ length: 15 }, (_, index) => ({
        ...base,
        regionCode: String(index),
        score: index,
        rank: index + 1,
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

test('기본 TOP10 목록에는 1·3·5·7위만 표시하고 35위는 제외한다', async () => {
  const client = createClient()
  try {
    client.setQueryData(mainKeys.dashboard(period), await mockGetDashboard(period))
    const html = renderPanel(client, null, 'ranking')
    assert.equal((html.match(/data-region-code=/g) ?? []).length, 4)
    assert.ok(!html.includes('18점 · 35위'))
    assert.ok(!html.includes('풍덕천1동'))
    assert.ok(!html.includes('선택 지역 미리보기'))
  } finally {
    client.clear()
  }
})

test('35위 지역은 TOP10 응답에서 제외하되 지도와 직접 선택 미리보기에서는 유지한다', async () => {
  const client = createClient()
  try {
    const [dashboard, map, preview] = await Promise.all([
      mockGetDashboard(period),
      mockGetDashboardMap(period),
      mockGetRegionPreview('4146551000', period),
    ])
    assert.ok(!dashboard.topRegions.some((region) => region.rank > 10))
    assert.ok(
      map.regions.some((region) => region.regionCode === '4146551000' && region.rank === 35),
    )
    client.setQueryData(mainKeys.preview('4146551000', period), preview)
    const html = renderPanel(client, '4146551000', 'preview')
    assert.ok(html.includes('>풍덕천1동</h3>'))
    assert.ok(html.includes('18점 · 35위'))
    assert.ok(html.includes('현행 유지'))
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
    assert.ok(error.includes('다시 시도'))
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
