/**
 * 네이버 DataLab API 유틸리티
 */

const NAVER_DATALAB_URL = "https://openapi.naver.com/v1/datalab/search";

export interface NaverKeywordGroup {
  groupName: string;
  keywords: string[];
}

export interface NaverTrendRequest {
  startDate: string;
  endDate: string;
  timeUnit: "date" | "week" | "month";
  keywordGroups: NaverKeywordGroup[];
  device?: "pc" | "mo" | "";
  ages?: string[];
  gender?: "m" | "f" | "";
}

export interface NaverTrendResult {
  title: string;
  keywords: string[];
  data: { period: string; ratio: number }[];
}

export interface NaverTrendResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: NaverTrendResult[];
}

export const DEFAULT_KEYWORD_GROUPS: NaverKeywordGroup[] = [
  {
    groupName: "공연·뮤지컬",
    keywords: ["뮤지컬", "연극", "콘서트", "공연예매", "오페라"],
  },
  {
    groupName: "축제·페스티벌",
    keywords: ["축제", "페스티벌", "음악축제", "문화축제", "야외공연"],
  },
  {
    groupName: "전시·미술",
    keywords: ["전시회", "미술관", "갤러리", "아트페어", "박물관"],
  },
  {
    groupName: "팝업·체험",
    keywords: ["팝업스토어", "팝업행사", "체험전시", "이머시브", "미디어아트"],
  },
  {
    groupName: "클래식·국악",
    keywords: ["클래식공연", "국악공연", "오케스트라", "심포니", "판소리"],
  },
];

export async function fetchNaverTrends(
  request: NaverTrendRequest
): Promise<NaverTrendResponse> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Naver API credentials");
  }

  const body = {
    startDate: request.startDate,
    endDate: request.endDate,
    timeUnit: request.timeUnit,
    keywordGroups: request.keywordGroups,
    device: request.device || undefined,
    ages: request.ages && request.ages.length > 0 ? request.ages : undefined,
    gender: request.gender || undefined,
  };

  const response = await fetch(NAVER_DATALAB_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver DataLab API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

const formatDate = (d: Date) => d.toISOString().split("T")[0];

export async function fetchRecentTrends(
  days = 30,
  timeUnit: NaverTrendRequest["timeUnit"] = "week",
  filters: { gender?: string; device?: string; ages?: string[] } = {}
): Promise<NaverTrendResponse> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  return fetchNaverTrends({
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    timeUnit,
    keywordGroups: DEFAULT_KEYWORD_GROUPS,
    gender: filters.gender as any,
    device: filters.device as any,
    ages: filters.ages,
  });
}
