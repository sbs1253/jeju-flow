"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Sparkles,
} from "lucide-react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { StatCard } from "@/components/cards/StatCard";

interface NewspaperOverviewProps {
  today: string;
  isLoading: boolean;
  trends: any;
  insights: any;
  getLatestRatio: (title: string) => number;
}

export function NewspaperOverview({
  today,
  isLoading,
  trends,
  insights,
  getLatestRatio,
}: NewspaperOverviewProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-24 pb-32">
      {/* Miranda Style Masthead & Stamp */}
      <header className="relative pt-8 space-y-12">
        <div className="flex justify-between items-start border-b border-ink/20 pb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-ink/60">JEJU SPECIAL EDITION / NO. 064</p>
            <p className="text-sm font-serif italic text-ink/80">제주의 문화적 영혼을 데이터로 기록하다.</p>
          </div>
          
          {/* The Stamp (Inspired by Capture) */}
          <div className="relative -mt-4 -mr-4 p-6 border border-ink/10 bg-paper-darker/30 rounded-sm shadow-sm rotate-1">
             <div className="space-y-3">
                <div className="flex justify-between items-center gap-8">
                   <div className="w-10 h-10 rounded-full bg-miranda-orange/20 flex items-center justify-center">
                      <div className="w-6 h-3 bg-miranda-orange rounded-t-full" />
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase text-ink/40 leading-none">Registered</p>
                      <p className="text-[10px] font-mono text-ink/60 italic leading-none">JEJU_KR</p>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-tighter text-ink/40">Date of Record</p>
                   <p className="text-sm font-mono border-b border-ink/20 pb-1">{today}</p>
                </div>
                <div className="pt-2 text-right">
                   <p className="text-[10px] font-serif italic text-ink/40 line-through decoration-ink/20 decoration-2">Niccolo Miranda</p>
                   <p className="text-xs font-mono font-bold">Jeju Analyst 01</p>
                </div>
             </div>
             {/* Decorative zig-zag edge could be added with CSS, using border-style for now */}
             <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-ink text-paper p-12 md:p-24 flex flex-col items-center justify-center space-y-8"
        >
          <h1 className="text-[12vw] font-black tracking-[-0.03em] leading-[1.1] uppercase text-center break-keep">
            JEJU <br className="md:hidden" /> CULTURE
          </h1>
          <div className="flex flex-wrap items-center gap-8 md:gap-16 pt-8 border-t border-paper/20 w-full justify-center">
             <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-paper/60">Cultural Data Archive</p>
             <div className="h-1 w-1 rounded-full bg-miranda-orange" />
             <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-paper/60">Weekly Insight Report</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-b border-ink/20">
          <div className="flex flex-col justify-between border-r border-ink/10 pr-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 mb-6 font-sans">에디토리얼 / Perspective</p>
            <p className="text-lg font-serif italic leading-relaxed text-ink/90">
              "데이터는 시대를 기록하는 가장 정직한 잉크입니다. 우리는 숫자를 넘어 제주의 숨결을 읽습니다."
            </p>
          </div>
          <div className="md:col-span-2 pl-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 mb-6 font-sans">주간 핵심 지표 / Current Pulse</p>
            <div className="flex flex-wrap gap-12 items-baseline">
              <span className="text-8xl font-black tracking-tighter text-ink">12.5%</span>
              <div className="space-y-2">
                 <p className="text-xl font-bold tracking-tight">섬 전체 문화 검색량 상승</p>
                 <p className="text-sm font-serif italic text-ink/60 max-w-sm leading-snug">
                   이번 주 제주도 내 주요 문화 플랫폼 및 공연 정보에 대한 관심도가 지난주 대비 크게 증가했습니다.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
        {/* Left Column: Top Stories */}
        <div className="md:col-span-8 space-y-24 border-r border-ink/10 pr-12">
          {insights?.weekly_summary && (
            <article className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <p className="text-miranda-orange font-black text-[10px] uppercase tracking-[0.3em]">Top Analysis</p>
                   <div className="h-[1px] flex-1 bg-miranda-orange/20" />
                </div>
                <h2 className="text-6xl md:text-[7vw] font-black leading-[1.1] tracking-[-0.02em] text-ink break-keep">
                  {insights.weekly_summary.headline}
                </h2>
              </div>

              <div className="prose prose-xl max-w-none text-ink leading-[1.6] font-serif italic opacity-95 text-2xl break-keep">
                <span className="float-left text-[12rem] font-sans font-black leading-[0.7] mr-10 mt-8 text-ink border-b-[12px] border-miranda-orange/40">
                  {insights.weekly_summary.summary[0]}
                </span>
                {insights.weekly_summary.summary.slice(1)}
              </div>

              <div className="relative p-12 bg-paper-darker/40 border border-ink/10 overflow-hidden">
                <div className="relative z-10 flex gap-8 items-start">
                   <Sparkles className="w-8 h-8 text-miranda-orange mt-1" />
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-ink/40">핵심 하이라이트 / The Highlight</p>
                      <p className="text-2xl md:text-4xl font-serif italic leading-tight text-ink">
                        "{insights.weekly_summary.highlight}"
                      </p>
                   </div>
                </div>
              </div>
            </article>
          )}

          {/* Graphics Section */}
          <div className="space-y-10 pt-16 border-t-4 border-ink">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                 <h3 className="text-4xl font-black tracking-tighter uppercase">Market Trends</h3>
                 <p className="text-sm font-medium text-ink/60 italic">제주 문화 콘텐츠 검색 추이 분석 (최근 30일)</p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-ink/40">Visual Archive / Fig.01</p>
            </div>
            {trends?.results && (
              <div className="p-8 bg-paper border border-ink/20 shadow-inner group hover:border-miranda-orange/30 transition-all duration-700">
                <TrendLineChart data={trends.results} title="" />
              </div>
            )}
            <p className="text-[10px] font-medium text-ink/40 text-right italic font-sans">
              * 출처: 네이버 데이터랩, (재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr) 기반 자체 분석
            </p>
          </div>
        </div>

        {/* Right Column: Briefs & Metrics */}
        <div className="md:col-span-4 space-y-24">
          {/* Key Metrics Section */}
          <div className="space-y-12">
             <div className="flex items-center justify-between group cursor-default border-b border-ink/10 pb-8">
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-miranda-orange">Index / 01</p>
                   <h4 className="text-4xl font-black tracking-tighter uppercase leading-none group-hover:translate-x-2 transition-transform duration-500">공연·뮤지컬</h4>
                </div>
                <span className="text-7xl font-black tracking-tighter">{getLatestRatio('공연·뮤지컬').toFixed(1)}</span>
             </div>
             
             <div className="flex items-center justify-between group cursor-default border-b border-ink/10 pb-8">
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-jeju-ocean">Index / 02</p>
                   <h4 className="text-4xl font-black tracking-tighter uppercase leading-none group-hover:translate-x-2 transition-transform duration-500">축제·페스티벌</h4>
                </div>
                <span className="text-7xl font-black tracking-tighter">{getLatestRatio('축제·페스티벌').toFixed(1)}</span>
             </div>
          </div>

          {/* Ideas Section */}
          <div className="space-y-12">
             <div className="p-4 bg-ink text-paper text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Culture Briefs</p>
             </div>
             <div className="space-y-16">
               {insights?.jeju_insights?.slice(0, 3).map((idea: any, idx: number) => (
                 <div key={idx} className="space-y-6 group">
                    <div className="flex items-baseline gap-4">
                       <span className="text-xs font-black text-ink/30 italic">0{idx + 1}</span>
                       <h4 className="text-3xl font-black tracking-tighter uppercase leading-none group-hover:text-miranda-orange transition-colors duration-500 underline decoration-ink/10 underline-offset-8">
                          {idea.title}
                       </h4>
                    </div>
                    <p className="text-lg font-serif italic text-ink/70 leading-relaxed pl-8">
                       {idea.concept}
                    </p>
                 </div>
               ))}
             </div>
          </div>

          {/* Bottom Card (Miranda Inspired) */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-12 bg-ink text-paper flex flex-col justify-between h-[450px] relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="inline-block px-2 py-1 border border-paper/20 text-[10px] font-black uppercase tracking-widest">Archive Report</div>
              <p className="text-6xl font-black tracking-[calc(-0.06em)] leading-[0.8] uppercase group-hover:text-miranda-orange transition-colors">
                JEJU <br/> DATA <br/> SOUL
              </p>
              <p className="text-sm font-serif italic text-paper/60 leading-relaxed max-w-[200px]">
                우리는 숫자의 나열에서 제주의 새로운 문화를 발견합니다.
              </p>
            </div>
            
            <div className="relative z-10 flex justify-between items-end">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-paper/40">Status</p>
                 <p className="text-xs font-bold uppercase text-miranda-orange">Active Analysis</p>
              </div>
              <div className="w-16 h-16 rounded-full border border-paper/20 flex items-center justify-center group-hover:border-miranda-orange group-hover:rotate-45 transition-all duration-700">
                 <Sparkles className="w-6 h-6 text-paper group-hover:text-miranda-orange" />
              </div>
            </div>

            {/* Decorative Background Accent */}
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-miranda-orange/20 rounded-full blur-[100px] group-hover:bg-miranda-orange/40 transition-all duration-1000" />
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp className="w-64 h-64 rotate-12" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
