# [PLAN] TestSprite 진단 결과 기반 프로젝트 전체 디버깅 및 고도화

TestSprite AI 테스트 결과 발견된 5가지 핵심 결함(Navigation, Data Visibility, Analytics update, Filter UI)을 해결하고 프로젝트의 완성도를 높입니다.

## User Review Required

> [!IMPORTANT]
> - **Navigation**: 사이드바 로고 클릭 시 홈 이동이 되지 않던 문제를 수정합니다.
> - **Data Clarity**: 공연 상세 정보의 레이블을 한/영 병기하여 가독성과 테스트 가시성을 확보합니다.
> - **Statistics Enhancement**: 통계 페이지에 기간 선택 필터를 추가하여 더 정밀한 분석이 가능하도록 개선합니다.

## Proposed Changes

### 1. [Layout] 사이드바 내비게이션 수정
#### [MODIFY] [DashboardLayout.tsx](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/components/layout/DashboardLayout.tsx)
- 사이드바 상단 로고 영역(`Jeju Flow`)을 `<Link href="/">`로 감싸 홈 이동 기능을 활성화합니다.

### 2. [Page] 통계 페이지 필터 고도화
#### [MODIFY] [statistics/page.tsx](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/app/statistics/page.tsx)
- `TrendFilters` 인터페이스에 따른 기간(7, 14, 30, 90일) 선택 탭을 추가합니다.
- 선택된 기간을 `useTrends` 및 `useInsights` 훅에 전달하여 차트와 AI 인사이트가 동적으로 업데이트되도록 수정합니다.

### 3. [Component] 공연 상세 정보 가시성 개선
#### [MODIFY] [PerformanceCard.tsx](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/components/cards/PerformanceCard.tsx)
- `RUNTIME` -> `RUNTIME · 러닝타임`
- `PRICE` -> `PRICE · 티켓가격`
- 레이블을 보완하여 사용자 및 테스트 봇이 정보를 더 쉽게 식별할 수 있도록 합니다.

### 4. [API] AI 인사이트 캐시 로직 보완
#### [MODIFY] [insights/route.ts](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/app/api/insights/route.ts)
- `GET` 요청 시 요청된 `filterKey`에 해당하는 데이터가 없을 경우, 무조건 기본값을 반환하는 대신 '데이터 없음' 상태를 명확히 하여 클라이언트에서 분석 유도를 할 수 있도록 조정하거나, 더 지능적인 폴백을 적용합니다.

## Verification Plan

### Automated Tests
- `npx tsc --noEmit`
- TestSprite 재실행 (TC009, TC010, TC011, TC015 통과 확인)

### Manual Verification
- 사이드바 로고 클릭 시 대시보드 복귀 확인.
- 통계 페이지에서 기간 변경 시 차트가 새로고침되는지 확인.
- 공연 상세 모달에서 러닝타임과 가격 정보가 정상 노출되는지 확인.
