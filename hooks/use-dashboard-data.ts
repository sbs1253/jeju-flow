import { useQuery } from "@tanstack/react-query";

export interface TrendFilters {
  date?: string | null;
  gender?: "f" | "m";
  ages?: string[];
  device?: "pc" | "mo";
  period?: 7 | 14 | 30 | 90;
}

// 필터 조합을 하나의 키로 변환하는 헬퍼 함수
export function getFilterKey(filters: TrendFilters): string {
  const gender = filters.gender || "all";
  const device = filters.device || "all";
  const period = filters.period || 30;
  // ages가 있으면 정렬하여 포함, 없으면 all
  const ageStr = filters.ages && filters.ages.length > 0 
    ? [...filters.ages].sort().join("_") 
    : "all";
    
  return `${gender}_${device}_${ageStr}_${period}`;
}

export function useTrends(filters?: TrendFilters) {
  const { date, gender, ages, device, period = 30 } = filters || {};
  const filterKey = filters ? getFilterKey(filters) : "all_all_all_30";
  
  return useQuery({
    queryKey: ["trends", date, gender, ages, device, period, filterKey],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      if (gender) params.append("gender", gender);
      if (device) params.append("device", device);
      if (period) params.append("days", period.toString());
      if (ages && ages.length > 0) {
        ages.forEach(age => params.append("ages", age));
      }
      // 필터 키를 서버에 전달하여 서버측 캐싱 유도
      params.append("filter_key", filterKey);
      
      // 인터랙티브 모드(필터 조작 중)일 때 live 파라미터 추가
      if (gender || device || (ages && ages.length > 0) || period !== 30) {
        params.append("live", "true");
      }

      const res = await fetch(`/api/trends?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch trends");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
}

export function usePerformances(region: string = "all") {
  return useQuery({
    queryKey: ["performances", region],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (region !== "all") params.append("region", region);
      const res = await fetch(`/api/performances?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch performances");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });
}

export function useInsights(filters?: TrendFilters) {
  const filterKey = filters ? getFilterKey(filters) : "all_all_all_30";
  const date = filters?.date;

  return useQuery({
    queryKey: ["insights", date, filterKey],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      if (filterKey) params.append("filter_key", filterKey);

      const res = await fetch(`/api/insights?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1시간 캐싱
  });
}
