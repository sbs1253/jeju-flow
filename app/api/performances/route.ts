/**
 * KOPIS 공연/축제 API Route
 * GET: 공연 데이터 조회
 * POST: 공연 데이터 수집 트리거
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchRecentPerformances, countByGenre, countByRegion } from "@/lib/kopis";
import { createServerSupabaseClient } from "@/lib/supabase";
import samplePerformances from "@/data/sample/performances.json";

const USE_SAMPLE = process.env.USE_SAMPLE_DATA === "true";

export async function GET(request: NextRequest) {
  try {
    if (USE_SAMPLE) {
      return NextResponse.json({
        performances: samplePerformances,
        stats: { total: samplePerformances.length, byGenre: {}, byRegion: {}, jejuCount: 0 }
      });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from("performances")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(1000);

    if (region && region !== "all") {
      query = query.eq("region", region === "jeju" ? "제주" : region);
    }

    const { data, error } = await query;

    if (error) throw error;

    const performances = data || [];
    
    // 통계 계산
    const genreStats = performances.reduce(
      (acc: Record<string, number>, p) => {
        acc[p.genre] = (acc[p.genre] || 0) + 1;
        return acc;
      },
      {}
    );

    // 어제 데이터와 비교하여 증가율 계산 (가정: created_at 필드 활용)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: yesterdayCount } = await supabase
      .from("performances")
      .select("*", { count: "exact", head: true })
      .lt("created_at", yesterday.toISOString());

    const { count: totalCount } = await supabase
      .from("performances")
      .select("*", { count: "exact", head: true });

    const diff = (totalCount || 0) - (yesterdayCount || 0);
    const trendValue = yesterdayCount ? Math.round((diff / yesterdayCount) * 100) : 0;

    return NextResponse.json({
      performances,
      stats: {
        total: totalCount || performances.length,
        byGenre: genreStats,
        jejuCount: performances.filter((p: { region: string }) => p.region === "제주").length,
        trend: {
          value: trendValue,
          label: "VS Yesterday"
        }
      },
    });
  } catch (error) {
    console.error("Performances API error:", error);
    return NextResponse.json(
      { performances: samplePerformances, stats: { total: samplePerformances.length, byGenre: {}, byRegion: {}, jejuCount: 0 } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kopisData = await fetchRecentPerformances(true); // 상세 정보 포함 수집

    const supabase = createServerSupabaseClient();

    // KOPIS 날짜 포맷(YYYY.MM.DD) → Supabase DATE(YYYY-MM-DD) 변환
    const formatKopisDate = (d: string) => d?.replace(/\./g, "-") || null;

    const rows = kopisData.map((p: any) => ({
      performance_id: p.mt20id,
      title: p.prfnm,
      genre: p.genrenm,
      region: p.area,
      venue: p.fcltynm,
      start_date: formatKopisDate(p.prfpdfrom),
      end_date: formatKopisDate(p.prfpdto),
      status: p.prfstate,
      poster_url: p.poster || null,
      // 상세 필드 추가
      cast: p.prfcast || null,
      crew: p.prfcrew || null,
      runtime: p.prfruntime || null,
      age: p.prfage || null,
      price: p.pcseguidance || null,
      runtime_info: p.dtguidance || null,
      relate_url: p.relateurl || null,
      relate_urls: p.relateurls || null,
      styurls: p.styurls || null,
      kopis_url: p.kopis_url || null,
    }));

    const { error } = await supabase
      .from("performances")
      .upsert(rows, { onConflict: "performance_id" });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: rows.length,
      genreBreakdown: countByGenre(kopisData),
      regionBreakdown: countByRegion(kopisData),
    });
  } catch (error) {
    console.error("Performance collection error:", error);
    return NextResponse.json(
      { error: "Failed to collect performances", details: String(error) },
      { status: 500 }
    );
  }
}
