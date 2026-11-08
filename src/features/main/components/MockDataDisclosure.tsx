import noticeIcon from '@/assets/main/notice.svg'
import { MAIN_MOCK_NOTICE } from '../mocks'

export function MockDataDisclosure() {
  return (
    <aside
      aria-label="시연용 데이터 안내"
      className="flex min-h-[52px] animate-fade-up items-start gap-3 rounded-[10px] bg-gray-5 px-5 py-4 text-sm leading-5 text-gray-60 [animation-delay:440ms]"
    >
      <img src={noticeIcon} alt="" aria-hidden className="mt-0.5 shrink-0" />
      <div>
        <p>{MAIN_MOCK_NOTICE}</p>
        <p className="mt-1">
          KPI는 목업 5개 지역 기준이며, 취약지역 수는 시연용 유형 분류로 집계합니다.
        </p>
      </div>
    </aside>
  )
}
