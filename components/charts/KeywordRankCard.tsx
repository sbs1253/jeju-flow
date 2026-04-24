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
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {keywords.map((kw, idx) => (
          <motion.div
            key={kw.keyword}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ 
              x: 5,
              backgroundColor: "rgba(99, 102, 241, 0.05)",
              borderColor: "rgba(99, 102, 241, 0.2)"
            }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="group flex items-center justify-between py-3.5 px-4 rounded-2xl border border-white/5 bg-white/[0.01] transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-700 group-hover:text-indigo-500 transition-colors w-4">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors tracking-tight">
                {kw.keyword}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {kw.direction === "up" && (
                <div className="flex items-center gap-1.5 bg-emerald-500/5 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500">
                    +{kw.change.toFixed(1)}%
                  </span>
                </div>
              )}
              {kw.direction === "down" && (
                <div className="flex items-center gap-1.5 bg-rose-500/5 px-2 py-1 rounded-lg">
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-500">
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
