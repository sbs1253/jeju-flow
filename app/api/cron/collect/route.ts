/**
 * Cron 데이터 수집 엔드포인트
 * GitHub Actions에서 호출하여 모든 데이터 수집을 순차 실행
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV !== "development" && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // baseUrl 결정 로직 개선
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!baseUrl) {
      baseUrl = "http://localhost:3000";
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    };

    console.log(`[Cron] Triggering internal APIs at: ${baseUrl}`);
    console.log(`[Cron] Auth header present: ${!!authHeader}`);

    const startTime = Date.now();
    const results: Record<string, any> = {};

    // 1. 네이버 DataLab 트렌드 수집
    const trendStart = Date.now();
    try {
      const trendUrl = new URL("/api/trends", baseUrl).toString();
      const trendRes = await fetch(trendUrl, {
        method: "POST",
        headers,
      });
      
      if (!trendRes.ok) {
        const text = await trendRes.text();
        console.error(`[Cron] Trends API failed (${trendRes.status}):`, text.slice(0, 500));
        throw new Error(`API returned ${trendRes.status}`);
      }
      
      const data = await trendRes.json();
      results.trends = {
        success: data.success,
        count: data.count || 0,
        groupCounts: data.groupCounts || {},
        duration: `${Date.now() - trendStart}ms`
      };
    } catch (e) {
      results.trends = { success: false, error: String(e), duration: `${Date.now() - trendStart}ms` };
    }

    // 2. KOPIS 공연 데이터 수집
    const perfStart = Date.now();
    try {
      const perfUrl = new URL("/api/performances", baseUrl).toString();
      const perfRes = await fetch(perfUrl, {
        method: "POST",
        headers,
      });

      if (!perfRes.ok) {
        const text = await perfRes.text();
        console.error(`[Cron] Performances API failed (${perfRes.status}):`, text.slice(0, 500));
        throw new Error(`API returned ${perfRes.status}`);
      }

      const data = await perfRes.json();
      results.performances = {
        success: data.success,
        count: data.count || 0,
        jejuCount: data.regionBreakdown?.["제주"] || 0,
        duration: `${Date.now() - perfStart}ms`
      };
    } catch (e) {
      results.performances = { success: false, error: String(e), duration: `${Date.now() - perfStart}ms` };
    }

    // 3. Gemini 인사이트 생성
    const insightStart = Date.now();
    try {
      const insightUrl = new URL("/api/insights", baseUrl).toString();
      const insightRes = await fetch(insightUrl, {
        method: "POST",
        headers,
      });

      if (!insightRes.ok) {
        const text = await insightRes.text();
        console.error(`[Cron] Insights API failed (${insightRes.status}):`, text.slice(0, 500));
        throw new Error(`API returned ${insightRes.status}`);
      }

      const data = await insightRes.json();
      results.insights = {
        success: data.success,
        types: data.types || [],
        duration: `${Date.now() - insightStart}ms`
      };
    } catch (e) {
      results.insights = { success: false, error: String(e), duration: `${Date.now() - insightStart}ms` };
    }

    const totalDuration = Date.now() - startTime;

    return NextResponse.json({
      success: Object.values(results).every((r: any) => r.success),
      timestamp: new Date().toISOString(),
      duration: `${totalDuration}ms`,
      summary: {
        trends: results.trends.success ? `${results.trends.count} keywords collected` : "Failed",
        performances: results.performances.success ? `${results.performances.count} events updated (${results.performances.jejuCount} in Jeju)` : "Failed",
        insights: results.insights.success ? "AI Insights regenerated" : "Failed",
      },
      details: results,
    });
  } catch (error) {
    console.error("Cron collection error:", error);
    return NextResponse.json(
      { success: false, error: "Cron collection failed", details: String(error) },
      { status: 500 }
    );
  }
}
