'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface InsightCardProps {
  headline: string;
  summary: string;
  highlight?: string;
  delay?: number;
}

export function InsightCard({ headline, summary, highlight, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.8,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ y: -5 }}
    >
      <Card className="border-border/50 bg-card/60 backdrop-blur-2xl overflow-hidden relative group">
        {/* Animated Scanning Line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-20"
          animate={{ y: [0, 300, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </motion.div>
              <div className="space-y-0.5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  AI Trends Intel
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500/80 uppercase">Live Analysis</span>
                </div>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full border border-border bg-muted text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
              Groq GPT-OSS-120B
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 relative z-10 mt-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
            className="text-2xl font-black leading-tight tracking-tighter text-foreground"
          >
            {headline}
          </motion.h3>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">{summary}</p>
          </motion.div>

          {highlight && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                delay: delay + 1.2, // 의도적으로 늦게 등장 (핵심 인사이트 강조)
                duration: 1,
                type: 'spring',
                stiffness: 50,
                damping: 20,
              }}
              className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-sky-400" />
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/10 blur-xl rounded-full" />
              <p className="text-xs text-indigo-600 dark:text-indigo-300 leading-relaxed font-bold italic tracking-tight">
                “{highlight}”
              </p>
            </motion.div>
          )}

          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              Source: Naver DataLab + KOPIS
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 8, 4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-0.5 bg-indigo-500/40"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
