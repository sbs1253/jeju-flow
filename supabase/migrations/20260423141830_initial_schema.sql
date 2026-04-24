-- 제주 문화·행사 트렌드 대시보드 테이블 생성 및 RLS 정책

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

-- RLS (Row Level Security) 설정
-- 대시보드 클라이언트에서는 조회만 가능하도록 허용
-- 데이터 삽입/수정/삭제는 Vercel Cron (Service Role Key)에서만 가능하도록 설정

ALTER TABLE search_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_snapshots ENABLE ROW LEVEL SECURITY;

-- 익명 사용자(anon) 조회 허용
CREATE POLICY "Allow public read-only access for search_trends" ON search_trends FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for performances" ON performances FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for ai_insights" ON ai_insights FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for weekly_snapshots" ON weekly_snapshots FOR SELECT USING (true);

-- (Service Role Key를 사용할 때는 자동으로 RLS를 우회하므로 INSERT/UPDATE/DELETE 정책을 굳이 만들 필요가 없습니다.)
