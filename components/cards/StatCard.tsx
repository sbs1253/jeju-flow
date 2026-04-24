"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: "ocean" | "sunset" | "tangerine" | "green" | "lava" | "forest";
  delay?: number;
}

const colorMap = {
  ocean: {
    bg: "bg-jeju-ocean/10",
    text: "text-jeju-ocean",
    icon: "bg-jeju-ocean/20",
  },
  sunset: {
    bg: "bg-jeju-sunset/10",
    text: "text-jeju-sunset",
    icon: "bg-jeju-sunset/20",
  },
  tangerine: {
    bg: "bg-jeju-tangerine/10",
    text: "text-jeju-tangerine",
    icon: "bg-jeju-tangerine/20",
  },
  green: {
    bg: "bg-jeju-green/10",
    text: "text-jeju-green",
    icon: "bg-jeju-green/20",
  },
  lava: {
    bg: "bg-jeju-lava/10",
    text: "text-jeju-lava",
    icon: "bg-jeju-lava/20",
  },
  forest: {
    bg: "bg-jeju-forest/10",
    text: "text-jeju-forest",
    icon: "bg-jeju-forest/20",
  },
};

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "ocean",
  delay = 0,
}: StatCardProps) {
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.ocean;

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <motion.div
              {...props}
              className="w-full text-left cursor-help"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              transition={{ delay, duration: 0.4 }}
            >
              <Card className="relative border-border/50 hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/5 overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${colors.text} opacity-30`}></div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                        {title}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black tracking-tighter">{value}</p>
                        {subtitle && <span className="text-[10px] text-muted-foreground font-medium">{subtitle}</span>}
                      </div>
                      {trend && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Badge 
                            variant="secondary"
                            className={`text-[10px] font-bold px-1.5 py-0 border-none ${
                              trend.value >= 0 
                                ? "bg-emerald-500/10 text-emerald-500" 
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                            {trend.label}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                    >
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        />
        <TooltipContent className="bg-popover text-popover-foreground border-border max-w-[200px] text-xs">
          <p>네이버 데이터랩 기준: 최대 검색량을 100으로 둔 상대적 비율값입니다.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
