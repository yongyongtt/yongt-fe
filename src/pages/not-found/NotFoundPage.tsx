import { Link } from 'react-router'
import { paths } from '@/app/paths'

export function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-32 text-center">
      <p className="text-2xl font-bold">페이지를 찾을 수 없어요</p>
      <p className="mt-2 text-gray-60">주소가 바뀌었거나 없는 페이지예요.</p>
      <Link to={paths.main()} className="mt-6 font-medium text-primary-60 underline">
        메인으로 가기
      </Link>
    </div>
  )
}
