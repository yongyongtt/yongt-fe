import * as Popover from '@radix-ui/react-popover'
import { CloseIcon } from '@/shared/components/icons'
import { cx } from '@/shared/utils/cx'
import { TYPE_GUIDES } from '../constants/typeGuides'

/** 유형 이름 옆 (i) 버튼 + 유형 안내 팝업 */
export function TypeGuidePopover({ currentType }: { currentType?: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="사각지대 유형 안내"
        className="flex size-[22px] items-center justify-center rounded-full border border-gray-30 text-xs font-bold text-gray-60 transition-colors hover:border-gray-50 hover:text-gray-90 data-[state=open]:border-primary-50 data-[state=open]:text-primary-50"
      >
        i
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={10}
          className="z-50 w-[440px] origin-(--radix-popover-content-transform-origin) rounded border border-gray-20 bg-white shadow-[0_4px_6px_rgba(30,33,36,0.1)] outline-none data-[state=closed]:animate-dropdown-out data-[state=open]:animate-dropdown-in"
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-1.5">
            <p className="text-[15px] font-bold text-gray-90">사각지대 유형 안내</p>
            <Popover.Close aria-label="닫기" className="text-gray-70 hover:text-gray-90">
              <CloseIcon />
            </Popover.Close>
          </div>
          <p className="border-b border-gray-10 px-5 pb-3 text-[13px] text-gray-50">
            지표가 비슷한 동네끼리 묶고, 묶음마다 이름을 붙였습니다
          </p>

          <ul className="flex flex-col gap-1.5 px-5 pt-4 pb-4">
            {TYPE_GUIDES.map((t) => {
              const isCurrent = t.name === currentType
              return (
                <li
                  key={t.name}
                  className={cx(
                    'rounded-[2px] border px-3.5 py-3',
                    isCurrent ? 'border-primary-50 bg-primary-5' : 'border-transparent',
                  )}
                >
                  <p className="flex items-center gap-2 text-[14px] leading-6 font-bold text-gray-90">
                    {t.name}
                    {isCurrent && (
                      <span className="rounded bg-primary-50 px-2.5 text-[11px] leading-6 text-white">
                        현재 지역
                      </span>
                    )}
                  </p>
                  <p className="text-[13px] leading-[22.5px] text-gray-50">{t.desc}</p>
                </li>
              )
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
