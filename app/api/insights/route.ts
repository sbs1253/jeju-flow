import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import sampleInsights from "@/data/sample/insights.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const filterKey = searchParams.get("filter_key");

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
    let { filters, chartData, filterKey } = body;

    const supabase = createServerSupabaseClient();

    // ── 0. 자동 수집 모드 (Body가 없을 때 DB에서 최신 데이터 로드) ──
    if (!filters || !chartData || !filterKey) {
      console.log("[Insights] No body provided. Entering Automated Mode...");
      filterKey = "all_all_all_30";
      filters = { period: 30 };

      // 1) 최신 트렌드 데이터 로드
      const { data: trendRows } = await supabase
        .from("search_trends")
        .select("*")
        .eq("filter_key", filterKey)
        .order("collected_at", { ascending: false })
        .limit(400); // 5개 그룹 * 80일치 정도 (비교군 충분히 확보)

      if (!trendRows || trendRows.length === 0) {
        return NextResponse.json({ error: "No trend data found for analysis" }, { status: 400 });
      }

      // 가장 최근 수집 시점의 데이터만 필터링
      const latestTimestamp = trendRows[0].collected_at;
      const latestRows = trendRows.filter(r => r.collected_at === latestTimestamp);

      const grouped = latestRows.reduce((acc: any, row) => {
        if (!acc[row.keyword_group]) {
          acc[row.keyword_group] = { keywords: row.keyword.split(", "), data: [] };
        }
        acc[row.keyword_group].data.push({ period: row.period_start, ratio: row.ratio });
        return acc;
      }, {});

      chartData = {
        results: Object.entries(grouped).map(([title, info]: [string, any]) => ({
          title,
          keywords: info.keywords,
          data: info.data.sort((a: any, b: any) => a.period.localeCompare(b.period)),
        }))
      };
      // 필터가 없을 때도 필터 정보 생성 (전처리용)
      filters = { period: 30 };
    }

    const { generateUnifiedInsight } = await import("@/lib/gemini");

    // ── 1. DB 캐시 확인 (중복 생성 방지) ──
    const force = body.force === true;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (!force) {
      const { data: existingCache } = await supabase
          .from("ai_insights")
          .select("*")
          .eq("filter_key", filterKey)
          .gte("generated_at", todayStart.toISOString())
          .limit(3);

      if (existingCache && existingCache.length >= 3) {
        console.log(`[Insights] Cache HIT for ${filterKey}. Returning existing data.`);
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
    } else {
      console.log(`[Insights] Force regeneration requested for ${filterKey}`);
    }

    // ── 2. 데이터 전처리 ──
    const trendInput = chartData.results.map((r: any) => {
      const allRatios = r.data.map((d: any) => d.ratio);
      const period = filters.period || 30;
      
      // UI와 동일한 비교 로직: 선택된 기간(period)을 둘로 나눠서 전/후반 비교
      const targetData = allRatios.slice(-period); 
      const mid = Math.floor(targetData.length / 2);
      
      const firstHalf = targetData.slice(0, mid);
      const secondHalf = targetData.slice(mid);
      
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length : 0;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length : 0;
      const changeRate = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

      return {
        group: r.title,
        keywords: r.keywords,
        avgRatio: Math.round(secondAvg * 10) / 10,
        changeRate: Math.round(changeRate * 10) / 10
      };
    });

    // 실제 공연 현황 통계 가져오기
    const { data: perfData } = await supabase.from("performances").select("genre, region");
    const perfStats = {
      stats: {
        total: perfData?.length || 0,
        jejuCount: perfData?.filter(p => p.region === "제주").length || 0,
        byGenre: (perfData || []).reduce((acc: any, p) => {
          acc[p.genre] = (acc[p.genre] || 0) + 1;
          return acc;
        }, {})
      }
    };

    // ── 3. 통합 AI 분석 ──
    const unifiedResult = await generateUnifiedInsight(
      trendInput, 
      perfStats, 
      filters
    );

    // ── 3. DB 저장 (트랜잭션 효과를 위해 개별 저장) ──
    const timestamp = new Date().toISOString();
    
    const { error: dbError } = await supabase.from("ai_insights").insert([
      { insight_type: "weekly_summary", title: `필터 분석: ${filterKey}`, content: JSON.stringify(unifiedResult.weekly_summary), filter_key: filterKey, generated_at: timestamp },
      { insight_type: "jeju_idea", title: `필터 기획: ${filterKey}`, content: JSON.stringify(unifiedResult.jeju_insights), filter_key: filterKey, generated_at: timestamp },
      { insight_type: "trending_keywords", title: `필터 키워드: ${filterKey}`, content: JSON.stringify(unifiedResult.trending_keywords), filter_key: filterKey, generated_at: timestamp }
    ]);

    if (dbError) {
      console.warn("⚠️ [Insights] Failed to save to DB, but returning result:", dbError);
    }

    return NextResponse.json({ 
      success: true, 
      ...unifiedResult,
      generated_at: timestamp 
    });

  } catch (error: any) {
    console.error("Unified Insight error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "분석 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}
