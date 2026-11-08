# 메인 데이터 계층

- `api.ts`: README에 명시된 dashboard/map/preview 경로와 `USE_MOCK` 분기.
- `hooks.ts`: 기간별 Query 캐시, 선택 전 미리보기 조회 비활성화. 이전 기간/지역 데이터를 placeholder로 유지하지 않는다.
- `mocks.ts`: 상세의 기존 목업 함수를 재사용한다. 상세 및 shared 파일은 변경하지 않는다.
- `types.ts`: 현재 UI용 임시 응답 모델. 백엔드 `docs/api-spec.md`가 이 저장소에 없으므로 실제 응답과 필드 대조가 필요하다. 실제 API 연동 검증은 아직 수행하지 않았다.

## 목업 범위

2025년 연간(`month: null`) 및 2월, 원삼면/백암면/양지면/포곡읍/풍덕천1동만 제공한다.
지역·기간·점수·전체 지역 기준 순위·추천은 상세 목업을 따른다. TOP10은 1~10위에 해당하는 4개(1, 3, 5, 7위)만 표시한다. 목업에 없는 순위를 임의로 채우지 않는다. 35위는 지도/검색 선택 시 미리보기에서만 표시한다.
분석 대상 수와 평균은 이 5개 표본에서 계산한다. 취약지역 수는 시연용으로 상세 유형이 '양호형'이 아닌 표본 수를 사용하며 실제 판정 기준이 아니다.
포곡읍은 추천 없음(`null`), 백암면은 낮은 신뢰도, 풍덕천1동은 현행 유지 사례다.

지역 코드 목록만 메인에 선언했다. 상세 목업은 지역 목록을 export하지 않아 전체 목록을 직접 재사용할 수 없으며, 향후 지역 추가 시 이 목록도 맞춰야 한다.
지도 geometry는 점수 응답에 포함하지 않는다. `map/demoRegionShapes.ts`의 가상 도형을 지역 코드로 연결하며 향후 백엔드 행정경계로 교체한다.
UI 구현 시 `MAIN_MOCK_NOTICE`로 가상 지도 및 표본 데이터임을 고지한다.

## 기간 연동

`MainPage`에서 `useDashboard(period)`를 호출하고 응답의 `period.availableMonths`를 기존 `PeriodSelect`에 전달한다.
선택된 기간은 기존 `usePeriodParams`로 URL에서만 관리한다. 조회 중에는 이전 기간의 월 목록을 노출하지 않는다.
지원하지 않는 기간을 URL에 입력하면 오류를 표시하고 기본 연도 연간 조회로 돌아가는 동작을 제공한다.
기간 변경 시 Query 키가 바뀌며, 상세 이동 CTA에도 같은 기간을 넘긴다.
지도/순위/미리보기의 각 조회 훅에 동일한 `period`를 전달한다.

## 기본 화면

- Figma 최종 메인 v2 `161:826`을 기준으로 `SummaryCards`, `DashboardPanels`, `MockDataDisclosure`를 구성했다.
- KPI는 응답의 summary를 사용하며, 조회 중 Skeleton을 표시하고 데이터 없음과 0을 구분한다.
- 우측 순위/AI 패널은 지도 및 검색과 MainPage의 지역 선택 상태를 공유한다. 상세 CTA는 선택 지역과 기간을 유지해 기존 상세 페이지로 이동한다.
- Header/Footer/PageHero/Card/PeriodSelect/Skeleton은 기존 공통 컴포넌트를 수정하지 않고 사용한다.
- 기존 공통 푸터의 좁은 화면 줄바꿈과 로고/히어로 장식의 Figma 차이는 이번 변경 범위에서 수정하지 않았다.
- `feature/main-dashboard`는 develop에서 생성한 뒤 미병합 선행 데이터 커밋을 cherry-pick했다. 데이터 PR 병합 후 develop과 대조해 대시보드 변경만 후속 PR에 포함해야 한다.

## 가상 지도

- Figma 지도 카드 `161:873`의 스타일을 사용하며 지도 내용은 기존 목업 5개 지역에 맞춘 독자적인 시연용 도식이다. 실제 경계·위치·면적을 표현하지 않는다.
- `RegionMapCard`는 기존 `useDashboardMap(period)`로 조회하고 로딩/오류/지역 없음/도형 미연결을 구분한다.
- `MockRegionMap`은 도형과 점수 데이터를 분리해서 받고 코드가 일치하는 지역만 표시한다.
- 클릭 또는 Tab + Enter/Space로 선택한다. `MainPage`의 단일 `selectedRegionCode`로 선택을 관리하며 같은 지역이 존재하면 기간 전환 후에도 선택을 유지하고 우측 미리보기에 연동한다. 지도 직접 선택은 현재 배율·위치를 유지하며, TOP10 선택은 해당 지역으로 확대한다.
- 마우스 hover/키보드 초점에 지역명·구명·점수를 표시한다. 선택 지역은 테두리·안내 문구·`aria-pressed`로 표시한다. 강조 테두리는 모든 도형 위에 별도 레이어로 그려 이웃 경계가 덮지 않게 한다.
- `map/vulnerability.ts`의 0~100점, 20점 간격 5단계는 확정된 지도 색상 구간이다. 높을수록 취약하다. null/잘못된 점수는 회색으로 표시하고 0점과 구분한다. 기존 KPI 취약지역 판정식과는 별개다. 현재 점수와 지도 경계는 목업이다.
- 단계별 색은 `src/styles/index.css`에 지도 전용 토큰 4개를 추가했고 4단계는 기존 danger-50을 재사용한다. 기존 토큰과 shared/상세 파일은 변경하지 않는다.
- 좁은 화면은 지도 폭을 화면에 맞추고 확대/손 도구로 탐색한다. 범례는 지도 아래에 배치해 도형을 가리지 않는다.
- `feature/main-map`도 develop에서 생성 후 선행 데이터/대시보드 커밋을 cherry-pick했다. 선행 PR 병합 후 지도 변경만 PR에 포함되도록 기준 브랜치와 대조한다.

## 검색 및 지도 조작

- `RegionSearch`는 구/읍면동 이름의 공백을 정규화해 현재 기간의 지역을 검색한다. 검색 결과는 현재 가상 도형이 연결된 지역만 제공한다.
- `처인구` 검색은 기존 목업에 있는 원삼면/백암면/양지면/포곡읍 각각을 반환한다. 없는 지역을 새로 만들지 않는다.
- combobox/listbox, 방향키 탐색·Enter 선택·Escape/바깥 클릭/Tab 닫기를 지원한다. IME 조합 중 Enter는 결과 선택으로 처리하지 않는다.
- 결과 선택은 MainPage의 지역 선택과 연동하며 해당 도형을 확대해 화면 안에 표시하고 손 도구를 해제한다. 우측 패널 전체를 선택 지역 AI 미리보기로 전환한다.
- 지도 배율/이동 상태는 RegionMapCard가 보관해 기간 변경·조회 로딩 후에도 유지한다. 검색어는 기간 변경 시 초기화한다.
- 확대/축소는 화면 중심을 유지하며 1~3.5배로 제한한다. 최소 배율로 축소하면 전체 지도로 돌아간다.
- 손 도구는 Pointer Capture로 마우스/터치 이동을 처리한다. 4 CSS px 이상 움직여야 드래그를 시작하며, 손 도구의 포인터 클릭/드래그는 지역 선택을 변경하지 않는다.
- 지도 초점 상태에서 손 도구를 켜고 방향키로 이동할 수 있다. Home은 전체 보기, Escape는 손 도구 해제다. 확대 후 Tab으로 지역을 탐색할 때 라벨이 화면 밖이면 다시 화면 안으로 이동한다. 클릭으로 얻은 초점에서는 이 자동 이동을 수행하지 않는다.
- 검색 팝업은 지도 도구보다 높은 레이어에 있으며 SVG 포인터/키보드 이벤트와 분리한다. 지도 라벨과 강조선은 같은 transform을 사용하고 테두리의 화면상 굵기는 유지한다.
- `feature/main-map-interactions`는 develop에서 생성 후 앞선 로컬 기능 커밋을 가져왔다. 선행 PR 병합 후 이번 변경만 PR에 포함해야 한다. 권한 확인 전 푸시는 보류한다.

## 우선 해결 지역 및 AI 미리보기

- Figma 목록 `161:938`, 미리보기 `179:3710`을 기준으로 작성했다. 미리보기는 최신 프레임의 630px 높이 안에서 본문이 스크롤되며, 목록 복귀와 상세 CTA는 고정 영역에 둔다.
- 목록은 현재 기간의 전체 지역 기준 1~10위만 순위 순서로 표시한다. 목업에서는 1, 3, 5, 7위만 해당하며 35위는 목록에서 제외한다. 11위 이상도 지도/검색을 통해 미리보기를 열 수 있다. 0점은 유효하고 null/잘못된 점수 및 잘못된 순위는 목록에서 제외한다.
- `selectionReducer`는 지도/검색/목록 선택, 패널 모드, 지도 포커스 요청을 관리한다. TOP10 선택만 새 확대 요청을 발행하며 지도 직접 선택은 이전 요청을 그대로 유지한다. 검색 확대는 지도 카드가 처리한다. 같은 지역을 다시 선택해도 미리보기를 다시 열 수 있다.
- 목록 복귀는 지역 선택과 지도 요청을 그대로 유지한다. 지도 컴포넌트는 우측 패널 전환으로 재마운트되지 않으며, 조작한 배율/위치를 보존한다.
- 목록에서 선택한 경우 미리보기의 복귀 버튼으로 초점을 옮긴다. 복귀하면 해당 순위 버튼으로 초점을 돌려준다. 지도/검색 선택에서는 검색 입력이나 지도 초점을 강제로 가져오지 않는다.
- `useRegionPreview`는 지역+기간 키의 조회 결과만 표시한다. 지역/기간 전환 중에는 이전 지역의 추천 대신 Skeleton을 표시하고 오류에서도 목록 복귀/재시도를 제공한다.
- 추천 조합은 상세 목업에서 RECOMMENDED인 대안만 사용한다. 제외 대안이나 Figma의 예시 정책을 새로 만들어 넣지 않는다. 추천 없음/현행 유지/낮은 신뢰도를 구분하며, 낮은 신뢰도 안내는 상세의 기존 컴포넌트를 재사용한다.
- 상세 CTA는 `onOpenRegionDetail(regionCode, period)`를 통해 MainPage의 `navigate(paths.regionDetail(regionCode, period))`에 연결한다. 연간 조회는 month 없이, 월간 조회는 선택 월을 유지한다. 임시 원삼면 상세 링크는 제거했으며 기존 상세 페이지/공통 라우팅은 변경하지 않았다. 컴포넌트 단독 사용 시 콜백이 없으면 준비 중 안내를 표시한다.
- `feature/main-preview`도 최신 develop에서 생성하고 선행 로컬 커밋들을 cherry-pick했다. 앞선 PR 병합 후 이번 기능만 보이도록 대조한다.

## 분석 기준 팝오버

- `MethodologyPopover`는 기존 Radix Popover를 사용한다. Figma `176:2084`에는 버튼만 있어 버튼은 디자인을 따른다. 점수 방향은 '높을수록 취약', 데이터 출처는 기존 푸터와 같은 문구를 사용하며 모델 버전은 표시하지 않는다. 실제 산식이나 가중치를 임의로 추가하지 않는다.
- 지도 색상 구간은 `map/vulnerability.ts`의 범례 데이터를 재사용한다. 실제 취약지역 판정 기준과 구분해 설명한다.
- Portal의 z-50 레이어로 지도 도구(z-10)와 검색(z-30)보다 앞에 표시한다. 지도 SVG 밖에 렌더링하며 내부 포인터/키보드 이벤트의 전파를 차단한다.
- 닫기 버튼·Escape·바깥 클릭을 지원한다. 닫기/Escape 이후 트리거로 초점을 복귀하며, 화면 가장자리 충돌 방지와 내부 스크롤로 좁은 화면에 맞춘다.
- `feature/main-methodology`는 최신 develop에서 생성 후 미병합 선행 작업을 cherry-pick했다. 로컬 커밋만 진행하며 원격 푸시는 보류한다.
- 브라우저에서 열기/닫기 버튼·Escape·바깥 클릭·닫은 뒤 초점 복귀를 확인했다. 손 도구 활성 상태의 팝오버 내부 방향키/드래그는 지도 위치를 바꾸지 않는다. 390px 화면에서도 팝오버가 화면 안에 배치되고 긴 내용은 내부 스크롤로 표시된다.

## 검증

프로젝트 의존성 설치 후 Vite/React Router가 지원하는 Node 환경에서 실행한다.

```bash
npm run build
npm run lint
npx vite build --ssr tests/main-data.test.ts --outDir node_modules/.tmp/main-data-tests
node --test --test-isolation=none node_modules/.tmp/main-data-tests/main-data.test.js
npx vite build --ssr tests/main-period.test.tsx --outDir node_modules/.tmp/main-period-tests
node --test --test-isolation=none node_modules/.tmp/main-period-tests/main-period.test.js
npx vite build --ssr tests/main-map.test.tsx --outDir node_modules/.tmp/main-map-tests
node --test --test-isolation=none node_modules/.tmp/main-map-tests/main-map.test.js
npx vite build --ssr tests/main-map-interactions.test.tsx --outDir node_modules/.tmp/main-map-interactions-tests
node --test --test-isolation=none node_modules/.tmp/main-map-interactions-tests/main-map-interactions.test.js
npx vite build --ssr tests/main-preview.test.tsx --outDir node_modules/.tmp/main-preview-tests
node --test --test-isolation=none node_modules/.tmp/main-preview-tests/main-preview.test.js
```

테스트는 기존 상세와의 데이터 일치, 기간/지역 오류, 추천 없음/현행 유지/낮은 신뢰도, 캐시 키 분리를 확인한다.
기간 화면 테스트는 URL별 로딩/성공/오류 표시와 임시 상세 링크 제거를 확인한다. 실제 CTA 이동은 브라우저에서 월간/연간 URL과 상세 화면의 지역·기간을 확인한다.
지도 테스트는 구간 경계값·점수 없음·목업 코드 일치·선택 표시·도형 누락·로딩/오류/빈 지도 상태를 확인한다.
지도 조작 테스트는 지역 검색, 배율 제한/중심 유지, 이동 제한, 검색·키보드 포커스와 도구 상태를 확인한다. 실제 브라우저에서는 검색 결과 클릭·키보드 선택·Escape, 드래그 시 선택 유지, 방향키/Home, 최대/최소 배율, 모바일 선택과 기간 전환을 확인한다.
미리보기 테스트는 복귀/재선택 상태, 점수 순위, 추천 대안 필터, 3가지 예외 상태, 지역·기간별 Query 결과와 로딩/오류를 확인한다. 브라우저에서는 지도/검색/목록 선택 전환, 목록 복귀 시 지도·초점 유지, 빠른 선택과 모바일 스크롤을 확인한다.
