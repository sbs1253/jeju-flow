# Architecture & Data Strategy

## 1. Overview
제주 플로우(Jeju Flow)는 실시간 검색 트렌드와 공연 공급 데이터를 결합하여 인사이트를 제공하는 지능형 대시보드입니다.

## 2. Data Strategy: Hybrid On-Demand Fetching

본 프로젝트는 데이터의 최신성과 저장 효율성을 극대화하기 위해 **하이브리드 온디맨드 페칭(Hybrid On-Demand Fetching)** 전략을 사용합니다.

### 2.1. 데이터 저장 계층 (Supabase)
- **대상**: 검색 트렌드 데이터, 공연 메타데이터(목록용), AI 인사이트 결과.
- **역할**: 빠른 목록 조회, 필터링, 통계 계산 및 과거 데이터 아카이빙.
- **공연 테이블 스키마**:
  - `title`, `genre`, `region`, `venue`, `start_date`, `end_date`, `status`, `poster_url` 등 핵심 필드만 저장.

### 2.2. 실시간 데이터 계층 (KOPIS API)
- **대상**: 공연 상세 정보 (출연진, 제작진, 가격, 상세 소개 이미지, 예매 링크).
- **역할**: 사용자가 특정 공연의 상세 보기를 요청할 때 실시간으로 데이터를 보완.
- **작동 방식**:
  1. 클라이언트가 `PerformanceCard`를 렌더링할 때는 DB 데이터를 사용.
  2. 상세 팝업(`Dialog`) 오픈 시, `mt20id`를 기반으로 `/api/performances/[id]` 호출.
  3. API 라우트에서 KOPIS 서버에 직접 쿼리하여 최신 XML 수신 및 JSON 파싱.
  4. 클라이언트에서 DB 데이터와 API 데이터를 병합(Merge)하여 노출.

### 2.3. 이점
- **무결성**: 가격 정보나 출연진 변경 사항을 별도의 동기화 로직 없이 항상 최신 상태로 유지.
- **효율성**: 모든 공연의 상세 텍스트와 고해상도 이미지 경로를 DB에 저장하지 않아 스토리지 비용 절감.
- **성능**: 목록 조회 시에는 가벼운 DB 데이터만 가져오므로 초기 로딩 속도 최적화.

## 3. UI/UX Principles
- **Editorial Design**: 잡지 스타일의 고해상도 타이포그래피와 레이아웃.
- **Mobile First**: Safe Area와 Dynamic Viewport 단위를 사용하여 아이폰 및 모바일 브라우저 최적화.
- **Glassmorphism**: 배경 블러 및 반투명 요소를 활용한 프리미엄 디자인.

## 4. Monitoring & Analytics
- **Vercel Analytics**: 실제 사용자 트래픽 분석 및 웹 바이탈(Web Vitals) 성능 모니터링을 통한 최적화 기반 마련.

