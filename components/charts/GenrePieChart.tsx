"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "oklch(0.65 0.2 250)",   // ocean blue
  "oklch(0.72 0.18 180)",  // teal
  "oklch(0.72 0.16 70)",   // tangerine
  "oklch(0.65 0.2 340)",   // pink
  "oklch(0.6 0.15 140)",   // green
  "oklch(0.7 0.1 200)",    // light blue
  "oklch(0.8 0.15 90)",    // yellow
];

interface GenrePieChartProps {
  data: Record<string, number>;
  title?: string;
}

export function GenrePieChart({ data, title = "장르별 비율" }: GenrePieChartProps) {
  // Record<string, number>를 Recharts에 맞는 배열 형태로 변환
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // 값이 큰 순서대로 정렬

  if (chartData.length === 0) return null;

  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex justify-center">
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                stroke="oklch(0.2 0 0)"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.18 0.015 260)",
                  border: "1px solid oklch(0.3 0.02 260)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "oklch(0.9 0 0)",
                }}
                formatter={(value: any, name: any) => [`${value}건`, name]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
