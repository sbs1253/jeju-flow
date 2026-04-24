"use client";

import { motion } from "framer-motion";
import { BarChart3, MapPin, Music, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { GenrePieChart } from "@/components/charts/GenrePieChart";
import { StatCard } from "@/components/cards/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformances } from "@/hooks/use-dashboard-data";
import { Badge } from "@/components/ui/badge";

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );
}

export default function StatisticsPage() {
  const { data: performanceData, isLoading } = usePerformances();

  const performances = performanceData?.performances || [];
  const stats = performanceData?.stats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-jeju-ocean mb-1">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-sm font-semibold tracking-wide">STATISTICS</h2>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            공연·축제 현황 통계
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            전국 및 제주 지역에서 진행 중이거나 예정된 공연, 축제, 전시 등의 분포를 확인합니다.
          </p>
        </motion.div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            {/* Top Stats */}
            {stats && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatCard
                  title="전국 등록 행사"
                  value={stats.total.toLocaleString()}
                  subtitle="건"
                  icon={Music}
                  trend={{ value: 5.2, label: "KOPIS 기준" }}
                  color="ocean"
                />
                <StatCard
                  title="제주 지역 행사"
                  value={stats.jejuCount.toLocaleString()}
                  subtitle="건"
                  icon={MapPin}
                  trend={{ value: 0, label: `전체 대비 약 ${Math.round((stats.jejuCount / (stats.total || 1)) * 100)}%` }}
                  color="tangerine"
                />
                <StatCard
                  title="가장 많은 장르"
                  value={
                    (Object.entries(stats.byGenre) as [string, number][]).sort((a, b) => b[1] - a[1])[0]
                      ?.[0] || "-"
                  }
                  icon={BarChart3}
                  color="lava"
                />
                <StatCard
                  title="가장 많은 지역"
                  value={
                    (Object.entries(stats.byRegion) as [string, number][]).sort((a, b) => b[1] - a[1])[0]
                      ?.[0] || "-"
                  }
                  icon={MapPin}
                  color="forest"
                />
              </motion.div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full"
              >
                <GenrePieChart
                  data={stats?.byGenre || {}}
                  title="장르별 분포"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="h-full"
              >
                <CategoryBarChart
                  data={stats?.byRegion || {}}
                  title="지역별 공연/행사 수"
                  layout="horizontal"
                  height={300}
                />
              </motion.div>
            </div>

            {/* Recent Performances List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-jeju-tangerine" />
                    최근 수집된 공연 및 행사
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                      <tr>
                        <th className="px-6 py-4 font-medium">행사명</th>
                        <th className="px-6 py-4 font-medium">장르</th>
                        <th className="px-6 py-4 font-medium">지역</th>
                        <th className="px-6 py-4 font-medium">장소</th>
                        <th className="px-6 py-4 font-medium">상태</th>
                        <th className="px-6 py-4 font-medium">기간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {performances.slice(0, 15).map((p: any) => (
                        <tr key={p.performance_id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate">
                            {p.title}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="font-normal text-xs bg-muted/20">
                              {p.genre}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">{p.region}</td>
                          <td className="px-6 py-4 truncate max-w-[150px] text-muted-foreground">
                            {p.venue}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              className={`font-normal text-[10px] ${
                                p.status === "공연중" 
                                  ? "bg-jeju-ocean/20 text-jeju-ocean hover:bg-jeju-ocean/30" 
                                  : p.status === "공연완료"
                                  ? "bg-muted text-muted-foreground hover:bg-muted"
                                  : "bg-jeju-tangerine/20 text-jeju-tangerine hover:bg-jeju-tangerine/30"
                              }`}
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(p.start_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 
                            {" ~ "}
                            {new Date(p.end_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 출처 표기 */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            출처: (재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr)
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
