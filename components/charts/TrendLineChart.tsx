"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendData {
  title: string;
  keywords: string[];
  data: { period: string; ratio: number }[];
}

interface TrendLineChartProps {
  data: TrendData[];
  title?: string;
  height?: number;
}

export function TrendLineChart({
  data,
  title,
  height = 400,
}: TrendLineChartProps) {
  if (!data || data.length === 0) return null;

  // 날짜별로 데이터를 병합하여 Recharts 포맷으로 변환
  const mergedData = data[0].data.map((d, idx) => {
    // 날짜 객체 생성 (안정적인 파싱)
    const dateObj = new Date(d.period);
    
    const point: Record<string, string | number> = {
      date: d.period,
      // 가독성 좋은 날짜 포맷 (예: 4.24)
      displayDate: isNaN(dateObj.getTime()) 
        ? d.period 
        : `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
    };

    data.forEach((series) => {
      // 해당 날짜의 ratio를 정확히 매칭 (인덱스 대신 period 기반 매칭이 안전하지만 일단 기존 로직 보강)
      const seriesPoint = series.data.find(sd => sd.period === d.period) || series.data[idx];
      point[series.title] = seriesPoint?.ratio ?? 0;
    });

    return point;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // 날짜순 정렬 보장

  const INK_COLORS = [
    "#1a3a3a", // Deep Teal Ink
    "#5a2a2a", // Deep Maroon Ink
    "#2a3a5a", // Deep Navy Ink
    "#3a4a2a", // Deep Forest Ink
    "#5a4a1a", // Deep Sepia Ink
  ];

  return (
    <div className="h-[400px] w-full bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mergedData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#14141415"
            vertical={false}
          />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 10, fill: "#14141480", fontWeight: "bold" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
            dy={10}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#14141480", fontWeight: "bold" }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#c4beaf",
              border: "1px solid #14141420",
              borderRadius: "0px",
              fontSize: "12px",
              color: "#141414",
              boxShadow: "none",
            }}
            itemStyle={{ fontWeight: "bold" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="square"
            formatter={(value) => (
              <span className="text-[10px] font-black uppercase tracking-widest text-ink/70 px-2">
                {value}
              </span>
            )}
          />
          {data.map((series, idx) => (
            <Line
              key={series.title}
              type="monotone"
              dataKey={series.title}
              stroke={INK_COLORS[idx % INK_COLORS.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
