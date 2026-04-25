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
  prfstate: string; // 공연상태
  openrun: string; // 오픈런 여부
  area: string; // 지역
  // 상세 필드 (fetchPerformanceDetail 호출 시 추가됨)
  prfcast?: string;
  prfcrew?: string;
  prfruntime?: string;
  prfage?: string;
  entrpsnm?: string;
  pcseguidance?: string;
  sty?: string;
  dtguidance?: string;
  relateurl?: string;
  relateurls?: { name: string; url: string }[];
  styurls?: string[];
  kopis_url?: string;
}

export interface KopisSearchParams {
  stdate: string;
  eddate: string;
  cpage?: number;
  rows?: number;
  shcate?: string;
  signgucode?: string;
  prfstate?: "01" | "02" | "03";
  kidstate?: "Y" | "N";
}

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

export const REGION_CODES: Record<string, string> = {
  서울: "11", 부산: "26", 대구: "27", 인천: "28", 광주: "29", 대전: "30", 울산: "31", 세종: "36", 경기: "41", 강원: "51", 충북: "43", 충남: "44", 전북: "45", 전남: "46", 경북: "47", 경남: "48", 제주: "50",
};

function parseKopisXml(xml: string): KopisPerformance[] {
  const performances: KopisPerformance[] = [];
  const dbRegex = /<db>([\s\S]*?)<\/db>/g;
  let match;

  const getValue = (tag: string, block: string): string => {
    const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "i");
    const match = block.match(regex);
    return match ? match[1].trim() : "";
  };

  while ((match = dbRegex.exec(xml)) !== null) {
    const block = match[1];
    const area = getValue("area", block) || "";
    const normalizedArea = area.startsWith("제주") ? "제주" : 
                          area.startsWith("서울") ? "서울" :
                          area.startsWith("부산") ? "부산" :
                          area.startsWith("대구") ? "대구" :
                          area.startsWith("인천") ? "인천" :
                          area.startsWith("광주") ? "광주" :
                          area.startsWith("대전") ? "대전" :
                          area.startsWith("울산") ? "울산" :
                          area.startsWith("경기") ? "경기" :
                          area.startsWith("강원") ? "강원" :
                          area.startsWith("충북") ? "충북" :
                          area.startsWith("충남") ? "충남" :
                          area.startsWith("전북") ? "전북" :
                          area.startsWith("전남") ? "전남" :
                          area.startsWith("경북") ? "경북" :
                          area.startsWith("경남") ? "경남" :
                          area.startsWith("세종") ? "세종" : area;

    performances.push({
      mt20id: getValue("mt20id", block),
      prfnm: getValue("prfnm", block),
      prfpdfrom: getValue("prfpdfrom", block),
      prfpdto: getValue("prfpdto", block),
      fcltynm: getValue("fcltynm", block),
      poster: getValue("poster", block),
      genrenm: getValue("genrenm", block),
      prfstate: getValue("prfstate", block),
      openrun: getValue("openrun", block),
      area: normalizedArea,
    });
  }
  return performances;
}

export async function fetchPerformances(params: KopisSearchParams): Promise<KopisPerformance[]> {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) throw new Error("Missing KOPIS API key");

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

  const response = await fetch(`${KOPIS_BASE_URL}/pblprfr?${searchParams.toString()}`);
  if (!response.ok) throw new Error(`KOPIS API error: ${response.status}`);
  const xml = await response.text();
  return parseKopisXml(xml);
}

export async function fetchPerformanceDetail(mt20id: string): Promise<Partial<KopisPerformance>> {
  const apiKey = process.env.KOPIS_API_KEY;
  if (!apiKey) throw new Error("Missing KOPIS API key");

  const response = await fetch(`${KOPIS_BASE_URL}/pblprfr/${mt20id}?service=${apiKey}`);
  if (!response.ok) throw new Error("KOPIS Detail API error");

  const xml = await response.text();
  const getValue = (tag: string, block: string): string => {
    const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "i");
    const match = block.match(regex);
    return match ? match[1].trim() : "";
  };

  const detailBlock = xml.match(/<db>([\s\S]*?)<\/db>/)?.[1] || "";
  
  const relateMatches = [...detailBlock.matchAll(/<relate>([\s\S]*?)<\/relate>/gi)];
  const relateurls = relateMatches.map(m => {
    const block = m[1];
    return {
      name: getValue("relatenm", block),
      url: getValue("relateurl", block)
    };
  }).filter(r => r.url);

  const styurlMatches = [...detailBlock.matchAll(/<styurl>(?:<!\[CDATA\[)?\s*(.*?)\s*(?:\]\]>)?<\/styurl>/gi)];
  const styurls = styurlMatches.map(m => m[1].trim()).filter(Boolean);

  const id = getValue("mt20id", detailBlock);

  return {
    mt20id: id,
    prfnm: getValue("prfnm", detailBlock),
    prfcast: getValue("prfcast", detailBlock),
    prfcrew: getValue("prfcrew", detailBlock),
    prfruntime: getValue("prfruntime", detailBlock),
    prfage: getValue("prfage", detailBlock),
    entrpsnm: getValue("entrpsnm", detailBlock),
    pcseguidance: getValue("pcseguidance", detailBlock),
    poster: getValue("poster", detailBlock),
    sty: getValue("sty", detailBlock),
    genrenm: getValue("genrenm", detailBlock),
    dtguidance: getValue("dtguidance", detailBlock),
    relateurl: relateurls[0]?.url || "",
    relateurls: relateurls,
    styurls: styurls,
    kopis_url: `https://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?mt20Id=${id}&menuId=MNU00020`,
  };
}

export async function fetchRecentPerformances(withDetails = false): Promise<KopisPerformance[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); 
  const futureDate = new Date();
  futureDate.setDate(endDate.getDate() + 90);

  const formatDate = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");
  const allPerformances: KopisPerformance[] = [];

  // 제주 데이터 전수 수집
  for (const state of ["01", "02"] as const) {
    const data = await fetchPerformances({
      stdate: formatDate(startDate),
      eddate: formatDate(futureDate),
      signgucode: "50",
      prfstate: state,
      rows: 100,
    });
    allPerformances.push(...data);
  }

  // 전국 장르별 샘플 수집
  const targetGenres = ["연극", "뮤지컬", "대중음악"];
  for (const genreName of targetGenres) {
    const data = await fetchPerformances({
      stdate: formatDate(startDate),
      eddate: formatDate(futureDate),
      shcate: GENRE_CODES[genreName],
      prfstate: "02",
      rows: 100,
    });
    allPerformances.push(...data);
  }

  const uniqueMap = new Map();
  allPerformances.forEach(p => uniqueMap.set(p.mt20id, p));
  let finalData = Array.from(uniqueMap.values()) as KopisPerformance[];

  if (withDetails) {
    // 제주 데이터만 상세 정보 추가 (전국은 너무 많음)
    finalData = await Promise.all(
      finalData.map(async (p) => {
        if (p.area === "제주") {
          try {
            const detail = await fetchPerformanceDetail(p.mt20id);
            return { ...p, ...detail };
          } catch (e) { return p; }
        }
        return p;
      })
    );
  }

  return finalData;
}

export function countByGenre(performances: KopisPerformance[]): Record<string, number> {
  return performances.reduce((acc, perf) => {
    const genre = perf.genrenm || "기타";
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function countByRegion(performances: KopisPerformance[]): Record<string, number> {
  return performances.reduce((acc, perf) => {
    const region = perf.area || "기타";
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
