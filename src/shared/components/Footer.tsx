import logo from '@/assets/logo.png'

export function Footer() {
  return (
    <footer className="border-t border-gray-10 bg-gray-5">
      <div className="container-page flex min-h-[165px] items-center">
        <div className="flex w-[277px] shrink-0 items-center gap-3">
          <img src={logo} alt="" className="size-9 rounded-full object-cover opacity-55" />
          <span className="text-[17px] font-bold tracking-[-0.01em] text-gray-70">
            용인 교통 사각지대 진단
          </span>
        </div>
        <div className="flex flex-col gap-2 text-sm tracking-[-0.01em] text-gray-50">
          <p>
            <span className="font-medium text-gray-70">용용톤 2팀</span> · 용인특례시 공공데이터
            연합 해커톤 교통 및 이동수단 트랙
          </p>
          <p>
            데이터 출처: 용인시 공공데이터(용인앱택시, 버스정류장, 생활이동인구) · 공공데이터포털
          </p>
        </div>
      </div>
    </footer>
  )
}
