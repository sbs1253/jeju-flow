"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Hash, ArrowUpRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { KeywordRankCard } from "@/components/charts/KeywordRankCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTrends, useInsights } from "@/hooks/use-dashboard-data";

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[500px] rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const { data: trends, isLoading: trendsLoading } = useTrends();
  const { data: insights, isLoading: insightsLoading } = useInsights();

  const isLoading = trendsLoading || insightsLoading;

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
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-sm font-semibold tracking-wide">TRENDS</h2>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            문화 콘텐츠 검색 트렌드
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            전국 사용자의 네이버 검색 데이터를 기반으로 공연, 축제, 전시 등 문화 예술 분야의 
            관심도 변화를 추적합니다.
          </p>
        </motion.div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            {/* Main Chart */}
            {trends?.results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TrendLineChart
                  data={trends.results}
                  title="카테고리별 검색량 추이 (상대 비율)"
                  height={450}
                />
              </motion.div>
            )}

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Insight Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="border-border/50 h-full bg-gradient-to-br from-background to-muted/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-lg">AI 트렌드 분석 요약</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {insights?.weekly_summary ? (
                      <>
                        <div>
                          <h3 className="text-xl font-bold mb-3 gradient-text">
                            {insights.weekly_summary.headline}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {insights.weekly_summary.summary}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/50 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-jeju-tangerine" />
                          <p className="text-sm font-medium flex items-center gap-2 mb-2">
                            <ArrowUpRight className="w-4 h-4 text-jeju-tangerine" />
                            핵심 변화 포인트
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {insights.weekly_summary.highlight}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">분석 데이터를 불러오지 못했습니다.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Rising Keywords */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/50 h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Hash className="w-4 h-4 text-emerald-500" />
                      </div>
                      <CardTitle className="text-lg">주목해야 할 키워드</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {insights?.trending_keywords ? (
                      <div className="space-y-6">
                        <KeywordRankCard
                          keywords={insights.trending_keywords.filter(
                            (k: any) => k.direction === "up"
                          )}
                          title="급상승"
                        />
                        <div className="pt-4 border-t border-border/50">
                          <KeywordRankCard
                            keywords={insights.trending_keywords.filter(
                              (k: any) => k.direction === "down"
                            )}
                            title="하락/정체"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">키워드 데이터가 없습니다.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Keyword Groups Reference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    추적 중인 검색어 그룹
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trends?.results?.map((group: any) => (
                      <div
                        key={group.title}
                        className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/50 bg-muted/20"
                      >
                        <span className="text-xs font-bold">{group.title}</span>
                        <div className="flex flex-wrap gap-1">
                          {group.keywords.map((kw: string) => (
                            <Badge
                              key={kw}
                              variant="secondary"
                              className="text-[10px] bg-background border-border/50"
                            >
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
