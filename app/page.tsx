"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ModernOverview } from "@/components/dashboard/ModernOverview";
import { NewspaperOverview } from "@/components/dashboard/NewspaperOverview";
import { useTrends, usePerformances, useInsights, useArchive, TrendFilters, getFilterKey } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}

export default function HomePage() {
  const { theme, resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const dateParam = searchParams.get("date");
  
  const [filters, setFilters] = useState<TrendFilters>({
    date: dateParam,
    gender: undefined,
    ages: [],
    device: undefined,
    period: 30 // 기본값 30일
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveData, setLiveData] = useState<{
    weekly_summary?: any;
    trending_keywords?: any[];
    jeju_insights?: any[];
  } | null>(null);

  useEffect(() => {
    setFilters(prev => ({ ...prev, date: dateParam }));
    setLiveData(null); 
  }, [dateParam]);

  const handleFilterChange = (newFilters: TrendFilters) => {
    setFilters(newFilters);
    // 필터가 바뀌면 기존 실시간 분석 결과는 초기화 (새로운 분석 필요)
    setLiveData(null);
  };

  const { data: trends, isLoading: trendsLoading } = useTrends(filters);
  const { data: performances, isLoading: perfLoading } = usePerformances();
  const { data: insights, isLoading: insightsLoading } = useInsights(filters);
  
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");

  const isLoading = trendsLoading || perfLoading || insightsLoading;

  useEffect(() => {
    setMounted(true);
    const baseDate = dateParam ? new Date(dateParam) : new Date();
    setToday(
      baseDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    );
  }, [dateParam]);

  const handleAnalyzeFilter = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters,
          chartData: trends,
          filterKey: getFilterKey(filters)
        })
      });
      
      if (!res.ok) throw new Error("분석에 실패했습니다.");
      
      const data = await res.json();
      setLiveData({
        weekly_summary: data.weekly_summary,
        trending_keywords: data.trending_keywords,
        jeju_insights: data.jeju_insights
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
      // 생성 직후 캐시 상태를 반영하기 위해 쿼리 무효화 및 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      router.refresh();
    }
  };

  // 실시간 분석 결과(liveData)가 있으면 그것을 사용, 
  // 없으면 DB 캐시(insights)를 사용
  const mergedInsights = useMemo(() => {
    if (liveData) {
      return {
        ...insights,
        weekly_summary: liveData.weekly_summary,
        trending_keywords: liveData.trending_keywords,
        jeju_insights: liveData.jeju_insights
      };
    }
    return insights;
  }, [insights, liveData]);

  const getLatestRatio = (title: string) => {
    if (!trends?.results) return 0;
    const series = trends.results.find((r: any) => r.title === title || r.title.includes(title));
    if (!series || !series.data || series.data.length === 0) return 0;
    
    // 유효한 마지막 데이터 가져오기
    const validData = series.data.filter((d: any) => d.ratio > 0);
    return validData.length > 0 ? validData[validData.length - 1].ratio : series.data[series.data.length - 1].ratio;
  };

  if (!mounted) return null;

  const isNewspaper = theme === "newspaper" || resolvedTheme === "newspaper";

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingState />
      ) : isNewspaper ? (
        <NewspaperOverview
          today={today}
          isLoading={isLoading}
          trends={trends}
          insights={mergedInsights}
          getLatestRatio={getLatestRatio}
        />
      ) : (
        <ModernOverview
          today={today}
          isLoading={isLoading}
          trends={trends}
          insights={mergedInsights}
          getLatestRatio={getLatestRatio}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAnalyzeFilter={handleAnalyzeFilter}
          isAnalyzing={isAnalyzing}
          isCached={!!insights?.is_cached}
        />
      )}
    </DashboardLayout>
  );
}
