"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

interface CategoryBarChartProps {
  data: Record<string, number>;
  title?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
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

export function CategoryBarChart({
  data,
  title = "분석 현황",
  height: initialHeight = 300,
}: CategoryBarChartProps) {
  const chartData = useMemo(() => 
    Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  , [data]);

  if (chartData.length === 0) return null;

  // 데이터 개수에 따라 높이 및 막대 두께 자동 조절
  // 항목이 적을수록 막대를 두껍게, 많을수록 적절하게 조정
  const itemCount = chartData.length;
  const calculatedHeight = Math.max(initialHeight, itemCount * 45);
  const barSize = itemCount <= 2 ? 48 : itemCount <= 5 ? 32 : 24;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div style={{ width: "100%", height: calculatedHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="opacity-5"
                horizontal={false}
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.9, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                width={80}
                interval={0}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "currentColor", opacity: 0.05, radius: 4 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={barSize}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-all duration-300 cursor-pointer shadow-lg"
                    style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
                  />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  style={{ fill: "currentColor", fontSize: "12px", fontWeight: "900", opacity: 0.9 }}
                  offset={15}
                  formatter={(value: any) => `${value.toLocaleString()}건`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
