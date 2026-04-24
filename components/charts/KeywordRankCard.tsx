"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeywordData {
  keyword: string;
  change: number;
  direction: "up" | "down" | "stable";
}

interface KeywordRankCardProps {
  keywords: KeywordData[];
  title?: string;
}

export function KeywordRankCard({
  keywords,
  title = "급상승 키워드",
}: KeywordRankCardProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {keywords.map((kw, idx) => (
          <motion.div
            key={kw.keyword}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.1)"
            }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-400 transition-colors w-4">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                {kw.keyword}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {kw.direction === "up" && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500/80">
                    +{kw.change.toFixed(1)}%
                  </span>
                </div>
              )}
              {kw.direction === "down" && (
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-500/80">
                    {kw.change.toFixed(1)}%
                  </span>
                </div>
              )}
              {kw.direction === "stable" && (
                <Minus className="w-3 h-3 text-slate-600" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
