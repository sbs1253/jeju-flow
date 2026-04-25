"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertCircle, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export function DevCollectButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCollect = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      const response = await fetch("/api/cron/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Data collection failed:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCollect}
      disabled={loading}
      className={cn(
        "h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider backdrop-blur-md transition-all duration-500",
        status === "success" ? "bg-green-500/10 border-green-500/50 text-green-500" :
        status === "error" ? "bg-destructive/10 border-destructive/50 text-destructive" :
        "bg-background/40 border-border/40 hover:bg-primary/10 hover:border-primary/30"
      )}
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
      ) : status === "success" ? (
        <Check className="w-3.5 h-3.5 mr-2" />
      ) : status === "error" ? (
        <AlertCircle className="w-3.5 h-3.5 mr-2" />
      ) : (
        <Database className="w-3.5 h-3.5 mr-2" />
      )}
      {loading ? "수집 중..." : status === "success" ? "수집 완료" : status === "error" ? "수집 실패" : "데이터 수집"}
    </Button>
  );
}
