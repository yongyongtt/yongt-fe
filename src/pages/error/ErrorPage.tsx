import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'
import { paths } from '@/app/paths'
import { cx } from '@/shared/utils/cx'

type ErrorKind = 'not-found' | 'unexpected'

const CONTENT: Record<ErrorKind, { code: string; title: string; description: string }> = {
  'not-found': {
    code: '404 ERROR',
    title: '페이지를 찾을 수 없습니다.',
    description:
      '주소가 잘못 입력되었거나, 변경 또는 삭제되어 요청하신 페이지를 찾을 수 없습니다. 입력하신 주소가 정확한지 다시 한번 확인해 주십시오.',
  },
  unexpected: {
    code: 'ERROR',
    title: '일시적인 오류가 발생했습니다.',
    description:
      '서비스 이용에 불편을 드려 죄송합니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주십시오.',
  },
}

type ErrorPageProps = {
  kind: ErrorKind
  /** 개발 중에만 화면 아래에 보여 줄 오류 내용 */
  error?: unknown
}

/** 없는 주소(404)와 예상하지 못한 오류 화면 */
export function ErrorPage({ kind, error }: ErrorPageProps) {
  const navigate = useNavigate()
  const { code, title, description } = CONTENT[kind]
  // 사이트 안에서 이동해 온 경우에만 '이전 페이지' 버튼을 보여 줌 (주소 직접 입력이면 없음)
  const canGoBack = (window.history.state?.idx ?? 0) > 0

  return (
    <section className="container-page flex flex-col items-center py-20 text-center lg:py-32">
      <title>{`${title} · 용인 교통 사각지대 진단`}</title>
      <BrokenRouteIllustration className="w-[200px] animate-fade-up lg:w-[240px]" />

      <p className="mt-8 animate-fade-up text-sm font-bold tracking-[0.12em] text-primary-50 [animation-delay:80ms]">
        {code}
      </p>
      <h1 className="mt-3 animate-fade-up text-[26px] leading-9 font-bold tracking-[-0.02em] text-gray-90 [animation-delay:120ms] lg:text-[34px] lg:leading-[46px]">
        {title}
      </h1>
      <p className="mt-4 max-w-[560px] animate-fade-up text-[15px] leading-7 text-pretty text-gray-60 [animation-delay:160ms] lg:text-[17px]">
        {description}
      </p>

      <div className="mt-10 flex w-full animate-fade-up flex-col gap-3 [animation-delay:200ms] sm:w-auto sm:flex-row">
        {kind === 'unexpected' ? (
          <button type="button" onClick={() => window.location.reload()} className={button.primary}>
            새로고침
          </button>
        ) : (
          <Link to={paths.main()} className={button.primary}>
            메인으로 가기
          </Link>
        )}
        {kind === 'unexpected' ? (
          <Link to={paths.main()} className={button.secondary}>
            메인으로 가기
          </Link>
        ) : (
          canGoBack && (
            <button type="button" onClick={() => navigate(-1)} className={button.secondary}>
              이전 페이지
            </button>
          )
        )}
      </div>

      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-10 max-w-full overflow-x-auto rounded bg-gray-5 px-4 py-3 text-left text-xs text-gray-60">
          {error.stack ?? error.message}
        </pre>
      )}
    </section>
  )
}

/** 라우터 errorElement용. 404 응답이면 없는 페이지, 그 외는 일시적 오류 화면 */
export function RouteErrorPage() {
  const error = useRouteError()
  const kind = isRouteErrorResponse(error) && error.status === 404 ? 'not-found' : 'unexpected'
  return <ErrorPage kind={kind} error={error} />
}

const buttonBase =
  'inline-flex h-12 items-center justify-center rounded px-6 text-[15px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2 focus-visible:outline-none'

const button = {
  primary: cx(buttonBase, 'bg-primary-50 text-white hover:bg-primary-60'),
  secondary: cx(buttonBase, 'border border-gray-20 bg-white text-gray-80 hover:bg-gray-5'),
}

/** 끊긴 노선 그림 (출발점 → 끊긴 구간 → 도착 핀) */
function BrokenRouteIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 140" fill="none" aria-hidden className={className}>
      <path
        d="M28 110C64 110 70 62 102 62"
        className="stroke-primary-50"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 11"
      />
      <path
        d="M138 62C172 62 176 44 206 40"
        className="stroke-gray-30"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 11"
      />
      <circle cx="28" cy="110" r="9" className="fill-white stroke-primary-50" strokeWidth="4" />
      <path
        d="M212 10c-10 0-18 8-18 18 0 13 18 29 18 29s18-16 18-29c0-10-8-18-18-18Z"
        className="fill-gray-20"
      />
      <circle cx="212" cy="28" r="6.5" className="fill-white" />
      <circle
        cx="120"
        cy="62"
        r="16"
        className="fill-danger-5 stroke-danger-50"
        strokeWidth="2.5"
      />
      <path d="M120 54v9.5" className="stroke-danger-50" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="120" cy="69" r="1.6" className="fill-danger-50" />
    </svg>
  )
}
