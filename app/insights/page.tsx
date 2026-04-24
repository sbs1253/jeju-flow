"use client";

import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Target, Calendar, MapPin, ArrowRight, Quote } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsights } from "@/hooks/use-dashboard-data";

function LoadingState() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[400px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { data: insights, isLoading } = useInsights();

  const summary = insights?.weekly_summary;
  const ideas = insights?.jeju_insights || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-jeju-tangerine mb-1">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-sm font-semibold tracking-widest uppercase">Planning Insights</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            제주형 문화 행사 기획 인사이트
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
            전국적인 트렌드 데이터와 제주만의 특수성을 결합하여 
            AI가 제안하는 독창적인 문화 행사 아이디어를 탐색합니다.
          </p>
        </motion.div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-12">
            {/* Top Analysis Quote */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden p-8 md:p-10 rounded-3xl border border-jeju-ocean/20 bg-gradient-to-br from-jeju-ocean/5 via-background to-jeju-tangerine/5"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote className="w-24 h-24" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jeju-ocean/10 text-jeju-ocean text-xs font-bold border border-jeju-ocean/20">
                    <Lightbulb className="w-3 h-3" />
                    WEEKLY ANALYSIS
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight max-w-4xl">
                    "{summary.headline}"
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                    {summary.summary}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Badge variant="secondary" className="bg-jeju-lava/10 text-jeju-lava border-jeju-lava/20 px-3 py-1">
                      #트렌드분석
                    </Badge>
                    <Badge variant="secondary" className="bg-jeju-ocean/10 text-jeju-ocean border-jeju-ocean/20 px-3 py-1">
                      #제주특화기획
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ideas Section Title */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h3 className="text-sm font-bold text-muted-foreground tracking-[0.2em] uppercase">AI Suggested Concepts</h3>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Ideas Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ideas.map((idea: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <Card className="h-full group hover:border-jeju-ocean/40 transition-all duration-300 overflow-hidden flex flex-col shadow-lg shadow-black/5">
                    <CardHeader className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-jeju-ocean/10 transition-colors">
                        <span className="text-xl font-black text-muted-foreground group-hover:text-jeju-ocean transition-colors">
                          0{idx + 1}
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-bold group-hover:text-jeju-ocean transition-colors">
                        {idea.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                      <p className="text-muted-foreground leading-relaxed">
                        {idea.concept}
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3">
                          <Target className="w-4 h-4 text-jeju-lava mt-1 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Audience</p>
                            <p className="text-sm font-medium">{idea.target}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-jeju-tangerine mt-1 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Best Timing</p>
                            <p className="text-sm font-medium">{idea.timing}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-8 px-6">
                      <div className="w-full p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                        <p className="text-[10px] font-black uppercase text-jeju-ocean flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Jeju Local Connection
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {idea.jejuConnection}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Bottom Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-8 rounded-3xl bg-muted/20 border border-dashed border-border flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold text-lg">기획안 아카이빙</h4>
                <p className="text-sm text-muted-foreground">마음에 드는 기획 아이디어를 아카이브에 저장하고 나중에 다시 확인하세요.</p>
              </div>
              <Badge variant="outline" className="px-6 py-3 cursor-pointer hover:bg-muted transition-colors gap-2">
                아카이브로 이동하기 <ArrowRight className="w-4 h-4" />
              </Badge>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
