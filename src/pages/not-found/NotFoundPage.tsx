import { Link } from 'react-router'
import { paths } from '@/app/paths'

export function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-32 text-center">
      <p className="text-2xl font-bold">페이지를 찾을 수 없습니다.</p>
      <p className="mt-2 text-gray-60">주소가 변경되었거나 존재하지 않는 페이지입니다.</p>
      <Link to={paths.main()} className="mt-6 font-medium text-primary-60 underline">
        메인으로 가기
      </Link>
    </div>
  )
}
