/**
 * Gemini API 유틸리티 (ai.google.dev 2026 공식 퀵스타트 규격 적용)
 */

import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }
    // 공식 문서: 빈 객체 또는 명시적 키 전달
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const MODEL_NAME = 'gemini-3.1-flash-lite';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

export interface UnifiedInsightResult {
  weekly_summary: {
    headline: string;
    summary: string;
    highlight: string;
    risingGroups: string[];
  };
  jeju_insights: Array<{
    title: string;
    concept: string;
    target: string;
    timing: string;
    jejuConnection: string;
    basedOnTrend: string;
  }>;
  trending_keywords: Array<{
    keyword: string;
    change: number;
    direction: 'up' | 'down';
  }>;
}

// ─────────────────────────────────────────
// 공식 응답 스키마 (Structured Output Schema)
// ─────────────────────────────────────────

const responseSchema = {
  type: "object",
  properties: {
    weekly_summary: {
      type: "object",
      properties: {
        headline: { type: "string" },
        summary: { type: "string" },
        highlight: { type: "string" },
        risingGroups: { type: "array", items: { type: "string" } }
      },
      required: ["headline", "summary", "highlight", "risingGroups"]
    },
    jeju_insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          concept: { type: "string" },
          target: { type: "string" },
          timing: { type: "string" },
          jejuConnection: { type: "string" },
          basedOnTrend: { type: "string" }
        },
        required: ["title", "concept", "target", "timing", "jejuConnection", "basedOnTrend"]
      }
    },
    trending_keywords: {
      type: "array",
      items: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          change: { type: "number" },
          direction: { type: "string", enum: ["up", "down"] }
        },
        required: ["keyword", "change", "direction"]
      }
    }
  },
  required: ["weekly_summary", "jeju_insights", "trending_keywords"]
};

// ─────────────────────────────────────────
// 통합 분석 함수
// ─────────────────────────────────────────

export async function generateUnifiedInsight(
  trendData: any[],
  performanceData: any,
  persona: any = {}
): Promise<UnifiedInsightResult> {
  try {
    const ai = getAIClient();
    
    const dataContext = trendData
      .map((t) => `[${t.group}] -> 평균:${t.avgRatio}, 변화:${t.changeRate}%`)
      .join('\n');

    const prompt = `문화 데이터를 분석하여 전략 리포트를 생성하세요. 타겟: ${JSON.stringify(persona)}, 데이터: ${dataContext}`;

    // ── 공식 가이드 규격 호출 ──
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any
      }
    });

    // ── 💡 응답 파싱: response.text 속성 사용 ──
    let responseText = response.text; 

    if (!responseText) {
      // 폴백: candidates 구조 확인
      const fallbackText = (response as any).candidates?.[0]?.content?.parts?.[0]?.text;
      if (!fallbackText) throw new Error('AI 응답 본문을 찾을 수 없습니다.');
      responseText = fallbackText;
    }

    // JSON 문자열 정화 (마크다운 코드 블록 제거 등)
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);

  } catch (error: any) {
    console.error('Gemini API 분석 실패 상세:', error);
    throw error;
  }
}
