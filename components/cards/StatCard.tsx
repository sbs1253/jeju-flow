'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'ocean' | 'sunset' | 'tangerine' | 'green' | 'lava' | 'forest';
  delay?: number;
}

const colorMap = {
  ocean: {
    bg: 'bg-jeju-ocean/10',
    text: 'text-jeju-ocean',
    icon: 'bg-jeju-ocean/20',
  },
  sunset: {
    bg: 'bg-jeju-sunset/10',
    text: 'text-jeju-sunset',
    icon: 'bg-jeju-sunset/20',
  },
  tangerine: {
    bg: 'bg-jeju-tangerine/10',
    text: 'text-jeju-tangerine',
    icon: 'bg-jeju-tangerine/20',
  },
  green: {
    bg: 'bg-jeju-green/10',
    text: 'text-jeju-green',
    icon: 'bg-jeju-green/20',
  },
  lava: {
    bg: 'bg-jeju-lava/10',
    text: 'text-jeju-lava',
    icon: 'bg-jeju-lava/20',
  },
  forest: {
    bg: 'bg-jeju-forest/10',
    text: 'text-jeju-forest',
    icon: 'bg-jeju-forest/20',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'ocean', delay = 0 }: StatCardProps) {
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.ocean;

  return (
    <motion.div
      className="w-full h-full text-left"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        delay,
        duration: 0.4,
      }}
    >
      <Card className="relative h-full border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden group">
        {/* Animated Accent Line */}
        <motion.div
          className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-50 ${colors.text}`}
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />

        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <motion.p
                transition={{ duration: 0.3 }}
                className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-slate-300"
              >
                {title}
              </motion.p>
              <div className="flex items-baseline gap-1.5">
                <motion.p
                  className="text-4xl font-black tracking-tighter text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.3 }}
                >
                  {value}
                </motion.p>
                {subtitle && <span className="text-[10px] text-muted-foreground font-medium">{subtitle}</span>}
              </div>
              {trend && (
                <div className="flex items-center gap-2 pt-1">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-black px-2 py-0.5 border-none rounded-full ${
                      trend.value >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {trend.label}
                  </span>
                </div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center shadow-lg border border-border/50 group-hover:border-border transition-all duration-300`}
            >
              <Icon className={`w-7 h-7 ${colors.text}`} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
