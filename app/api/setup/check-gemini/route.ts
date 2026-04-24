import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      message: '환경변수 누락',
      detail: '누락: GEMINI_API_KEY',
    });
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: '안녕이라고만 답해줘',
    });

    const text = response.text;

    return NextResponse.json({
      ok: true,
      message: 'Gemini 연결 성공',
      detail: `응답: "${(text || "").slice(0, 50)}"`,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: '연결 실패',
      detail: String(error).slice(0, 200),
    });
  }
}
