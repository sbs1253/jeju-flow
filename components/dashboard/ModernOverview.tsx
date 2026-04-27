"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Sparkles,
  Calendar,
  Info,
  Lightbulb,
  ArrowRight,
  Zap,
  Globe,
  Filter,
  Monitor,
  Smartphone,
  User,
  Users,
  BrainCircuit,
  History,
  RotateCcw,
  ChevronDown,
  Clock,
  CheckCircle2,
  Target,
  Music,
  PartyPopper,
  Image,
  Mic2
} from "lucide-react";
import { StatCard } from "@/components/cards/StatCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { KeywordRankCard } from "@/components/charts/KeywordRankCard";
import { TrendFilters } from "@/hooks/use-dashboard-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface ModernOverviewProps {
  today: string;
  isLoading: boolean;
  trends: any;
  insights: any;
  archiveList?: any[];
  getLatestRatio: (title: string) => number;
  filters: TrendFilters;
  onFilterChange: (filters: TrendFilters) => void;
  onAnalyzeFilter: () => void;
  isAnalyzing: boolean;
  isCached?: boolean;
}

export function ModernOverview({
  today,
  isLoading,
  trends,
  insights,
  getLatestRatio,
  filters,
  onFilterChange,
  onAnalyzeFilter,
  isAnalyzing,
  isCached = false,
}: ModernOverviewProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const summary = insights?.weekly_summary;
  const jejuInsights = insights?.jeju_insights || [];
  const trendingKeywords = insights?.trending_keywords || [];

  const displayEndDate = trends?.endDate || "";
  const displayStartDate = trends?.startDate || "";
  
  const formatPeriod = (start: string, end: string) => {
    if (!start || !end) return "Loading...";
    const s = new Date(start);
    const e = new Date(end);
    // 연도가 다를 경우 또는 현재 연도가 아닐 경우에만 연도 표시
    const showYear = s.getFullYear() !== e.getFullYear() || s.getFullYear() !== new Date().getFullYear();
    if (showYear) {
      return `${s.getFullYear()}.${s.getMonth() + 1}.${s.getDate()} ~ ${e.getFullYear()}.${e.getMonth() + 1}.${e.getDate()}`;
    }
    return `${s.getMonth() + 1}.${s.getDate()} ~ ${e.getMonth() + 1}.${e.getDate()}`;
  };

  const isFiltered = !!(filters.gender || filters.device || (filters.ages && filters.ages.length > 0));

  const getTrendData = (groupTitle: string) => {
    const aiTrend = summary?.groupTrends?.find(
      (g: any) => g.group === groupTitle || g.group.includes(groupTitle)
    );
    
    if (aiTrend) {
      return { ratio: aiTrend.avgRatio, changeRate: aiTrend.changeRate };
    }

    const series = trends?.results?.find((r: any) => r.title.includes(groupTitle));
    
    if (series?.data?.length >= 2) {
      const ratios = series.data.map((d: any) => d.ratio);
      const period = filters.period || 30;
      
      const targetData = ratios.slice(-period);
      const mid = Math.floor(targetData.length / 2);
      
      const firstHalf = targetData.slice(0, mid);
      const secondHalf = targetData.slice(mid);
      
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length : 0;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length : 0;
      
      const rate = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;
      
      return { 
        ratio: Math.round(secondAvg * 10) / 10, 
        changeRate: Math.round(rate * 10) / 10 
      };
    }

    return {
      ratio: getLatestRatio(groupTitle),
      changeRate: 0
    };
  };

  const updateFilter = (key: keyof TrendFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleAge = (age: string) => {
    const currentAges = filters.ages || [];
    const newAges = currentAges.includes(age)
      ? currentAges.filter(a => a !== age)
      : [...currentAges, age];
    updateFilter("ages", newAges);
  };

  const ageLabels: Record<string, string> = {
    "3": "20-24",
    "4": "25-29",
    "5": "30-34",
    "6": "35-39",
    "7": "40-44",
    "8": "45-49",
    "9": "50-54",
  };

  return (
    <div className="space-y-10 pb-24 text-foreground relative">
      {/* ── Background Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 120, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] left-[5%] w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full" 
        />
      </div>

      <div className="relative z-10 space-y-10">
      {/* ── Breaking News Ticker ── */}
      <div className="w-full bg-card/50 backdrop-blur-md border-y border-border/50 overflow-hidden py-3">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-6">
          <div className="flex items-center gap-2 shrink-0">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Breaking</span>
          </div>
          <div className="relative flex-1 h-5 overflow-hidden">
             <motion.p 
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="whitespace-nowrap text-xs font-medium text-muted-foreground"
             >
                {summary?.headline || "실시간 트렌드 데이터 분석 중..."} • {isFiltered ? "타겟 맞춤형 기획안 생성 가능" : "전체 트렌드 분석"} • 기간: {formatPeriod(displayStartDate, displayEndDate)}
             </motion.p>
          </div>
        </div>
      </div>

      {/* ── Dashboard Header & Interactive Filters ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
           <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">Radar Overview</h2>
           <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                National Trend Intelligence
              </p>
              <div className="h-4 w-px bg-border hidden sm:block"></div>
               <div className="flex items-center gap-2">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden sm:block">
                    Period: {formatPeriod(displayStartDate, displayEndDate)}
                 </p>
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground cursor-help hover:text-indigo-400 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-popover border-border text-[11px] p-2 max-w-[200px] text-popover-foreground">
                        추이 분석(MoM/WoW)을 위해 선택한 기간의 2배 데이터를 포함합니다.
                      </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
               </div>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           {/* ── 연령대 선택기 (Age Selector) ── */}
           <div className="flex gap-1 p-1 bg-muted/80 border border-border rounded-2xl overflow-x-auto max-w-[300px] sm:max-w-none no-scrollbar">
              {Object.entries(ageLabels).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => toggleAge(val)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap",
                    filters.ages?.includes(val) ? "bg-accent text-accent-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
           </div>

           <div className="flex gap-1 p-1 bg-muted/80 border border-border rounded-2xl">
              {[
                { val: 7, label: "7D" },
                { val: 14, label: "14D" },
                { val: 30, label: "1M" },
                { val: 90, label: "3M" },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => updateFilter("period", p.val)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter",
                    filters.period === p.val ? "bg-accent text-accent-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
           </div>

           <div className="flex flex-wrap items-center gap-3 bg-muted/40 p-1.5 rounded-2xl border border-border">
              <div className="flex gap-1 p-1 bg-card rounded-xl border border-border">
                 {[
                   { id: undefined, label: "ALL", icon: Monitor },
                   { id: "pc", label: "PC", icon: Monitor },
                   { id: "mo", label: "MO", icon: Smartphone },
                 ].map((d) => (
                   <button
                     key={d.label}
                     onClick={() => updateFilter("device", d.id)}
                     className={cn(
                       "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                       filters.device === d.id ? "bg-indigo-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <d.icon className="w-3 h-3" />
                     {d.label}
                   </button>
                 ))}
              </div>

              <div className="flex gap-1 p-1 bg-card rounded-xl border border-border">
                 {[
                   { id: undefined, label: "ALL", icon: Users },
                   { id: "m", label: "M", icon: User },
                   { id: "f", label: "F", icon: User },
                 ].map((g) => (
                   <button
                     key={g.label}
                     onClick={() => updateFilter("gender", g.id)}
                     className={cn(
                       "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                       filters.gender === g.id ? "bg-indigo-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <g.icon className="w-3 h-3" />
                     {g.label}
                   </button>
                 ))}
              </div>
           </div>
           
           <AnimatePresence mode="wait">
             {isCached ? (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-default"
               >
                 <CheckCircle2 className="w-4 h-4" />
                 Report Cached
               </motion.div>
             ) : (
               <motion.button
                 key="analyze"
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 onClick={onAnalyzeFilter}
                 disabled={isAnalyzing}
                 className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
               >
                 <BrainCircuit className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                 {isAnalyzing ? "Analyzing..." : "Analyze Trends"}
               </motion.button>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
        <div className="relative z-10 p-12 md:p-16 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="space-y-8 text-center md:text-left max-w-2xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.8] uppercase">
                Culture <br />
                <span className="text-indigo-500">Intelligence</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                 {isFiltered ? "선택하신 타겟 그룹에 최적화된 초정밀 문화 분석을 제공합니다." : "국가 공공 데이터와 AI가 결합된 초정밀 문화 인사이트. 실시간 트렌드 레이더."}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-foreground bg-muted px-6 py-3 rounded-2xl border border-border">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-tighter">{today}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-muted px-6 py-3 rounded-2xl border border-border">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Target-Specific Mode</span>
              </div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-2xl border border-border p-10 rounded-[2.5rem] w-full md:w-[420px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Sparkles className="text-indigo-400 w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">GEMINI 3.1 FLASH LITE</p>
                    <p className="text-xl font-black text-foreground uppercase tracking-tighter">
                       {summary?.risingGroups?.[0] || "READY"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Processing Status</span>
                    <span className="text-sm font-black text-indigo-400">ACTIVE</span>
                 </div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Indicators ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="공연·뮤지컬"
          value={getTrendData("공연").ratio.toFixed(1)}
          subtitle="Search Intensity"
          icon={Music}
          trend={{ value: getTrendData("공연").changeRate, label: "VS PREV" }}
          color="ocean"
          delay={0.1}
        />
        <StatCard
          title="축제·페스티벌"
          value={getTrendData("축제").ratio.toFixed(1)}
          subtitle="Search Intensity"
          icon={PartyPopper}
          trend={{ value: getTrendData("축제").changeRate, label: "VS PREV" }}
          color="tangerine"
          delay={0.2}
        />
        <StatCard
          title="전시·미술"
          value={getTrendData("전시").ratio.toFixed(1)}
          subtitle="Search Intensity"
          icon={Image}
          trend={{ value: getTrendData("전시").changeRate, label: "VS PREV" }}
          color="lava"
          delay={0.3}
        />
        <StatCard
          title="클래식·국악"
          value={getTrendData("클래식").ratio.toFixed(1)}
          subtitle="Search Intensity"
          icon={Mic2}
          trend={{ value: getTrendData("클래식").changeRate, label: "VS PREV" }}
          color="forest"
          delay={0.4}
        />
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Trend Report</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                 {isCached ? (
                   <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Cached Summary</span>
                 ) : (
                   <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Pending Analysis</span>
                 )}
              </div>
            </div>
            {summary ? (
              <InsightCard
                headline={summary.headline}
                summary={summary.summary}
                highlight={summary.highlight}
                delay={0.2}
              />
            ) : (
              <div className="group relative p-12 bg-muted/20 border-2 border-dashed border-border rounded-[3rem] text-center overflow-hidden">
                <div className="relative z-10 space-y-4">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <BrainCircuit className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <h4 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Target Analysis Needed</h4>
                   <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto uppercase tracking-widest leading-loose">
                      Selected filter combination has no cached report. 
                      Click "Analyze Trends" for target-specific insights.
                   </p>
                </div>
              </div>
            )}
          </div>

            <div className="p-10 bg-card border border-border rounded-[3rem] shadow-2xl relative overflow-hidden group min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-full h-[400px]">
                <TrendLineChart data={trends?.results} />
              </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Target Strategy</h3>
              </div>
              {isFiltered && jejuInsights.length > 0 && (
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
                  Target-Specific
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {jejuInsights.length > 0 ? (
                jejuInsights.map((idea: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      y: -4, 
                      backgroundColor: "var(--accent)",
                      borderColor: "var(--border)" 
                    }}
                    transition={{ 
                      delay: idx * 0.05, 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    className="p-6 bg-card border border-border rounded-3xl cursor-default group"
                  >
                    <div className="flex gap-4">
                      <motion.div 
                        transition={{ duration: 0.3 }}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0 group-hover:bg-indigo-500 group-hover:text-white shadow-inner"
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </motion.div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-foreground leading-tight uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                            {idea.title}
                          </h4>
                          {idea.target && (
                            <span className="px-2 py-0.5 bg-muted rounded text-[8px] text-muted-foreground font-bold uppercase">{idea.target.split(' ')[0]}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                          {idea.concept}
                        </p>
                        <div className="pt-2 flex items-center gap-4">
                           <div className="flex items-center gap-1.5">
                             <MapPin className="w-3 h-3 text-indigo-500" />
                             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{idea.jejuConnection}</span>
                           </div>
                           <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Clock className="w-3 h-3 text-indigo-400" />
                             <span className="text-[9px] font-bold text-indigo-400 uppercase">{idea.timing || "NOW"}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] text-center opacity-50">
                   <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Awaiting Target Analysis</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Trending Now</h3>
            </div>
            {trendingKeywords.length > 0 ? (
              <KeywordRankCard keywords={trendingKeywords} />
            ) : (
              <div className="p-10 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] text-center opacity-50">
                 <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">No Data</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
