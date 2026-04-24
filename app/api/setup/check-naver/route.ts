import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const missing = [];
    if (!clientId) missing.push("NAVER_CLIENT_ID");
    if (!clientSecret) missing.push("NAVER_CLIENT_SECRET");

    return NextResponse.json({
      ok: false,
      message: "환경변수 누락",
      detail: `누락: ${missing.join(", ")}`,
    });
  }

  try {
    // 간단한 테스트 요청
    const body = {
      startDate: "2026-04-01",
      endDate: "2026-04-23",
      timeUnit: "date",
      keywordGroups: [
        { groupName: "테스트", keywords: ["축제"] },
      ],
    };

    const res = await fetch("https://openapi.naver.com/v1/datalab/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        ok: false,
        message: `API 오류 (${res.status})`,
        detail: errorText.slice(0, 200),
      });
    }

    return NextResponse.json({
      ok: true,
      message: "네이버 DataLab 연결 성공",
      detail: `Client ID: ${clientId.slice(0, 4)}...`,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: "연결 실패",
      detail: String(error),
    });
  }
}
