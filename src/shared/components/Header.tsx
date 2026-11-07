import { Link } from 'react-router'
import { paths } from '@/app/paths'
import logo from '@/assets/logo.png'
import { usePeriodParams } from '@/shared/hooks/usePeriodParams'

export function Header() {
  const { period } = usePeriodParams()

  return (
    <header className="h-24 border-b border-gray-10 bg-white">
      <div className="container-page flex h-full items-center">
        <Link to={paths.main(period)} className="flex items-center gap-3.5">
          <img src={logo} alt="" className="size-12 rounded-full object-cover" />
          <span className="flex flex-col">
            <span className="text-[22px] leading-[26px] font-bold tracking-[-0.03em] text-gray-90">
              용인 교통 사각지대 진단
            </span>
            <span className="mt-1.5 text-xs leading-[14px] font-medium tracking-[0.04em] text-gray-50">
              YONGIN MOBILITY GAP
            </span>
          </span>
        </Link>
      </div>
    </header>
  )
}
