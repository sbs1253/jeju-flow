import { NextResponse } from "next/server";

const USE_SAMPLE = process.env.USE_SAMPLE_DATA === "true";

const sampleArchive = [
  {
    id: 1,
    week_start: "2026-04-13",
    week_end: "2026-04-19",
    top_keywords: ["벚꽃축제", "뮤지컬", "제주카페"],
    trend_summary: "봄 시즌 본격화로 야외 축제 및 제주 여행 관련 검색량이 전주 대비 25% 상승했습니다.",
    performance_stats: { total: 142, music: 45, festival: 38 },
    created_at: "2026-04-20T09:00:00Z"
  },
  {
    id: 2,
    week_start: "2026-04-06",
    week_end: "2026-04-12",
    top_keywords: ["공연예매", "전시회", "원데이클래스"],
    trend_summary: "실내 문화 활동이 강세를 보였으며, 특히 MZ세대를 타겟으로 한 팝업스토어 관심도가 높았습니다.",
    performance_stats: { total: 128, music: 32, exhibition: 28 },
    created_at: "2026-04-13T09:00:00Z"
  }
];

export async function GET() {
  try {
    if (USE_SAMPLE) {
      return NextResponse.json(sampleArchive);
    }

    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("weekly_snapshots")
      .select("*")
      .order("week_start", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data && data.length > 0 ? data : sampleArchive);
  } catch (error) {
    console.error("Archive API error:", error);
    return NextResponse.json(sampleArchive);
  }
}
