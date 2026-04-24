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

const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

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

    // ── 타겟 페르소나 설명 보강 ──
    const ageLabels: Record<string, string> = {
      "3": "20-24세", "4": "25-29세", "5": "30-34세", "6": "35-39세",
      "7": "40-44세", "8": "45-49세", "9": "50-54세", "10": "55-59세"
    };
    
    const targetAges = persona.ages?.map((a: string) => ageLabels[a] || a).join(", ") || "전체 연령대";
    const targetGender = persona.gender === "m" ? "남성" : persona.gender === "f" ? "여성" : "전체 성별";
    const targetDevice = persona.device === "pc" ? "PC" : persona.device === "mo" ? "모바일" : "모든 기기";

    const prompt = `
      당신은 제주도 문화 기획 전문가입니다. 다음 데이터를 바탕으로 **반드시 선택된 타겟 그룹에 집중한** 분석 리포트를 작성하세요.
      
      [현재 필터링 타겟]
      - 연령대: ${targetAges}
      - 성별: ${targetGender}
      - 접속 기기: ${targetDevice}
      
      [데이터 컨텍스트]
      ${dataContext}
      
      [작성 지침]
      1. 모든 인사이트는 위에서 명시한 '${targetAges}' 그룹의 라이프스타일과 취향에 맞춰져야 합니다. 
      2. 만약 타겟이 30대라면, 50대나 다른 연령대의 이야기는 배제하고 30대에게 매력적인 제주도 문화 기획안을 제시하세요.
      3. 제공된 데이터의 트렌드 변화율을 근거로 활용하세요.
      4. **jeju_insights**는 반드시 6개에서 8개 사이의 구체적인 기획안을 생성하세요.
      5. **trending_keywords**는 현재 트렌드를 반영하여 최소 10개 이상을 생성하세요.
    `;

    // ── 공식 가이드 규격 호출 ──
    let response;
    try {
      response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });
    } catch (e: any) {
      console.warn(`⚠️ [Gemini] ${MODEL_NAME} failed, trying fallback gemini-1.5-flash-latest...`);
      response = await ai.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });
    }

    // ── 💡 응답 파싱: 최신 SDK는 response.text를 바로 제공하거나 response.response.text() 사용 ──
    let responseText = "";
    
    if (typeof (response as any).text === 'string') {
      responseText = (response as any).text;
    } else if (typeof (response as any).text === 'function') {
      responseText = (response as any).text();
    } else if ((response as any).candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = (response as any).candidates[0].content.parts[0].text;
    }

    if (!responseText) {
      throw new Error('AI 응답 본문을 찾을 수 없습니다.');
    }

    // JSON 문자열 정화 (마크다운 코드 블록 제거 등)
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);

  } catch (error: any) {
    console.error('Gemini API 분석 실패 상세:', error);
    
    // ── 할당량 초과(Rate Limit) 감지 ──
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error('AI 분석 할당량이 초과되었습니다 (분당 15회). 잠시 후 다시 시도해 주세요.');
    }
    
    throw error;
  }
}
