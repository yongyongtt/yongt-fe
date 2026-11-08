import { Link } from 'react-router'
import { paths } from '@/app/paths'
import logo from '@/assets/logo.png'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

export function Header() {
  const { period } = usePeriodParams()

  return (
    <header className="h-16 border-b border-gray-10 bg-white lg:h-24">
      <div className="container-page flex h-full items-center">
        <Link to={paths.main(period)} className="flex items-center gap-2.5 lg:gap-3.5">
          <img src={logo} alt="" className="size-9 rounded-full object-cover lg:size-12" />
          <span className="flex flex-col">
            <span className="text-[17px] leading-5 font-bold tracking-[-0.03em] text-gray-90 lg:text-[22px] lg:leading-[26px]">
              용인 교통 사각지대 진단
            </span>
            <span className="mt-1 text-[10px] leading-3 font-medium tracking-[0.04em] text-gray-50 lg:mt-1.5 lg:text-xs lg:leading-[14px]">
              YONGIN MOBILITY GAP
            </span>
          </span>
        </Link>
      </div>
    </header>
  )
}
