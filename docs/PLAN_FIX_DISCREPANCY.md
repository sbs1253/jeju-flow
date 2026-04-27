# [구현 계획] AI 인사이트 및 UI 카드 수치 정합성 최종 해결

대시보드 상단 카드의 성장세(%)와 AI 트렌드 리포트 본문의 수치가 일치하지 않는 문제를 해결하기 위해, AI의 자의적 계산을 차단하고 UI와 동일한 계산 로직을 서버 측으로 단일화합니다.

## 문제 분석
- **원인**: `api/insights`에서 AI에게 원시 데이터 배열(`series`)을 함께 전달함. Gemini가 이 배열을 보고 직접 계산을 시도하면서 UI 로직(15일 vs 15일 평균 비교)과 다른 결과를 도출(할루시네이션).
- **현상**: UI 카드는 `+28.4%`인데 AI 리포트는 `3.5%`로 표기되는 등 데이터 괴리 발생.

## 제안된 변경 사항

### 1. [app/api/insights/route.ts](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/app/api/insights/route.ts) [MODIFY]
- AI에게 전달되는 `trendInput` 객체에서 원시 데이터인 `series` 필드를 **완전히 제거**.
- 오직 서버에서 계산된 `avgRatio`(현재 평균)와 `changeRate`(성장률)만 전달하여 AI가 이를 '팩트'로 인용하게 함.

### 2. [lib/gemini.ts](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/lib/gemini.ts) [MODIFY]
- 프롬프트의 지시사항을 더욱 강력하게 수정: "제공된 데이터 요약의 '변화' 수치를 절대로 수정하지 말고 토씨 하나 틀리지 않게 인용하라"는 지침을 최상단에 배치.

### 3. [ModernOverview.tsx](file:///c:/Users/rokaf/OneDrive/바탕 화면/Dev/바이브코딩/jeju-flow/components/dashboard/ModernOverview.tsx) [MODIFY]
- UI 카드에서 수치를 가져올 때, 가급적 AI 응답(`summary.groupTrends`)에 포함된 수치를 우선 사용하도록 로직 순서 조정.

## 검증 계획

### 자동화 테스트
- `pnpm lint`: 코드 스타일 및 잠재적 에러 체크.
- `pnpm build`: 빌드 시 타입 오류 발생 여부 확인.

### 수동 확인
1. `tests.http`를 사용하여 `POST /api/insights` (force: true) 호출.
2. 반환된 `weekly_summary.summary` 내용 중 % 수치가 서버가 계산한 `changeRate`와 일치하는지 대조.
3. 대시보드 화면을 새로고침하여 카드의 수치와 리포트 내용이 일치하는지 확인.

## 다음 단계
1. `api/insights/route.ts`에서 AI 전달 데이터 축소.
2. `lib/gemini.ts` 프롬프트 가이드 강화.
3. 결과물 최종 확인 및 CHANGELOG 업데이트.
