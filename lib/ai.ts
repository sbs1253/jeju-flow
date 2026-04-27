/**
 * 통합 AI 엔진 (Groq / OpenAI) 유틸리티
 */

import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY가 설정되지 않았습니다. .env 파일을 확인해 주세요.');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// 💡 지정해주신 최신 모델 적용
const MODEL_NAME = 'openai/gpt-oss-120b';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

export interface UnifiedInsightResult {
  weekly_summary: {
    headline: string;
    summary: string;
    highlight: string;
    risingGroups: string[];
    groupTrends: Array<{
      group: string;
      avgRatio: number;
      changeRate: number;
    }>;
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

export interface TrendData {
  group: string;
  avgRatio: number;
  changeRate: number;
  keywords: string[];
  dailyData: Array<{ date: string; ratio: number }>;
}

export interface PerformanceStats {
  stats: {
    total: number;
    jejuCount: number;
    byGenre: Record<string, number>;
  };
}

// ─────────────────────────────────────────
// 통합 분석 함수
// ─────────────────────────────────────────

export async function generateUnifiedInsight(
  trendData: TrendData[],
  performanceData: PerformanceStats | null,
  persona: { ages?: string[]; gender?: string; device?: string; period?: number } = {},
): Promise<UnifiedInsightResult> {
  try {
    const groq = getGroqClient();

    const period = persona.period || 30;
    const getPeriodLabel = (p: number) => {
      if (p <= 7) return "전주";
      if (p <= 14) return "2주 전";
      if (p <= 30) return "전월";
      if (p <= 90) return "전분기";
      return "전기";
    };
    const periodLabel = getPeriodLabel(period);

    const dataContext = trendData
      .map((t) => {
        const dailyStr = t.dailyData.map((d) => `${d.date.split('-').slice(1).join('/')}:${d.ratio}`).join(', ');
        return `[${t.group}] 최근평균: ${t.avgRatio}, ${periodLabel}대비변화: ${t.changeRate}%\n   └ 시계열(최근${period}일): ${dailyStr}`;
      })
      .join('\n');

    const ageLabels: Record<string, string> = {
      '3': '20-24세',
      '4': '25-29세',
      '5': '30-34세',
      '6': '35-39세',
      '7': '40-44세',
      '8': '45-49세',
      '9': '50-54세',
      '10': '55-59세',
    };

    const targetAges = persona.ages?.map((a: string) => ageLabels[a] || a).join(', ') || '전체 연령대';
    const targetGender = persona.gender === 'm' ? '남성' : persona.gender === 'f' ? '여성' : '전체 성별';
    const targetDevice = persona.device === 'pc' ? 'PC' : persona.device === 'mo' ? '모바일' : '모든 기기';

    const performanceContext = performanceData
      ? `\n[실제 공연 현황]\n- 전체 건수: ${performanceData.stats.total}\n- 제주 건수: ${performanceData.stats.jejuCount}\n- 주요 장르: ${Object.entries(
          performanceData.stats.byGenre,
        )
          .map(([g, c]) => `${g}(${c})`)
          .join(', ')}`
      : '';

    // ── 1. 시스템 프롬프트: 기획 의도와 페르소나를 완벽히 반영한 디렉터 역할 부여 ──
    const systemPrompt = `당신은 'Jeju Flow' 프로젝트를 이끄는 [하이엔드 문화 기획 디렉터]입니다.
당신의 클라이언트는 매년 반복되는 식상한 지역 축제에 지쳐 있으며, 실제 데이터(수요 vs 공급)를 바탕으로 당장 실행 가능한 신선한 기획안을 간절히 찾는 '34세 전문 문화 기획자'입니다.

제공된 네이버 검색 트렌드(수요)와 KOPIS 공연 현황(공급) 데이터를 분석하여, 아래의 [핵심 기획 철학]을 바탕으로 JSON 리포트를 작성하세요. 마크다운(\`\`\`json) 없이 순수한 JSON 객체만 반환해야 합니다.

[핵심 기획 철학 및 작성 지침]
1. 수요-공급 격차(Arbitrage) 공략: 검색 수요는 폭발하지만 실제 제주 내 관련 공연/축제 공급이 부족한 '블루오션'을 찾아내어 기획의 근거로 삼으세요. 특히 제공된 '전월 대비 변화(changeRate)'가 양수인 그룹을 집중 분석하십시오.
2. 데이터 기반 기획: 단순히 평균값만 보지 말고, 제공된 '시계열 데이터'의 변동성이나 특정 시점의 피크를 분석하여 기획의 타이밍(timing)을 결정하십시오.
3. 수치 정밀 인용: 'summary' 및 'groupTrends' 작성 시, 제공된 '최근평균(avgRatio)'과 '전월대비변화(changeRate)' 수치를 소수점 첫째 자리까지 수정 없이 그대로 인용하십시오. 임의로 수치를 변경하거나 누락해서는 안 됩니다.
4. 하이엔드 & 로컬리즘: 뻔한 관광 상품(단순 귤 따기, 흔한 해수욕장 축제)은 철저히 배제하세요. 제주의 고유한 자원(빈 감귤창고, 오름, 해녀 문화, 곶자왈, 로컬 식재료 등)과 최신 문화 트렌드를 결합한 감각적인 에디토리얼 스타일의 기획을 제안하세요.
5. 타겟 편향 방지 및 페르소나 네이밍: 타겟이 '전체 연령대'일 경우 'MZ세대', '2030' 같은 식상한 단어는 금지합니다. 대신 "로컬감성디깅러", "제주사운드스케이프수집가", "웰니스노마드족" 등 트렌디하고 뾰족한 페르소나로 네이밍하세요.
6. 실무 지향적 아이디어 (6~8개 제안): 'jeju_insights' 배열에는 기획자가 즉시 보고서에 쓸 수 있도록 컨셉, 타겟, 추천 시기, 제주와의 연관성, 트렌드 근거가 명확한 아이디어를 생성하세요.

[출력 JSON 형식]
{
  "weekly_summary": {
    "headline": "전체 요약 헤드라인 (기획자 심장을 뛰게 할 강렬한 문구)",
    "summary": "데이터 통합 분석 리포트 (유저 예시처럼 수요/공급 데이터를 자연스럽게 엮어 분석하고, 디렉터의 전략적 의견을 포함할 것)",
    "highlight": "이번 주 가장 중요한 기획적 기회 포인트 (Opinion 중심)",
    "risingGroups": ["페르소나1", "페르소나2"], 
    "groupTrends": [
      {"group": "그룹명", "avgRatio": 0.0, "changeRate": 0.0}
    ]
  },
  "jeju_insights": [
    {
      "title": "기획안 제목",
      "concept": "컨셉 설명",
      "target": "타겟 페르소나",
      "timing": "추천 시기",
      "jejuConnection": "제주 자원 활용",
      "basedOnTrend": "데이터 트렌드 근거"
    }
  ],
  "trending_keywords": [
    {"keyword": "키워드", "change": 0.0, "direction": "up 또는 down"}
  ]
}

[Trending Now 키워드 선정 지침]
- 'trending_keywords' 배열에는 최소 12~15개의 키워드를 포함하세요.
- 단순히 그룹명을 반복하지 말고, 최근 데이터에서 발견되는 세부적인 문화 현상, 공간 타입(예: '감귤창고 카페', '곶자왈 라이브'), 또는 특정 타겟의 취향을 반영하는 구체적인 키워드를 추출하세요.
- 변화율(change)은 실제 데이터의 흐름을 반영하여 다양하게 설정하세요.

[문장 스타일 가이드]
- "데이터에 따르면 ~를 기록했으며, ~인 반면 ~는 부족하여 격차가 뚜렷합니다"와 같은 서사적 구조를 사용하세요.
- 단순 수치 나열이 아니라, 그 수치가 의미하는 '기획적 함의'와 '디렉터의 판단'을 문장에 녹여내세요.
- 전문 용어와 트렌디한 어휘를 적절히 섞어 권위 있는 기획자의 톤을 유지하세요.`;

    // ── 2. 유저 프롬프트: 데이터 주입 ──
    const userPrompt = `
[분석 환경]
- 현재 날짜: ${new Date().toLocaleDateString('ko-KR')}
- 타겟 필터링: 연령대(${targetAges}), 성별(${targetGender}), 기기(${targetDevice})

[데이터 요약 - 절대 수치 준수]
1) 수요 데이터 (검색 트렌드 비율 및 변화율): 
${dataContext}

2) 공급 데이터 (KOPIS 공연 현황):
${performanceContext}

위 데이터를 바탕으로 최고의 문화 기획 인사이트 JSON을 생성해 주십시오.
    `;

    console.log(`[AI] ${MODEL_NAME} 모델로 분석을 시작합니다...`);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: MODEL_NAME,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = chatCompletion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('AI 응답 본문을 찾을 수 없습니다.');
    }

    return JSON.parse(responseText);
  } catch (error: any) {
    console.error('AI 분석 실패 상세:', error);
    throw new Error(`분석 중 오류가 발생했습니다. (${error.message})`);
  }
}
