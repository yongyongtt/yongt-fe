import { useId } from 'react'
import * as Popover from '@radix-ui/react-popover'
import methodologyIcon from '@/assets/main/methodology.svg'
import { CloseIcon } from '@/shared/components/icons'
import { USE_MOCK } from '@/shared/api/mock'
import { vulnerabilityLevels } from '../map/vulnerability'

export function MethodologyPopover() {
  const id = useId()

  return (
    <Popover.Root>
      <Popover.Trigger className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-gray-20 bg-white px-3.5 text-sm font-medium text-gray-90 hover:bg-gray-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-50 data-[state=open]:border-primary-50">
        <img src={methodologyIcon} alt="" aria-hidden className="shrink-0" />
        분석 기준
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={10}
          collisionPadding={16}
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-notice`}
          className="z-50 max-h-[min(32rem,var(--radix-popover-content-available-height))] w-[min(400px,calc(100vw-32px))] overflow-y-auto overscroll-contain rounded-lg border border-gray-20 bg-white shadow-lg shadow-gray-90/10 outline-none"
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-10 px-5 py-4">
            <h3 id={`${id}-title`} className="text-[15px] font-bold text-gray-90">
              분석 기준
            </h3>
            <Popover.Close
              aria-label="분석 기준 닫기"
              className="flex size-8 shrink-0 items-center justify-center rounded text-gray-70 hover:bg-gray-5 focus-visible:outline-2 focus-visible:outline-primary-50"
            >
              <CloseIcon />
            </Popover.Close>
          </div>
          <div className="space-y-4 p-5 text-[13px] leading-6 break-keep text-gray-60">
            <p id={`${id}-notice`} className="rounded bg-gray-5 px-3 py-2">
              종합 취약도는 점수가 높을수록 취약하며, 아래의 5단계 구간으로 지도 색상을 표시합니다.
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="font-bold text-gray-90">분석 단위</dt>
              <dd>읍·면·동</dd>
              <dt className="font-bold text-gray-90">점수 방향</dt>
              <dd>높을수록 취약</dd>
              <dt className="font-bold text-gray-90">데이터 출처</dt>
              <dd>용인시 공공데이터(용인앱택시, 버스정류장, 생활이동인구) · 공공데이터포털</dd>
            </dl>
            <div>
              <h4 className="mb-2 font-bold text-gray-90">지도 색상 구간</h4>
              <ul className="space-y-1">
                {vulnerabilityLevels.map((level) => (
                  <li key={level.label} className="flex flex-wrap items-center gap-x-2">
                    <span aria-hidden className={`size-3 shrink-0 rounded-sm ${level.swatch}`} />
                    <span className="min-w-14">{level.label}</span>
                    <span>{level.range}점</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-50">
                점수가 없거나 유효하지 않으면 회색으로 표시합니다. 색상 구간은 상단의 취약지역 수
                집계 기준과 별개입니다.
              </p>
            </div>
            {USE_MOCK && (
              <p className="border-t border-gray-10 pt-3 text-xs text-gray-50">
                현재 화면의 점수는 시연용 목업입니다. 지도 경계·위치·면적은 가상 도식이며 실제
                행정경계가 제공되면 교체합니다.
              </p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
