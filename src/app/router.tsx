import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { ErrorPage, RouteErrorPage } from '@/pages/error/ErrorPage'
import { MainPage } from '@/pages/main/MainPage'
import { RegionDetailPage } from '@/pages/region-detail/RegionDetailPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // 헤더·푸터까지 깨졌을 때 (레이아웃 없이 오류 화면만)
    errorElement: <RouteErrorPage />,
    children: [
      {
        // 페이지 안에서 오류가 나도 헤더·푸터는 그대로 두고 본문만 오류 화면으로
        errorElement: <RouteErrorPage />,
        children: [
          { path: '/', element: <MainPage /> },
          { path: '/regions/:regionCode', element: <RegionDetailPage /> },
          { path: '*', element: <ErrorPage kind="not-found" /> },
        ],
      },
    ],
  },
])
