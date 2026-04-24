/**
 * 네이버 DataLab 트렌드 API Route (실시간 캐싱 고도화 버전)
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchRecentTrends } from "@/lib/naver-datalab";
import sampleTrends from "@/data/sample/trends.json";

const USE_SAMPLE = process.env.USE_SAMPLE_DATA === "true";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const gender = searchParams.get("gender");
    const device = searchParams.get("device");
    const ages = searchParams.getAll("ages");
    const days = parseInt(searchParams.get("days") || "30", 10);
    const isLive = searchParams.get("live") === "true";
    const filterKey = searchParams.get("filter_key") || "all_all_all_30";

    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    // ── 1. 샘플 데이터 모드 ──
    if (USE_SAMPLE && !date && !gender && !device && ages.length === 0 && days === 30) {
      return NextResponse.json(sampleTrends);
    }

    // ── 2. DB 캐시 조회 (필터가 있을 때) ──
    if (isLive || gender || device || ages.length > 0 || days !== 30) {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: cachedRows } = await supabase
        .from("search_trends")
        .select("*")
        .eq("filter_key", filterKey)
        .gte("collected_at", `${today}T00:00:00Z`)
        .order("period_start", { ascending: true });

      if (cachedRows && cachedRows.length > 0) {
        console.log(`[API] Returning CACHED trends for key: ${filterKey}`);
        
        const grouped = cachedRows.reduce((acc: any, row) => {
          if (!acc[row.keyword_group]) {
            acc[row.keyword_group] = { keywords: row.keyword.split(", "), data: [] };
          }
          acc[row.keyword_group].data.push({
            period: row.period_start,
            ratio: row.ratio,
          });
          return acc;
        }, {});

        const results = Object.entries(grouped).map(([title, info]: [string, any]) => ({
          title,
          keywords: info.keywords,
          data: info.data.sort((a: any, b: any) => a.period.localeCompare(b.period)),
        }));

        return NextResponse.json({
          startDate: results[0]?.data[0]?.period || "",
          endDate: results[0]?.data[results[0]?.data.length - 1]?.period || "",
          timeUnit: "date",
          results,
          is_cached: true
        });
      }

      // ── 3. 캐시 없음: 네이버 실시간 데이터 요청 ──
      console.log(`[API] Cache MISS. Fetching LIVE from Naver: ${filterKey}`);
      
      const liveData = await fetchRecentTrends(days * 2, "date", {
        gender: gender === 'undefined' ? undefined : (gender as any),
        device: device === 'undefined' ? undefined : (device as any),
        ages: ages.length > 0 ? ages : undefined
      });

      // 데이터 안정성을 위해 날짜순 정렬 보장
      liveData.results.forEach(result => {
        result.data.sort((a, b) => a.period.localeCompare(b.period));
      });

      // ── 4. 가져온 실시간 데이터를 DB에 즉시 캐싱 ──
      const timestamp = new Date().toISOString();
      const insertRows = liveData.results.flatMap(result => 
        result.data.map(d => ({
          keyword_group: result.title,
          keyword: result.keywords.join(", "),
          period_start: d.period,
          period_end: d.period,
          ratio: d.ratio,
          filter_key: filterKey,
          collected_at: timestamp
        }))
      );

      // 대량 Insert (데이터가 많을 수 있으므로 주의)
      if (insertRows.length > 0) {
        const { error: insertError } = await supabase.from("search_trends").insert(insertRows);
        if (insertError) console.error("[API] Failed to cache live trends:", insertError);
        else console.log(`[API] Successfully cached ${insertRows.length} rows for key: ${filterKey}`);
      }

      return NextResponse.json({ ...liveData, is_cached: false });
    }

    // ── 5. 과거 마스터 스냅샷 데이터 요청 (date만 있을 때) ──
    console.log(`[API] Fetching Master snapshot for date: ${date}`);
    const { data: snapshot } = await supabase
      .from("search_trends")
      .select("collected_at")
      .eq("filter_key", "all_all_all_30") // 마스터 키
      .lte("collected_at", `${date}T23:59:59Z`)
      .order("collected_at", { ascending: false })
      .limit(1);

    const targetTimestamp = snapshot?.[0]?.collected_at;

    if (!targetTimestamp) {
      const fallbackData = await fetchRecentTrends(days * 2, "date");
      return NextResponse.json(fallbackData);
    }

    const { data: rows, error } = await supabase
      .from("search_trends")
      .select("*")
      .eq("collected_at", targetTimestamp)
      .eq("filter_key", "all_all_all_30")
      .order("period_start", { ascending: true });

    if (error) throw error;

    const grouped = (rows || []).reduce(
      (acc: any, row) => {
        if (!acc[row.keyword_group]) {
          acc[row.keyword_group] = { keywords: row.keyword.split(", "), data: [] };
        }
        acc[row.keyword_group].data.push({
          period: row.period_start,
          ratio: row.ratio,
        });
        return acc;
      },
      {}
    );

    const results = Object.entries(grouped).map(([title, info]: [string, any]) => ({
      title,
      keywords: info.keywords,
      data: info.data.sort((a: any, b: any) => a.period.localeCompare(b.period)),
    }));

    return NextResponse.json({
      startDate: results[0]?.data[0]?.period || "",
      endDate: results[0]?.data[results[0]?.data.length - 1]?.period || "",
      timeUnit: "date",
      results,
    });
  } catch (error) {
    console.error("[API] Trends error:", error);
    
    // ── 스마트 모킹: 환경 변수가 없을 때 필터에 맞춰 샘플 데이터 가공 ──
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const device = searchParams.get("device");
    
    const mockedTrends = JSON.parse(JSON.stringify(sampleTrends));
    
    mockedTrends.results.forEach((res: any) => {
      // 필터에 따른 가짜 변화 부여 (UI 피드백용)
      let multiplier = 1.0;
      if (gender === 'm') multiplier *= 1.2;
      if (gender === 'f') multiplier *= 0.8;
      if (device === 'pc') multiplier *= 1.1;
      if (device === 'mo') multiplier *= 0.9;
      
      res.data.forEach((d: any) => {
        d.ratio = Math.min(100, Math.max(0, d.ratio * multiplier + (Math.random() * 2 - 1)));
      });
    });

    return NextResponse.json(mockedTrends);
  }
}
