import { NextRequest, NextResponse } from "next/server";
import sampleInsights from "@/data/sample/insights.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const filterKey = searchParams.get("filter_key");

    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    // ── 1. 필터 기반 캐시 조회 ──
    if (filterKey) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { data: cachedRows } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("filter_key", filterKey)
        .gte("generated_at", todayStart.toISOString())
        .order("generated_at", { ascending: false });

      if (cachedRows && cachedRows.length > 0) {
        const summaryRow = cachedRows.find((r) => r.insight_type === "weekly_summary");
        const jejuIdeas = cachedRows.find((r) => r.insight_type === "jeju_idea");
        const trendKw = cachedRows.find((r) => r.insight_type === "trending_keywords");

        return NextResponse.json({
          weekly_summary: summaryRow ? JSON.parse(summaryRow.content) : null,
          jeju_insights: jejuIdeas ? JSON.parse(jejuIdeas.content) : [],
          trending_keywords: trendKw ? JSON.parse(trendKw.content) : null,
          generated_at: cachedRows[0].generated_at,
          is_cached: true
        });
      }
    }

    // ── 2. 기본 스냅샷 조회 ──
    const { data: rows } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("filter_key", "all_all_all_30")
      .order("generated_at", { ascending: false })
      .limit(3);

    if (!rows || rows.length === 0) return NextResponse.json(sampleInsights);

    const summaryRow = rows.find((r) => r.insight_type === "weekly_summary");
    const jejuIdeas = rows.find((r) => r.insight_type === "jeju_idea");
    const trendKw = rows.find((r) => r.insight_type === "trending_keywords");

    return NextResponse.json({
      weekly_summary: summaryRow ? JSON.parse(summaryRow.content) : null,
      jeju_insights: jejuIdeas ? JSON.parse(jejuIdeas.content) : [],
      trending_keywords: trendKw ? JSON.parse(trendKw.content) : null,
      generated_at: rows[0].generated_at,
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(sampleInsights);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { filters, chartData, filterKey } = body;

    if (!filters || !chartData || !filterKey) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const { generateUnifiedInsight } = await import("@/lib/gemini");
    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    // ── 1. DB 캐시 확인 (중복 생성 방지) ──
    if (supabase) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: existingCache } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("filter_key", filterKey)
        .gte("generated_at", todayStart.toISOString())
        .limit(3);

      if (existingCache && existingCache.length >= 3) {
        console.log(`[Insights] Cache HIT in POST for ${filterKey}. Returning existing data.`);
        const summaryRow = existingCache.find((r) => r.insight_type === "weekly_summary");
        const jejuIdeas = existingCache.find((r) => r.insight_type === "jeju_idea");
        const trendKw = existingCache.find((r) => r.insight_type === "trending_keywords");

        return NextResponse.json({
          success: true,
          weekly_summary: summaryRow ? JSON.parse(summaryRow.content) : null,
          jeju_insights: jejuIdeas ? JSON.parse(jejuIdeas.content) : [],
          trending_keywords: trendKw ? JSON.parse(trendKw.content) : null,
          generated_at: existingCache[0].generated_at,
          is_cached: true
        });
      }
    }

    // ── 2. 데이터 전처리 ──
    const trendInput = chartData.results.map((r: any) => {
      const allRatios = r.data.map((d: any) => d.ratio);
      const period = filters.period || 30;
      
      // 전체 데이터에서 '최근 days일'과 '그 이전 days일'을 분리하여 비교
      const secondHalf = allRatios.slice(-period); // 최근 n일
      const firstHalf = allRatios.slice(-(period * 2), -period); // 이전 n일
      
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length : 0;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length : 0;
      const changeRate = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

      return {
        group: r.title,
        keywords: r.keywords,
        series: r.data,
        avgRatio: Math.round(secondAvg * 10) / 10, // 현재 기간의 평균 수치
        changeRate: Math.round(changeRate * 10) / 10, // 이전 기간 대비 변화율
        trend: changeRate > 5 ? "상승" : changeRate < -5 ? "하락" : "유지"
      };
    });

    // ── 3. 통합 AI 분석 (단 1회의 호출) ──
    const unifiedResult = await generateUnifiedInsight(
      trendInput, 
      { totalCount: 124, genreBreakdown: { "뮤지컬": 45, "전시": 32 }, jejuCount: 12 }, 
      filters
    );

    // ── 3. DB 저장 (트랜잭션 효과를 위해 개별 저장) ──
    const timestamp = new Date().toISOString();
    
    if (supabase) {
      const { error: dbError } = await supabase.from("ai_insights").insert([
        { insight_type: "weekly_summary", title: `필터 분석: ${filterKey}`, content: JSON.stringify(unifiedResult.weekly_summary), filter_key: filterKey, generated_at: timestamp },
        { insight_type: "jeju_idea", title: `필터 기획: ${filterKey}`, content: JSON.stringify(unifiedResult.jeju_insights), filter_key: filterKey, generated_at: timestamp },
        { insight_type: "trending_keywords", title: `필터 키워드: ${filterKey}`, content: JSON.stringify(unifiedResult.trending_keywords), filter_key: filterKey, generated_at: timestamp }
      ]);

      if (dbError) {
        console.warn("⚠️ [Insights] Failed to save to DB, but returning result:", dbError);
      }
    } else {
      console.warn("⚠️ [Insights] Supabase client missing. Skipping DB storage.");
    }

    return NextResponse.json({ 
      success: true, 
      ...unifiedResult,
      generated_at: timestamp 
    });

  } catch (error: any) {
    console.error("Unified Insight error:", error);
    return NextResponse.json({ error: error.message || "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
