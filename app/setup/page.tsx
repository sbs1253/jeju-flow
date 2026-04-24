"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Search,
  Theater,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/DashboardLayout";

type CheckStatus = "idle" | "loading" | "success" | "error";

interface CheckResult {
  status: CheckStatus;
  message: string;
  detail?: string;
}

const SETUP_STEPS = [
  {
    id: "supabase",
    title: "Supabase 연결",
    description: "데이터베이스 연결 확인",
    icon: Database,
    endpoint: "/api/setup/check-supabase",
  },
  {
    id: "naver",
    title: "네이버 DataLab API",
    description: "검색 트렌드 API 키 확인",
    icon: Search,
    endpoint: "/api/setup/check-naver",
  },
  {
    id: "kopis",
    title: "KOPIS API",
    description: "공연예술 API 키 확인",
    icon: Theater,
    endpoint: "/api/setup/check-kopis",
  },
  {
    id: "gemini",
    title: "Gemini API",
    description: "AI 인사이트 API 키 확인",
    icon: Sparkles,
    endpoint: "/api/setup/check-gemini",
  },
];

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case "loading":
      return <Loader2 className="w-5 h-5 text-jeju-ocean animate-spin" />;
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "error":
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );
}

export default function SetupPage() {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [sampleDataStatus, setSampleDataStatus] = useState<CheckResult>({
    status: "idle",
    message: "",
  });

  const runCheck = async (id: string, endpoint: string) => {
    setResults((prev) => ({
      ...prev,
      [id]: { status: "loading", message: "확인 중..." },
    }));

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      setResults((prev) => ({
        ...prev,
        [id]: {
          status: data.ok ? "success" : "error",
          message: data.message,
          detail: data.detail,
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [id]: {
          status: "error",
          message: "연결 실패",
          detail: String(error),
        },
      }));
    }
  };

  const runAllChecks = async () => {
    for (const step of SETUP_STEPS) {
      await runCheck(step.id, step.endpoint);
    }
  };

  const testSampleData = async () => {
    setSampleDataStatus({ status: "loading", message: "샘플 데이터 로딩 중..." });

    try {
      const [trends, performances, insights] = await Promise.all([
        fetch("/api/trends").then((r) => r.json()),
        fetch("/api/performances").then((r) => r.json()),
        fetch("/api/insights").then((r) => r.json()),
      ]);

      const trendCount = trends?.results?.length || 0;
      const perfCount = performances?.performances?.length || 0;
      const hasInsights = !!insights?.weekly_summary;

      setSampleDataStatus({
        status: "success",
        message: `트렌드 ${trendCount}개 그룹 · 공연 ${perfCount}개 · 인사이트 ${hasInsights ? "있음" : "없음"}`,
        detail: `트렌드 키워드: ${trends?.results?.map((r: { title: string }) => r.title).join(", ") || "없음"}`,
      });
    } catch (error) {
      setSampleDataStatus({
        status: "error",
        message: "데이터 로딩 실패",
        detail: String(error),
      });
    }
  };

  const allSuccess = SETUP_STEPS.every(
    (s) => results[s.id]?.status === "success"
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold tracking-tight">셋업 가이드</h1>
          <p className="text-sm text-muted-foreground">
            대시보드를 사용하기 위한 환경 설정을 확인합니다
          </p>
        </motion.div>

        {/* Step 1: .env.local 설정 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">
                📋 Step 1. 환경변수 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                프로젝트 루트에 <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> 파일을 생성하고 아래 값들을 채워주세요.
              </p>

              <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground"># Supabase (supabase.com)</span>
                  <CopyButton text="NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=" />
                </div>
                <div>NEXT_PUBLIC_SUPABASE_URL=<span className="text-jeju-ocean">https://xxx.supabase.co</span></div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-jeju-ocean">eyJ...</span></div>
                <div>SUPABASE_SERVICE_ROLE_KEY=<span className="text-jeju-ocean">eyJ...</span></div>
                <Separator className="my-2" />
                <div className="text-muted-foreground"># 네이버 개발자센터 (developers.naver.com)</div>
                <div>NAVER_CLIENT_ID=<span className="text-jeju-sunset">your-id</span></div>
                <div>NAVER_CLIENT_SECRET=<span className="text-jeju-sunset">your-secret</span></div>
                <Separator className="my-2" />
                <div className="text-muted-foreground"># KOPIS (kopis.or.kr)</div>
                <div>KOPIS_API_KEY=<span className="text-jeju-tangerine">your-key</span></div>
                <Separator className="my-2" />
                <div className="text-muted-foreground"># Google AI Studio (ai.google.dev)</div>
                <div>GEMINI_API_KEY=<span className="text-jeju-green">your-key</span></div>
                <Separator className="my-2" />
                <div className="text-muted-foreground"># 기타</div>
                <div>CRON_SECRET=<span className="text-muted-foreground">any-random-string</span></div>
                <div>USE_SAMPLE_DATA=<span className="text-muted-foreground">true</span></div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-jeju-ocean hover:underline"
                >
                  Supabase 대시보드 <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://developers.naver.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-jeju-sunset hover:underline"
                >
                  네이버 개발자센터 <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-jeju-green hover:underline"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 2: Supabase 테이블 생성 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">
                🗄️ Step 2. Supabase 테이블 생성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Supabase 대시보드 → SQL Editor에서{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  supabase/schema.sql
                </code>{" "}
                파일의 내용을 복사하여 실행해주세요.
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Database className="w-4 h-4 text-jeju-ocean shrink-0" />
                <span className="text-xs text-muted-foreground">
                  search_trends · performances · ai_insights · weekly_snapshots
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 3: 연결 확인 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                🔌 Step 3. 연결 확인
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={runAllChecks}
                className="gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                전체 확인
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {SETUP_STEPS.map((step, idx) => {
                const result = results[step.id];
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {result?.message || step.description}
                        </p>
                        {result?.detail && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {result.detail}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={result?.status || "idle"} />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => runCheck(step.id, step.endpoint)}
                      >
                        확인
                      </Button>
                    </div>
                  </motion.div>
                );
              })}

              {allSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center"
                >
                  <p className="text-sm font-medium text-emerald-500">
                    ✅ 모든 연결이 정상입니다!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    대시보드를 사용할 준비가 되었습니다
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 4: 샘플 데이터 확인 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  📊 Step 4. 데이터 확인
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  API 키가 없어도 샘플 데이터로 테스트 가능 (USE_SAMPLE_DATA=true)
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={testSampleData}
                className="gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                데이터 확인
              </Button>
            </CardHeader>
            <CardContent>
              {sampleDataStatus.status !== "idle" && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <StatusIcon status={sampleDataStatus.status} />
                  <div>
                    <p className="text-sm">{sampleDataStatus.message}</p>
                    {sampleDataStatus.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sampleDataStatus.detail}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {sampleDataStatus.status === "idle" && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  버튼을 눌러 데이터가 정상적으로 로드되는지 확인하세요
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Current env status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">현재 모드</span>
                <Badge variant="secondary" className="text-[10px]">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? "실제 데이터"
                    : "샘플 데이터"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
