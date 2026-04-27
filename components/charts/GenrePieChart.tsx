"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const COLORS = [
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

interface GenrePieChartProps {
  data: Record<string, number>;
  title?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/80 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-2xl shadow-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{data.name}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
          <p className="text-sm font-black text-foreground">
            {payload[0].value.toLocaleString()} <span className="text-[10px] text-muted-foreground">건</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function GenrePieChart({ data, title = "전국 장르별 분포" }: GenrePieChartProps) {
  const chartData = useMemo(() => 
    Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  , [data]);

  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

  if (chartData.length === 0) return null;

  return (
    <Card className="border-border/50 h-full flex flex-col bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col gap-10">
        {/* Chart Section with Center Total */}
        <div className="w-full h-[280px] relative min-w-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TOTAL</span>
            <span className="text-3xl font-black text-foreground tracking-tighter">{total.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-muted-foreground">건</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                stroke="transparent"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 장르별 상세 데이터 리스트 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
              Genre Breakdown
            </h4>
            <Badge variant="outline" className="text-[9px] font-bold px-1.5 h-4 border-primary/20 text-primary uppercase tracking-tighter">
              Live Data
            </Badge>
          </div>
          
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-muted/5 rounded-xl p-3 border border-transparent hover:border-primary/20 hover:bg-muted/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="text-xs font-bold text-foreground/90 group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground">
                      {item.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground ml-1">
                      {((item.value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* 미니 프로그레스 바 */}
                <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
