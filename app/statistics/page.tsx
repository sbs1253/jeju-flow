"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, MapPin, Music, Calendar, Search, Sparkles, Filter, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { GenrePieChart } from "@/components/charts/GenrePieChart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/cards/StatCard";
import { PerformanceCard } from "@/components/cards/PerformanceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformances, useTrends, useInsights } from "@/hooks/use-dashboard-data";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Performance } from "@/types/performance";
import { Button } from "@/components/ui/button";

function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-3xl" />
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[220px] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const [regionFilter, setRegionFilter] = useState<"all" | "jeju">("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: performanceData, isLoading: isPerfLoading } = usePerformances(regionFilter);
  
  // 통합 인사이트를 위해 검색 트렌드 데이터도 함께 사용 (기본값)
  const { data: trendData } = useTrends();
  const { data: insightData, isLoading: isInsightLoading } = useInsights();

  const performances = performanceData?.performances || [];
  
  // 상세 필터링 로직 (지역 + 장르 + 상태)
  const filteredPerformances = useMemo(() => {
    return performances.filter((p: Performance) => {
      const matchRegion = regionFilter === "all" || p.region === "제주";
      const matchGenre = genreFilter === "all" || p.genre === genreFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchRegion && matchGenre && matchStatus;
    });
  }, [performances, regionFilter, genreFilter, statusFilter]);

  // 필터 옵션 추출
  const genreOptions = useMemo(() => {
    const genres = new Set(performances.map((p: any) => p.genre));
    return Array.from(genres).sort() as string[];
  }, [performances]);

  // 필터링된 데이터 기반 통계 재계산
  const stats = useMemo(() => {
    if (!filteredPerformances.length) return null;
    
    const byGenre: Record<string, number> = {};
    const byRegion: Record<string, number> = {};
    const byVenue: Record<string, number> = {};

    const normalize = (region: string) => {
      if (!region) return "기타";
      if (region.startsWith("서울")) return "서울";
      if (region.startsWith("경기")) return "경기";
      if (region.startsWith("부산")) return "부산";
      if (region.startsWith("인천")) return "인천";
      if (region.startsWith("대구")) return "대구";
      if (region.startsWith("대전")) return "대전";
      if (region.startsWith("광주")) return "광주";
      if (region.startsWith("울산")) return "울산";
      if (region.startsWith("세종")) return "세종";
      if (region.startsWith("제주")) return "제주";
      if (region.startsWith("강원")) return "강원";
      if (region.startsWith("충북") || region.startsWith("충청북도")) return "충북";
      if (region.startsWith("충남") || region.startsWith("충청남도")) return "충남";
      if (region.startsWith("전북") || region.startsWith("전라북도")) return "전북";
      if (region.startsWith("전남") || region.startsWith("전라남도")) return "전남";
      if (region.startsWith("경북") || region.startsWith("경상북도")) return "경북";
      if (region.startsWith("경남") || region.startsWith("경상남도")) return "경남";
      return region;
    };
    
    filteredPerformances.forEach((p: Performance) => {
      byGenre[p.genre] = (byGenre[p.genre] || 0) + 1;
      
      // 제주 필터일 경우 시 단위로 세분화하여 표시
      if (regionFilter === "jeju") {
        const venueName = p.venue || "기타 시설";
        const isSeogwipo = venueName.includes("서귀포") || venueName.includes("남원") || venueName.includes("성산") || venueName.includes("표선") || venueName.includes("대정") || venueName.includes("안덕");
        const city = isSeogwipo ? "서귀포시" : "제주시";
        byRegion[city] = (byRegion[city] || 0) + 1;
        
        // 공연 시설별 집계 (TOP 5 용)
        byVenue[venueName] = (byVenue[venueName] || 0) + 1;
      } else {
        const normalized = normalize(p.region);
        byRegion[normalized] = (byRegion[normalized] || 0) + 1;
      }
    });

    return {
      total: filteredPerformances.length,
      byGenre,
      byRegion,
      byVenue: Object.fromEntries(
        Object.entries(byVenue)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) // TOP 5만 추출
      ),
      jejuCount: performances.filter((p: any) => normalize(p.region) === "제주").length
    };
  }, [filteredPerformances, performances, regionFilter]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Statistics</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">
                문화·축제 <span className="text-primary">현황 분석</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium max-w-xl">
                전국 및 제주 지역의 실시간 공연 데이터를 분석하여 수요와 공급의 트렌드를 파악합니다.
              </p>
            </div>
          </motion.div>


          {/* Trendy Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <Tabs value={regionFilter} onValueChange={setRegionFilter} className="w-full md:w-auto">
                <TabsList className="bg-white/5 p-1 rounded-2xl h-12 border border-white/5">
                  <TabsTrigger value="all" className="rounded-xl px-6 font-bold text-[11px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">전국</TabsTrigger>
                  <TabsTrigger value="jeju" className="rounded-xl px-6 font-bold text-[11px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">제주</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="h-8 w-px bg-white/10 hidden md:block" />

              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto overflow-x-auto">
                <TabsList className="bg-white/5 p-1 rounded-2xl h-12 border border-white/5">
                  <TabsTrigger value="all" className="rounded-xl px-4 font-bold text-[11px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">전체</TabsTrigger>
                  <TabsTrigger value="공연중" className="rounded-xl px-4 font-bold text-[11px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">공연중</TabsTrigger>
                  <TabsTrigger value="공연예정" className="rounded-xl px-4 font-bold text-[11px] data-[state=active]:bg-sky-500 data-[state=active]:text-white">공연예정</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="w-full md:w-64 relative group">
              <select 
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full bg-white/5 text-[11px] font-black uppercase tracking-widest outline-none px-6 h-12 rounded-2xl border border-white/10 focus:border-sky-500/50 transition-all appearance-none cursor-pointer hover:bg-white/10 text-white"
              >
                <option value="all" className="bg-[#0a0c10]">ALL GENRES</option>
                {genreOptions.map(g => <option key={g} value={g} className="bg-[#0a0c10]">{g}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {isPerfLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-12">
            {/* AI Unified Insight Section */}
            <AnimatePresence mode="wait">
              {insightData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-[2rem] blur-xl opacity-50" />
                  <div className="relative bg-card/80 backdrop-blur-2xl border border-primary/20 rounded-[2rem] p-8 overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight">트렌드 융합 분석</h2>
                        <p className="text-xs text-muted-foreground font-medium">검색어 수요 vs 실제 공연 공급 매칭 리포트</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-2xl font-black leading-tight text-foreground">
                          {insightData.weekly_summary.headline}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {insightData.weekly_summary.summary}
                        </p>
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                           <p className="text-xs text-primary font-bold italic">
                            “{insightData.weekly_summary.highlight}”
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Rising Interests</div>
                         <div className="flex flex-wrap gap-2">
                           {insightData.weekly_summary.risingGroups.map((group: string) => (
                             <Badge key={group} variant="secondary" className="bg-muted text-[10px] font-bold px-3 py-1">
                               {group}
                             </Badge>
                           ))}
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              {stats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                    <StatCard
                      title={regionFilter === "all" ? "전국 수집 행사" : "제주 수집 행사"}
                      value={stats.total.toLocaleString()}
                      subtitle="건"
                      icon={Music}
                      trend={performanceData?.stats?.trend || { value: 0, label: "KOPIS 실시간" }}
                      color="ocean"
                    />
                    <StatCard
                      title="제주 비중"
                      value={Math.round((stats.jejuCount / (performanceData?.stats?.total || 1)) * 100)}
                      subtitle="%"
                      icon={MapPin}
                      color="tangerine"
                    />
                    <StatCard
                      title="최다 장르"
                      value={
                        (Object.entries(stats.byGenre) as [string, number][]).sort((a, b) => b[1] - a[1])[0]
                          ?.[0] || "-"
                      }
                      icon={BarChart3}
                      color="lava"
                    />
                    <StatCard
                      title="수집 업데이트"
                      value="Live"
                      icon={Calendar}
                      color="forest"
                    />
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="h-full">
                      <GenrePieChart
                        data={stats.byGenre}
                        title={regionFilter === "all" ? "전국 장르별 분포" : "제주 장르별 분포"}
                      />
                    </div>
                    <div className="flex flex-col gap-6 h-full">
                      <CategoryBarChart
                        data={stats.byRegion}
                        title={regionFilter === "jeju" ? "제주 시 단위 현황" : "지역별 공연 현황"}
                        height={regionFilter === "jeju" ? 220 : 450}
                      />
                      {regionFilter === "jeju" && Object.keys(stats.byVenue).length > 0 && (
                        <CategoryBarChart
                          data={stats.byVenue}
                          title="제주 인기 공연장 (TOP 5)"
                          height={280}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

            {/* Performance List Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">상세 리스트</h2>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Showing {filteredPerformances.length} results
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                <AnimatePresence>
                  {filteredPerformances.slice(0, 40).map((p: any) => (
                    <div key={p.performance_id} className="h-full">
                      <PerformanceCard performance={p} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
              
              {filteredPerformances.length > 40 && (
                <div className="flex justify-center pt-8">
                  <p className="text-xs text-muted-foreground font-medium">
                    최근 40건의 데이터만 표시 중입니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Attribution */}
        <div className="pt-20 text-center border-t border-border/40">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">
            Data Source: (재)예술경영지원센터 공연예술통합전산망 (www.kopis.or.kr)
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

