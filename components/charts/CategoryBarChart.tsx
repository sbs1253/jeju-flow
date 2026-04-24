"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "oklch(0.65 0.2 250)",
  "oklch(0.72 0.18 180)",
  "oklch(0.72 0.16 70)",
  "oklch(0.65 0.2 340)",
  "oklch(0.6 0.15 140)",
  "oklch(0.7 0.15 200)",
  "oklch(0.68 0.18 300)",
  "oklch(0.75 0.12 120)",
];

interface CategoryBarChartProps {
  data: Record<string, number>;
  title?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
}

export function CategoryBarChart({
  data,
  title = "카테고리별 비교",
  height = 300,
  layout = "vertical",
}: CategoryBarChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) return null;

  if (layout === "horizontal") {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.5 0 0 / 10%)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.18 0.015 260)",
                  border: "1px solid oklch(0.3 0.02 260)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "oklch(0.9 0 0)",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.5 0 0 / 10%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.18 0.015 260)",
                border: "1px solid oklch(0.3 0.02 260)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "oklch(0.9 0 0)",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
