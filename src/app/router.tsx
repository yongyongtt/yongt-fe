import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { MainPage } from '@/pages/main/MainPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { RegionDetailPage } from '@/pages/region-detail/RegionDetailPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/regions/:regionCode', element: <RegionDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
