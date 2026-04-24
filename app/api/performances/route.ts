/**
 * KOPIS 공연/축제 API Route
 * GET: 공연 데이터 조회
 * POST: 공연 데이터 수집 트리거
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchRecentPerformances, countByGenre, countByRegion } from "@/lib/kopis";
import samplePerformances from "@/data/sample/performances.json";

const USE_SAMPLE = process.env.USE_SAMPLE_DATA === "true";

export async function GET() {
  try {
    if (USE_SAMPLE) {
      const performances = samplePerformances;
      const genreStats = performances.reduce(
        (acc: Record<string, number>, p) => {
          acc[p.genre] = (acc[p.genre] || 0) + 1;
          return acc;
        },
        {}
      );
      const regionStats = performances.reduce(
        (acc: Record<string, number>, p) => {
          acc[p.region] = (acc[p.region] || 0) + 1;
          return acc;
        },
        {}
      );

      return NextResponse.json({
        performances,
        stats: {
          total: performances.length,
          byGenre: genreStats,
          byRegion: regionStats,
          jejuCount: performances.filter((p) => p.region === "제주").length,
        },
      });
    }

    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("performances")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(200);

    if (error) throw error;

    const performances = data || [];
    const genreStats = performances.reduce(
      (acc: Record<string, number>, p) => {
        acc[p.genre] = (acc[p.genre] || 0) + 1;
        return acc;
      },
      {}
    );
    const regionStats = performances.reduce(
      (acc: Record<string, number>, p) => {
        acc[p.region] = (acc[p.region] || 0) + 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      performances,
      stats: {
        total: performances.length,
        byGenre: genreStats,
        byRegion: regionStats,
        jejuCount: performances.filter((p: { region: string }) => p.region === "제주").length,
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

    const kopisData = await fetchRecentPerformances();

    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    // KOPIS 날짜 포맷(YYYY.MM.DD) → Supabase DATE(YYYY-MM-DD) 변환
    const formatKopisDate = (d: string) => d?.replace(/\./g, "-") || null;

    const rows = kopisData.map((p) => ({
      performance_id: p.mt20id,
      title: p.prfnm,
      genre: p.genrenm,
      region: p.area,
      venue: p.fcltynm,
      start_date: formatKopisDate(p.prfpdfrom),
      end_date: formatKopisDate(p.prfpdto),
      status: p.prfstate,
      poster_url: p.poster || null,
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
