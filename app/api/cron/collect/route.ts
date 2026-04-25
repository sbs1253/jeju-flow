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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    };

    const results: Record<string, unknown> = {};

    // 1. 네이버 DataLab 트렌드 수집
    try {
      const trendRes = await fetch(`${baseUrl}/api/trends`, {
        method: "POST",
        headers,
      });
      results.trends = await trendRes.json();
    } catch (e) {
      results.trends = { error: String(e) };
    }

    // 2. KOPIS 공연 데이터 수집
    try {
      const perfRes = await fetch(`${baseUrl}/api/performances`, {
        method: "POST",
        headers,
      });
      results.performances = await perfRes.json();
    } catch (e) {
      results.performances = { error: String(e) };
    }

    // 3. Gemini 인사이트 생성
    try {
      const insightRes = await fetch(`${baseUrl}/api/insights`, {
        method: "POST",
        headers,
      });
      results.insights = await insightRes.json();
    } catch (e) {
      results.insights = { error: String(e) };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Cron collection error:", error);
    return NextResponse.json(
      { error: "Cron collection failed", details: String(error) },
      { status: 500 }
    );
  }
}
