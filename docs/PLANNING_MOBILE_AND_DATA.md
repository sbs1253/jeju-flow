# [기획안] 모바일 UI 최적화 및 데이터 연동 전략 기록

## 1. 개요
아이폰 및 모바일 브라우저에서 발생하는 UI 잘림 현상을 해결하고, 현재의 하이브리드 데이터 연동 방식을 문서화하여 프로젝트의 안정성을 높입니다.

## 2. 모바일 UI 최적화 계획

### DashboardLayout.tsx
- **문제**: 모바일 헤더가 상단 노치(Safe Area)를 고려하지 않아 겹침 현상 발생. `h-screen` 사용으로 인한 하단 잘림 가능성.
- **해결**: 
    - 모바일 전용 헤더에 `pt-[env(safe-area-inset-top)]` 또는 `min-h-[calc(4rem+env(safe-area-inset-top))]` 적용.
    - 전체 컨테이너 높이 단위를 `h-screen`에서 `h-dvh` (Dynamic Viewport Height)로 변경.

### PerformanceCard.tsx (상세 다이얼로그)
- **문제**: 상세 정보 창이 `90vh` 고정으로, 모바일 브라우저 하단 바에 가려지거나 상단이 잘릴 수 있음.
- **해결**:
    - `DialogContent` 높이를 `h-[92dvh]` 또는 `h-[calc(100dvh-2rem)]`으로 조정.
    - 상단 닫기 버튼 및 콘텐츠 영역에 Safe Area padding 추가.
    - 모바일 환경에서의 스크롤 편의성 개선.

## 3. 데이터 연동 전략 문서화 (ARCHITECTURE.md)
- **전략명**: Hybrid On-Demand Fetching
- **내용**: 
    - **Supabase**: 검색/필터링을 위한 핵심 메타데이터(제목, 일시, 장소, 포스터) 저장.
    - **KOPIS API**: 사용자 요청 시 상세 데이터(출연진, 가격, 상세 이미지) 실시간 호출.
    - **이유**: 데이터 무결성 유지 및 저장 공간 효율화.

## 4. 검증 계획
- `npm run build`를 통한 빌드 오류 체크.
- 브라우저 개발자 도구를 통한 모바일 뷰포트(iPhone 14/15 Pro 등) 시뮬레이션 확인.

---
**이 계획을 승인하시면 바로 코드를 작성하겠습니다.**
