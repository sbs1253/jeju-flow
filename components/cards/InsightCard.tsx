"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface InsightCardProps {
  headline: string;
  summary: string;
  highlight?: string;
  delay?: number;
}

export function InsightCard({
  headline,
  summary,
  highlight,
  delay = 0,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="border-border/50 overflow-hidden relative">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-jeju-ocean via-jeju-tangerine to-jeju-sunset" />

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-jeju-ocean/20 to-jeju-tangerine/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-jeju-tangerine" />
            </div>
            <CardTitle className="text-sm font-semibold">
              AI 트렌드 인사이트
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <h3 className="text-lg font-bold leading-snug gradient-text">
            {headline}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
          {highlight && (
            <div className="p-3 rounded-lg bg-jeju-ocean/5 border border-jeju-ocean/10">
              <p className="text-xs text-jeju-ocean leading-relaxed">
                💡 {highlight}
              </p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/60 text-right pt-2 border-t border-border/30">
            * 최근 30일간의 네이버 검색 트렌드 변화량 및 KOPIS 최근 수집 공연 통계를 기반으로 Gemini가 분석한 내용입니다.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
