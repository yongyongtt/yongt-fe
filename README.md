# 용인 교통 사각지대 진단 (yongt-fe)

용용톤 2팀 프론트엔드.
메인 대시보드와 동네 진단 상세 두 화면으로 구성

## 배포 주소: https://yongin-mobility-gap.vercel.app/

- 디자인: Figma `용용톤 2팀` > 디자인 > 최종

## 기술 스택

| 용도        | 사용                         | 메모                                              |
| ----------- | ---------------------------- | ------------------------------------------------- |
| 기본        | React 19 + Vite + TypeScript |                                                   |
| 스타일      | Tailwind CSS v4              | 색·폰트 토큰은 `src/styles/index.css` (KRDS 색상) |
| 라우팅      | React Router                 | `src/app/router.tsx`                              |
| 서버 데이터 | TanStack Query               | 로딩·에러·캐시 처리                               |
| 차트        | Recharts                     | 상세 '미배차율 추이'                              |
| 팝오버      | Radix Popover                | 상세 '유형 안내'                                  |
| 린트·포맷   | oxlint, Prettier             |                                                   |

## 시작하기

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: copy .env.example .env.local
npm run dev                  # http://localhost:5173
```

| 명령                     | 설명             |
| ------------------------ | ---------------- |
| `npm run dev`            | 개발 서버        |
| `npm run build`          | 타입 검사 + 빌드 |
| `npm run lint`           | 코드 검사        |
| `npx prettier --write .` | 코드 정렬        |

### 환경 변수 (`.env.local`)

| 이름                    | 값                      | 설명                                             |
| ----------------------- | ----------------------- | ------------------------------------------------ |
| `VITE_USE_MOCK`         | `true` / `false`        | `true`면 목업 데이터, `false`면 실제 백엔드 호출 |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | 개발 서버가 `/api` 요청을 넘길 백엔드 주소       |

## 브랜치 규칙

- `main`: 발표·배포용. 직접 푸시 금지
- `develop`: 개발 기준. 모든 작업은 여기서 시작해서 여기로 합침
- 작업 브랜치: 기능 하나마다 `develop`에서 새로 만듦

| 접두어     | 용도        | 예시                                              |
| ---------- | ----------- | ------------------------------------------------- |
| `feature/` | 새 기능     | `feature/main-map`, `feature/region-detail-chart` |
| `fix/`     | 버그 수정   | `fix/period-select-reset`                         |
| `docs/`    | 문서        | `docs/readme`                                     |
| `chore/`   | 설정·패키지 | `chore/eslint`                                    |

### 작업 순서

```bash
git switch develop
git pull                            # 최신 develop 받기
git switch -c feature/main-map      # 작업 브랜치 만들기
# 작업 후 커밋
git push -u origin feature/main-map
```

- 깃허브에서 작업 브랜치 → `develop`으로 PR
- 합친 브랜치는 삭제

### 커밋 메시지

`종류: 내용` 형식. 종류는 브랜치 접두어와 같음

```
feature: 메인 지도 색칠 구현
fix: 연도 바꿀 때 월이 초기화되지 않는 문제 수정
```

## 폴더 구조

```
src/
├─ app/
│  ├─ router.tsx        # 라우트 정의
│  ├─ providers.tsx     # TanStack Query 설정
│  └─ paths.ts          # 페이지 주소 만드는 함수 (이동할 때 사용)
├─ layouts/AppLayout.tsx  # 헤더 + 페이지 + 푸터
├─ pages/
│  ├─ main/             # 메인 대시보드  ← 지도 담당
│  ├─ region-detail/    # 동네 진단 상세 ← 상세 담당
│  └─ error/            # 404·오류 화면
├─ features/
│  ├─ main/             # 메인 화면 조각 (컴포넌트, api, 타입, 목업) ← 지도 담당
│  └─ region-detail/    # 상세 화면 조각 ← 상세 담당
├─ shared/              # 두 화면이 같이 쓰는 것 (수정 시 서로 알리기)
│  ├─ api/              # client.ts(공통 요청), mock.ts(목업 도우미)
│  ├─ components/       # Header, Footer, PageHero, PeriodSelect, HeroChip, Card, icons
│  ├─ hooks/            # usePeriodParams (기간 ↔ URL), useMediaQuery (화면 크기)
│  ├─ constants/        # 기본 연도 등
│  └─ utils/
├─ assets/              # 로고, 히어로 그래픽
└─ styles/index.css     # Tailwind + 디자인 토큰
```

## 팀 규칙

### 1. 기간(연도·월)은 URL에 둠

- 형식: `?year=2025&month=2`, 연간(전체)은 `month` 없이 `?year=2025`
- 읽기·바꾸기는 `usePeriodParams()` 하나로만 함

```tsx
const { period, setPeriod } = usePeriodParams() // period = { year: 2025, month: 2 | null }
```

- 월 목록은 백엔드 응답의 `availableMonths`로만 채움 (없는 달을 요청하면 404)

### 2. 페이지 이동은 `paths`로

```tsx
import { paths } from '@/app/paths'

navigate(paths.regionDetail(regionCode, period)) // /regions/4146134000?year=2025&month=2
<Link to={paths.main(period)}>메인</Link>
```

기간을 같이 넘겨야 메인 ↔ 상세를 오가도 고른 기간이 유지됨.

### 3. API 호출은 `apiGet` + 목업 분기

- 백엔드 응답 `{ success, data, error }`에서 `apiGet`이 `data`만 꺼내 줌. 실패하면 `ApiError`(`code`, `status`)를 던짐
- 각 기능의 `api.ts`에서 `USE_MOCK`이면 목업을, 아니면 `apiGet`을 부름

```ts
// features/main/api.ts 예시
import { apiGet } from '@/shared/api/client'
import { USE_MOCK, mockResponse } from '@/shared/api/mock'
import type { Period } from '@/shared/hooks/usePeriodParams'
import { dashboardMock } from './mocks'
import type { Dashboard } from './types'

export function fetchDashboard({ year, month }: Period) {
  if (USE_MOCK) return mockResponse(dashboardMock)
  return apiGet<Dashboard>('/dashboard', { year, month }) // month가 null이면 자동으로 빠짐
}
```

- 컴포넌트에서는 TanStack Query로 부름. `queryKey`에 기간을 넣어야 기간이 바뀔 때 다시 불러옴

```ts
useQuery({ queryKey: ['dashboard', period], queryFn: () => fetchDashboard(period) })
```

### 4. 스타일

- 색은 토큰 이름으로: `text-gray-90`, `bg-primary-50`, `text-danger-50` (임의 hex 금지)
- 본문 폭은 `container-page` 클래스 (1440px 가운데 정렬)
- 상단 파란 영역은 `PageHero`, 기간 선택은 `PeriodSelect`, 흰 카드는 `Card`를 사용
- 모바일 대응: 기본 클래스는 모바일, PC는 `lg:`(1024px 이상)로 덮어씀. 예: `px-5 lg:px-9`
- CSS로 안 되는 경우(차트 옵션 등)만 `useMediaQuery(DESKTOP_QUERY)` 사용

## 메인 페이지 작업 안내 (지도)

1. `src/pages/main/MainPage.tsx`를 채움. 지금 들어 있는 히어로와 예시 카드는 자리 표시용
2. 화면 조각(지도, TOP 10, 미리보기 패널)은 `src/features/main/` 아래에
   - 추천 구성: `components/`, `api.ts`, `hooks.ts`, `types.ts`, `mocks.ts`
3. 쓰는 API (명세: 백엔드 `docs/api-spec.md`)
   - `GET /api/dashboard` — KPI, TOP 10, `availableMonths`
   - `GET /api/dashboard/map` — 38개 지역 점수 (지도 색칠)
   - `GET /api/regions/{regionCode}/preview` — 오른쪽 미리보기 패널
4. 지역 선택 → 상세 이동: `navigate(paths.regionDetail(regionCode, period))`
5. `shared/` 파일을 고쳐야 하면 먼저 이야기

## 디자인 에셋

- 로고: 헤더의 `logo` 레이어 → PNG
- 히어로 그래픽: 상세 페이지 `sv` 안의 `deco · 노선 그래픽` 레이어 → SVG
