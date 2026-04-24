import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

    return NextResponse.json({
      ok: false,
      message: "환경변수 누락",
      detail: `누락: ${missing.join(", ")}`,
    });
  }

  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    // 테이블 존재 여부 확인
    const { error } = await supabase
      .from("search_trends")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({
        ok: false,
        message: "테이블 접근 실패",
        detail: error.message,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase 연결 성공",
      detail: url.replace(/https?:\/\//, "").split(".")[0] + " 프로젝트",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: "연결 실패",
      detail: String(error),
    });
  }
}
