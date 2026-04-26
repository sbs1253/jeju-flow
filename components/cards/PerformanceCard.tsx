'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Ticket,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { Performance } from '@/types/performance';

interface PerformanceCardProps {
  performance: Performance;
}

export function PerformanceCard({ performance }: PerformanceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // DB에 이미 상세 정보가 저장되어 있는지 확인
  const hasDbDetail = !!performance.cast || !!performance.price || !!performance.relate_url;

  const fetchDetail = async () => {
    if (detail || hasDbDetail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/performances/${performance.performance_id}`);
      const data = await res.json();
      setDetail(data);
    } catch (error) {
      console.error('Failed to fetch detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !hasDbDetail) {
      fetchDetail();
    }
  }, [isOpen]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 상세 정보 우선순위: API fetch 결과 > DB 저장 데이터 > 기본값
  const displayData = {
    cast: detail?.prfcast || performance.cast || '정보 없음',
    crew: detail?.prfcrew || performance.crew,
    runtime: detail?.prfruntime || performance.runtime || '정보 없음',
    price: detail?.pcseguidance || performance.price || '정보 없음',
    runtime_info: detail?.dtguidance || performance.runtime_info,
    relate_url: detail?.relateurl || performance.relate_url,
    relate_urls: detail?.relate_urls || performance.relate_urls || [],
    styurls: detail?.styurls || performance.styurls || [],
    kopis_url:
      detail?.kopis_url ||
      performance.kopis_url ||
      `https://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?mt20Id=${performance.performance_id}&menuId=MNU00020`,
  };

  const handleBooking = () => {
    const url =
      displayData.relate_url || `https://tickets.interpark.com/search?keyword=${encodeURIComponent(performance.title)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -5 }}
        className="group relative flex flex-col h-full bg-card border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:z-[50]"
      >
        {/* Poster Preview on Title Hover */}
        <AnimatePresence>
          {isHovered && performance.poster_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute left-1/2 -translate-x-1/2 -top-48 w-44 h-64 z-[100] pointer-events-none shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden border-2 border-white/20"
            >
              <img src={performance.poster_url} alt={performance.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-5 flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-4">
            <Badge
              variant="outline"
              className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20"
            >
              {performance.genre}
            </Badge>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {performance.region}
            </div>
          </div>

          <h3
            className="text-sm font-bold leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors cursor-help"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsOpen(true)}
          >
            {performance.title}
          </h3>

          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 opacity-50" />
              <span>
                {formatDate(performance.start_date).split(' ').slice(1).join(' ')} ~{' '}
                {formatDate(performance.end_date).split(' ').slice(1).join(' ')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <Badge
                className={`text-[9px] font-bold px-2 py-0 h-5 ${
                  performance.status === '공연중'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : performance.status === '공연완료'
                      ? 'bg-muted text-muted-foreground border-transparent'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}
              >
                {performance.status}
              </Badge>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(true)}
                  className="h-7 px-2 text-[10px] font-bold gap-1.5 hover:bg-muted transition-all"
                >
                  상세보기
                  <ChevronRight className="w-3 h-3" />
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBooking}
                  className="h-7 px-3 text-[10px] font-bold gap-1.5 shadow-lg shadow-primary/20 transition-all"
                >
                  예매하기
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-6xl h-[90vh] md:h-[85vh] p-0 overflow-hidden border-none shadow-2xl shadow-black/80 bg-[#0a0c10] rounded-[2.5rem] flex flex-col md:flex-row">
          {/* Left: Poster & Basic Info (400px) */}
          <div className="w-full md:w-[400px] h-full flex flex-col bg-[#050608] border-r border-white/5 overflow-y-auto custom-scrollbar">
            {/* Poster at the Top */}
            <div className="relative w-full aspect-[3/4] flex-shrink-0 group/poster overflow-hidden">
              <img
                src={performance.poster_url || '/placeholder-performance.jpg'}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-[80px] opacity-20"
              />
              <img
                src={performance.poster_url || '/placeholder-performance.jpg'}
                alt={performance.title}
                className="relative z-10 w-full h-full object-contain"
              />
            </div>

            {/* Basic Info below Poster */}
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 font-black uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-full">
                  {performance.genre}
                </Badge>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">{performance.title}</h2>
                <div className="flex items-center gap-3 text-white/60 text-sm font-bold">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  {performance.venue}
                </div>
              </div>

              {/* Quick Actions or additional info can go here */}
            </div>
          </div>

          {/* Right: Detailed Info (Flexible) */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#0a0c10] text-white overflow-y-auto custom-scrollbar">
            <div className="p-10 pt-16">
              <div className="space-y-12 max-w-2xl mx-auto ">
                {/* Top Stats */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white/[0.03] rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center group/card transition-all hover:bg-white/[0.05]">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">PERIOD</span>
                    <p className="text-base font-black leading-tight tracking-tight">
                      {performance.start_date.replace(/-/g, '.')} <br />
                      <span className="text-white/20 font-medium py-1 inline-block">~</span> <br />
                      {performance.end_date.replace(/-/g, '.')}
                    </p>
                  </div>
                  <div className="bg-white/[0.03] rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">STATUS</span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 animate-pulse" />
                      <Badge className="relative bg-sky-500/20 text-sky-400 border-sky-500/30 font-black text-[12px] px-6 py-2 rounded-full">
                        {performance.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Cast & Crew Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-px bg-sky-500/30" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400">CAST & CREW</h4>
                  </div>
                  <div className="bg-white/[0.03] rounded-[2rem] p-8 border border-white/10 space-y-6">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">출연진</span>
                      <div className="text-sm font-bold leading-relaxed text-white/90">
                        {loading ? <Skeleton className="h-4 w-32 bg-white/10 rounded-full" /> : displayData.cast}
                      </div>
                    </div>
                    {displayData.crew && (
                      <div className="space-y-3 pt-6 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">제작진</span>
                        <div className="text-sm font-bold leading-relaxed text-white/90">{displayData.crew}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Runtime & Price */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">RUNTIME</h4>
                    <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/10">
                      <p className="text-sm font-black text-sky-400">
                        {loading ? <Skeleton className="h-4 w-16 bg-white/10" /> : displayData.runtime}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">PRICE</h4>
                    <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/10">
                      <p className="text-sm font-black text-sky-400">
                        {loading ? <Skeleton className="h-4 w-24 bg-white/10" /> : displayData.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Introduction Images */}
                {displayData.styurls && displayData.styurls.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-px bg-sky-500/30" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400">INTRODUCTION</h4>
                    </div>
                    <div className="space-y-4">
                      {displayData.styurls.map((url: string, index: number) => (
                        <img
                          key={index}
                          src={url}
                          alt={`공연 상세 이미지 ${index + 1}`}
                          className="w-full rounded-2xl border border-white/5 shadow-2xl"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Links */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-px bg-sky-500/30" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400">BOOKING SITES</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {displayData.relate_urls && displayData.relate_urls.length > 0 ? (
                      displayData.relate_urls.map((site: any, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="w-full h-14 rounded-2xl bg-white/[0.03] border-white/10 hover:bg-sky-500 hover:text-white hover:border-sky-500 justify-between px-6 transition-all"
                          onClick={() => window.open(site.url, '_blank')}
                        >
                          <span className="font-bold text-xs uppercase tracking-widest">
                            {site.name ||
                              (site.url.includes('interpark')
                                ? '인터파크 티켓'
                                : site.url.includes('yes24')
                                  ? 'YES24 티켓'
                                  : site.url.includes('ticketlink')
                                    ? '티켓링크'
                                    : site.url.includes('playticket')
                                      ? '플레이티켓'
                                      : site.url.includes('naver')
                                        ? '네이버 예약'
                                        : '공식 예매처')}
                          </span>
                          <Ticket className="w-4 h-4 opacity-50" />
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl bg-white/[0.03] border-white/10 hover:bg-sky-500 hover:text-white hover:border-sky-500 justify-between px-6 transition-all"
                        onClick={handleBooking}
                      >
                        <span className="font-bold text-xs uppercase tracking-widest">
                          {displayData.relate_url
                            ? displayData.relate_url.includes('interpark')
                              ? '인터파크 티켓'
                              : displayData.relate_url.includes('yes24')
                                ? 'YES24 티켓'
                                : displayData.relate_url.includes('ticketlink')
                                  ? '티켓링크'
                                  : displayData.relate_url.includes('playticket')
                                    ? '플레이티켓'
                                    : displayData.relate_url.includes('naver')
                                      ? '네이버 예약'
                                      : '공식 예매처'
                            : '공식 예매 페이지'}
                        </span>
                        <Ticket className="w-4 h-4 opacity-50" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* KOPIS Info Box */}
                <div className="p-8 rounded-[2rem] bg-sky-500/[0.03] border border-sky-500/10 flex items-start gap-6 group/info transition-all hover:bg-sky-500/[0.05]">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0 group-hover/info:scale-110 transition-transform">
                    <Info className="w-6 h-6 text-sky-400" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold leading-relaxed text-white/60">
                      데이터가 부족한가요? KOPIS 공식 홈페이지에서 더 자세한 정보를 확인하실 수 있습니다.
                    </p>
                    <button
                      onClick={() => window.open(displayData.kopis_url, '_blank')}
                      className="flex items-center gap-2 text-[10px] font-black text-sky-400 uppercase tracking-widest hover:text-sky-300 transition-colors"
                    >
                      Visit Official Website <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-10 flex gap-6">
              <Button
                variant="ghost"
                className="flex-1 h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setIsOpen(false)}
              >
                닫기
              </Button>
              <Button
                variant="default"
                className="flex-[2] h-16 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-[0.3em] text-[11px] gap-4 shadow-[0_20px_50px_rgba(14,165,233,0.3)] transition-all active:scale-95"
                onClick={handleBooking}
              >
                <Ticket className="w-5 h-5" />
                {displayData.relate_url ? '예매 사이트로 이동' : '공식 정보 확인'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
