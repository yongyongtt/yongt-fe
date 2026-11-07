import { Outlet, ScrollRestoration } from 'react-router'
import { Footer } from '@/shared/components/Footer'
import { Header } from '@/shared/components/Header'

/** 모든 페이지 공통 틀: 헤더 + 페이지 내용 + 푸터 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
