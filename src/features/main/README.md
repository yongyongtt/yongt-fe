# 메인 데이터 계층

- `api.ts`: README에 명시된 dashboard/map/preview 경로와 `USE_MOCK` 분기.
- `hooks.ts`: 기간별 Query 캐시, 선택 전 미리보기 조회 비활성화. 이전 기간/지역 데이터를 placeholder로 유지하지 않는다.
- `mocks.ts`: 상세의 기존 목업 함수를 재사용한다. 상세 및 shared 파일은 변경하지 않는다.
- `types.ts`: 현재 UI용 임시 응답 모델. 백엔드 `docs/api-spec.md`가 이 저장소에 없으므로 실제 응답과 필드 대조가 필요하다. 실제 API 연동 검증은 아직 수행하지 않았다.

## 목업 범위

2025년 연간(`month: null`) 및 2월, 원삼면/백암면/양지면/포곡읍/풍덕천1동만 제공한다.
지역·기간·점수·전체 지역 기준 순위·추천은 상세 목업을 따른다. 따라서 TOP10은 현재 최대 5개이며 순위에는 간격이 있다.
분석 대상 수와 평균은 이 5개 표본에서 계산한다. 취약지역 수는 시연용으로 상세 유형이 '양호형'이 아닌 표본 수를 사용하며 실제 판정 기준이 아니다.
포곡읍은 추천 없음(`null`), 백암면은 낮은 신뢰도, 풍덕천1동은 현행 유지 사례다.

지역 코드 목록만 메인에 선언했다. 상세 목업은 지역 목록을 export하지 않아 전체 목록을 직접 재사용할 수 없으며, 향후 지역 추가 시 이 목록도 맞춰야 한다.
지도 geometry는 이 데이터에 포함하지 않는다. 지도 구현 단계에서 코드로 연결하고 백엔드 행정경계로 교체한다.
UI 구현 시 `MAIN_MOCK_NOTICE`로 가상 지도 및 표본 데이터임을 고지한다.

## 기간 연동

`MainPage`에서 `useDashboard(period)`를 호출하고 응답의 `period.availableMonths`를 기존 `PeriodSelect`에 전달한다.
선택된 기간은 기존 `usePeriodParams`로 URL에서만 관리한다. 조회 중에는 이전 기간의 월 목록을 노출하지 않는다.
지원하지 않는 기간을 URL에 입력하면 오류를 표시하고 기본 연도 연간 조회로 돌아가는 동작을 제공한다.
기간 변경 시 Query 키가 바뀌며, 상세 이동 예시에도 같은 기간을 넘긴다.
지도/순위/미리보기 화면이 추가되면 동일한 `period`를 각 조회 훅에 전달한다.

## 기본 화면

- Figma 최종 메인 v2 `161:826`을 기준으로 `SummaryCards`, `DashboardPanels`, `MockDataDisclosure`를 구성했다.
- KPI는 응답의 summary를 사용하며, 조회 중 Skeleton을 표시하고 데이터 없음과 0을 구분한다.
- 지도/순위 패널은 후속 기능을 위한 자리 표시 상태다. 검색·지도 조작·순위 선택 버튼은 아직 제공하지 않는다.
- Header/Footer/PageHero/Card/PeriodSelect/Skeleton은 기존 공통 컴포넌트를 수정하지 않고 사용한다.
- 기존 공통 푸터의 좁은 화면 줄바꿈과 로고/히어로 장식의 Figma 차이는 이번 변경 범위에서 수정하지 않았다.
- `feature/main-dashboard`는 develop에서 생성한 뒤 미병합 선행 데이터 커밋을 cherry-pick했다. 데이터 PR 병합 후 develop과 대조해 대시보드 변경만 후속 PR에 포함해야 한다.

## 검증

프로젝트 의존성 설치 후 Vite/React Router가 지원하는 Node 환경에서 실행한다.

```bash
npm run build
npm run lint
npx vite build --ssr tests/main-data.test.ts --outDir node_modules/.tmp/main-data-tests
node --test --test-isolation=none node_modules/.tmp/main-data-tests/main-data.test.js
npx vite build --ssr tests/main-period.test.tsx --outDir node_modules/.tmp/main-period-tests
node --test --test-isolation=none node_modules/.tmp/main-period-tests/main-period.test.js
```

테스트는 기존 상세와의 데이터 일치, 기간/지역 오류, 추천 없음/현행 유지/낮은 신뢰도, 캐시 키 분리를 확인한다.
기간 화면 테스트는 URL별 로딩/성공/오류 표시와 상세 링크의 기간 유지를 서버 렌더링으로 확인한다.
