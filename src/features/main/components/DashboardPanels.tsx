import { Card } from '@/shared/components/Card'

/** 각 기능 브랜치에서 채울 기본 배치. 아직 작동하지 않는 조작 버튼은 표시하지 않는다. */
export function DashboardPanels() {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1000fr)_minmax(0,416fr)]">
      <Card className="flex min-h-[480px] min-w-0 flex-col xl:min-h-[816px]">
        <h2 className="border-b border-gray-10 px-7 py-5 text-lg font-bold">종합 취약도</h2>
        <div className="m-7 flex flex-1 items-center justify-center rounded-[10px] border border-gray-10 bg-gray-5 p-6 text-center">
          <div>
            <p className="font-bold text-gray-70">지역별 취약도 지도</p>
            <p className="mt-2 text-sm leading-6 text-gray-50">지도를 준비하고 있습니다.</p>
          </div>
        </div>
        <p className="px-7 pb-6 text-[13px] leading-5 text-gray-50">
          지도는 시연용 가상 도형으로 제공될 예정입니다.
        </p>
      </Card>
      <Card className="flex min-h-[400px] min-w-0 flex-col xl:min-h-[816px]">
        <div className="border-b border-gray-10 px-6 pt-6 pb-7">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">우선 해결 지역</h2>
            <span className="rounded-md bg-danger-5 px-2.5 py-1 text-[13px] font-medium text-danger-60">
              TOP 10
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-50">종합 취약도가 높은 순서입니다.</p>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-gray-50">
          지역 순위와 AI 미리보기를 준비하고 있습니다.
        </div>
        <p className="mx-6 mb-6 rounded-lg bg-gray-5 px-4 py-3.5 text-sm leading-[21px] text-gray-50">
          지도나 목록에서 선택한 지역의 요약 정보와 AI 미리보기가 이곳에 표시될 예정입니다.
        </p>
      </Card>
    </div>
  )
}
