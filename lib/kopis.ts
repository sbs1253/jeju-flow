/**
 * KOPIS (공연예술통합전산망) API 유틸리티
 * 전국 공연·축제 정보 수집
 */

const KOPIS_BASE_URL = "http://www.kopis.or.kr/openApi/restful";

export interface KopisPerformance {
  mt20id: string; // 공연 ID
  prfnm: string; // 공연명
  prfpdfrom: string; // 공연 시작일
  prfpdto: string; // 공연 종료일
  fcltynm: string; // 공연시설명
  poster: string; // 포스터 URL
  genrenm: string; // 장르
  prfstate: string; // 공연상태 (공연중, 공연예정, 공연완료)
  openrun: string; // 오픈런 여부
  area: string; // 지역
}

export interface KopisSearchParams {
  stdate: string; // 시작일 (yyyyMMdd)
  eddate: string; // 종료일 (yyyyMMdd)
  cpage?: number; // 페이지 번호
  rows?: number; // 페이지당 결과 수 (최대 100)
  shcate?: string; // 장르 코드
  signgucode?: string; // 지역 코드
  prfstate?: "01" | "02" | "03"; // 공연상태: 01=예정, 02=공연중, 03=완료
  kidstate?: "Y" | "N"; // 아동공연 여부
}

// 장르 코드 매핑
export const GENRE_CODES: Record<string, string> = {
  연극: "AAAA",
  뮤지컬: "GGGA",
  클래식: "CCCA",
  국악: "CCCC",
  대중음악: "CCCD",
  무용: "BBBA",
  "대중무용·발레": "BBBE",
  서커스·마술: "EEEA",
  복합: "EEEB",
};

// 지역 코드 매핑
export const REGION_CODES: Record<string, string> = {
  서울: "11",
  부산: "26",
  대구: "27",
  인천: "28",
  광주: "29",
  대전: "30",
  울산: "31",
  세종: "36",
  경기: "41",
  강원: "51",
  충북: "43",
  충남: "44",
  전북: "45",
  전남: "46",
  경북: "47",
  경남: "48",
  제주: "50",
};

/**
 * KOPIS API XML 응답을 JSON으로 파싱
 */
function parseKopisXml(xml: string): KopisPerformance[] {
  const performances: KopisPerformance[] = [];
  const dbRegex = /<db>([\s\S]*?)<\/db>/g;
  let match;

  while ((match = dbRegex.exec(xml)) !== null) {
    const block = match[1];
    const getValue = (tag: string): string => {
      const tagMatch = block.match(new RegExp(`<${tag}><!\\[CDATA\\[(.+?)\\]\\]><\\/${tag}>`))
        || block.match(new RegExp(`<${tag}>(.+?)<\\/${tag}>`));
      return tagMatch ? tagMatch[1].trim() : "";
    };

    performances.push({
      mt20id: getValue("mt20id"),
      prfnm: getValue("prfnm"),
      prfpdfrom: getValue("prfpdfrom"),
      prfpdto: getValue("prfpdto"),
      fcltynm: getValue("fcltynm"),
      poster: getValue("poster"),
      genrenm: getValue("genrenm"),
      prfstate: getValue("prfstate"),
      openrun: getValue("openrun"),
      area: getValue("area"),
    });
  }

  return performances;
}

/**
 * KOPIS 공연 목록 조회
 */
export async function fetchPerformances(
  params: KopisSearchParams
): Promise<KopisPerformance[]> {
  const apiKey = process.env.KOPIS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing KOPIS API key");
  }

  const searchParams = new URLSearchParams({
    service: apiKey,
    stdate: params.stdate,
    eddate: params.eddate,
    cpage: String(params.cpage || 1),
    rows: String(params.rows || 50),
    ...(params.shcate && { shcate: params.shcate }),
    ...(params.signgucode && { signgucode: params.signgucode }),
    ...(params.prfstate && { prfstate: params.prfstate }),
    ...(params.kidstate && { kidstate: params.kidstate }),
  });

  const response = await fetch(
    `${KOPIS_BASE_URL}/pblprfr?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`KOPIS API error: ${response.status}`);
  }

  const xml = await response.text();
  return parseKopisXml(xml);
}

/**
 * 최근 한 달 공연 데이터 수집
 */
export async function fetchRecentPerformances(): Promise<KopisPerformance[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0].replace(/-/g, "");

  const allPerformances: KopisPerformance[] = [];

  // 공연중 + 공연예정 데이터 수집
  for (const state of ["01", "02"] as const) {
    const performances = await fetchPerformances({
      stdate: formatDate(startDate),
      eddate: formatDate(endDate),
      rows: 100,
      prfstate: state,
    });
    allPerformances.push(...performances);
  }

  return allPerformances;
}

/**
 * 장르별 공연 수 집계
 */
export function countByGenre(
  performances: KopisPerformance[]
): Record<string, number> {
  return performances.reduce(
    (acc, perf) => {
      const genre = perf.genrenm || "기타";
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * 지역별 공연 수 집계
 */
export function countByRegion(
  performances: KopisPerformance[]
): Record<string, number> {
  return performances.reduce(
    (acc, perf) => {
      const region = perf.area || "기타";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
