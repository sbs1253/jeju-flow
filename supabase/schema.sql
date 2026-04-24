-- 제주 문화·행사 트렌드 대시보드 테이블 생성 SQL
-- Supabase SQL Editor에서 실행해주세요

-- 1. 검색 트렌드 (네이버 DataLab)
CREATE TABLE IF NOT EXISTS search_trends (
  id BIGSERIAL PRIMARY KEY,
  keyword_group VARCHAR(50) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  ratio DECIMAL(5,2),
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 공연/축제 데이터 (KOPIS)
CREATE TABLE IF NOT EXISTS performances (
  id BIGSERIAL PRIMARY KEY,
  performance_id VARCHAR(50) UNIQUE,
  title VARCHAR(300) NOT NULL,
  genre VARCHAR(50),
  region VARCHAR(50),
  venue VARCHAR(200),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20),
  poster_url TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI 인사이트 (Gemini 생성)
CREATE TABLE IF NOT EXISTS ai_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(300),
  content TEXT NOT NULL,
  keywords JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 주간 스냅샷 (아카이브)
CREATE TABLE IF NOT EXISTS weekly_snapshots (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  top_keywords JSONB,
  trend_summary TEXT,
  performance_stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_trends_group ON search_trends(keyword_group);
CREATE INDEX IF NOT EXISTS idx_trends_collected ON search_trends(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_performances_region ON performances(region);
CREATE INDEX IF NOT EXISTS idx_performances_genre ON performances(genre);
CREATE INDEX IF NOT EXISTS idx_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_week ON weekly_snapshots(week_start DESC);
