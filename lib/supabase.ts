import { createClient } from "@supabase/supabase-js";

// 서버 컴포넌트 & API Routes용 클라이언트 (service role key)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("⚠️ [Supabase] Missing server environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("⚠️ [Supabase] Missing browser environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// 타입 정의
export interface SearchTrend {
  id: number;
  keyword_group: string;
  keyword: string;
  period_start: string;
  period_end: string;
  ratio: number;
  collected_at: string;
}

export interface Performance {
  id: number;
  performance_id: string;
  title: string;
  genre: string;
  region: string;
  venue: string;
  start_date: string;
  end_date: string;
  status: string;
  poster_url: string | null;
  collected_at: string;
}

export interface AiInsight {
  id: number;
  insight_type: string;
  title: string;
  content: string;
  keywords: string[];
  generated_at: string;
}

export interface WeeklySnapshot {
  id: number;
  week_start: string;
  week_end: string;
  top_keywords: Record<string, number>;
  trend_summary: string;
  performance_stats: Record<string, number>;
  created_at: string;
}
