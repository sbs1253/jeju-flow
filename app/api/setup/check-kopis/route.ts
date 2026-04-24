import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.KOPIS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      message: '환경변수 누락',
      detail: '누락: KOPIS_API_KEY',
    });
  }

  try {
    const today = new Date();
    const stdate = today.toISOString().split('T')[0].replace(/-/g, '');

    const res = await fetch(
      `http://www.kopis.or.kr/openApi/restful/pblprfr?service=${apiKey}&stdate=${stdate}&eddate=${stdate}&cpage=1&rows=1`,
    );

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        message: `API 오류 (${res.status})`,
        detail: 'KOPIS 서버 응답 오류',
      });
    }

    const xml = await res.text();
    const hasData = xml.includes('<db>') || xml.includes('<dbs');

    return NextResponse.json({
      ok: true,
      message: 'KOPIS 연결 성공',
      detail: hasData ? '공연 데이터 확인됨' : '응답 수신됨 (당일 데이터 없을 수 있음)',
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: '연결 실패',
      detail: String(error),
    });
  }
}
