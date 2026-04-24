# Jeju Flow (제주 문화 트렌드 대시보드)

제주 지역의 문화, 행사, 축제 트렌드를 분석하고 AI 인사이트를 제공하는 **하이엔드 에디토리얼 대시보드**입니다. 네이버 데이터랩 검색 트렌드와 KOPIS 공연 데이터를 결합하여 제주만의 독특한 문화 인사이트를 추출합니다.

> 🛠️ **[프로젝트 시작 및 에이전트 설정 가이드 바로가기](./GUIDE.md)**

## ✨ 주요 기능
- **데이터 기반 트렌드 분석**: 네이버 DataLab API를 활용하여 제주 문화 관련 주요 키워드(공연, 축제, 체험 등)의 검색량 변화 추이 추적
- **공연/축제 정보 수집**: KOPIS API를 연동하여 제주 지역의 최신 공연 정보, 장르별, 지역별 분포 통계 제공
- **AI 인사이트 자동 생성**: 수집된 검색 트렌드와 공연 데이터를 바탕으로 Google Gemini AI가 창의적인 문화 행사 기획 아이디어 및 트렌드 요약 리포트 생성
- **고대비 에디토리얼 테마**: Niccolo Miranda 스타일의 고급스러운 빈티지 신문 테마('Newspaper Mode')를 홈 화면에 적용하여 차별화된 사용자 경험 제공
- **주간 스냅샷 아카이빙**: 매주 트렌드 데이터와 인사이트를 분석하여 기록(Archive) 및 과거 흐름 비교

## 🛠 기술 스택
- **프론트엔드**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Recharts
- **백엔드/API**: Next.js Route Handlers, Supabase (PostgreSQL)
- **외부 연동**:
  - Naver DataLab API (검색 트렌드)
  - KOPIS API (공연 정보)
  - Google Gemini API (AI 분석)
- **자동화**: GitHub Actions (Cron)

## 📦 설치 및 실행 방법

### 1. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 아래의 변수들을 입력합니다.

```env
# 데이터 모드 (true 시 API를 호출하지 않고 샘플 데이터로 UI 테스트 가능)
USE_SAMPLE_DATA=false
CRON_SECRET=your-random-string

# Supabase (데이터베이스)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Keys
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
KOPIS_API_KEY=your-kopis-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### 2. 데이터베이스 설정 (Supabase)
Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql` 스크립트를 실행하여 필요한 테이블들을 생성합니다.

### 3. 패키지 설치 및 실행
```bash
npm install
npm run dev
```
접속: `http://localhost:3000`

## 📊 데이터 수집 자동화
매일 또는 매주 최신 데이터를 수집하기 위해 `/api/cron/collect` 엔드포인트를 호출할 수 있습니다. 
`.github/workflows/collect-data.yml`을 통해 GitHub Actions로 스케줄링 설정이 포함되어 있습니다.

## 📝 출처 표기
- 본 대시보드의 검색 트렌드 데이터는 **네이버 데이터랩(Naver DataLab)**을 활용하였습니다.
- 공연 정보 데이터 출처: **(재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr)**

---
> **포트폴리오 정보**
> 이 프로젝트는 고급 데이터 시각화와 AI 활용 능력을 보여주기 위해 제작된 대시보드 애플리케이션입니다.
