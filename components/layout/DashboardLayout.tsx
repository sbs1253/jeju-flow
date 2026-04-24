"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Archive,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Palmtree,
  Newspaper,
  MapPin,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "검색 트렌드", icon: LayoutDashboard },
  { href: "/statistics", label: "공연·축제 통계", icon: BarChart3 },
  { href: "/setup", label: "셋업 가이드", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative block"
    >
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          isActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jeju-ocean to-jeju-tangerine flex items-center justify-center">
            <Palmtree className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">제주 플로우</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">트렌드 대시보드</p>
          </div>
        </Link>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            isActive={pathname === item.href}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <Separator className="mx-4 w-auto" />

      {/* Footer */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">테마</span>
          <ThemeToggle />
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
          네이버 DataLab · KOPIS · Gemini AI
          <br />
          데이터 기반 문화 트렌드 분석
        </p>
      </div>
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isNewspaper = theme === "newspaper" || resolvedTheme === "newspaper";
  const isHomePage = pathname === "/";
  const showNewspaperStyle = isNewspaper && isHomePage;

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-500",
      showNewspaperStyle 
        ? "bg-paper text-ink font-serif selection:bg-jeju-tangerine/30" 
        : "bg-background text-foreground font-sans"
    )}>
      {/* Miranda Style Noise Overlay - Only on Home Page with Newspaper Theme */}
      {showNewspaperStyle && (
        <div className="noise-overlay" style={{ opacity: 0.08 }}></div>
      )}
      
      {/* Sidebar - Also conditional based on Home Page */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r z-50 transition-colors duration-500",
        showNewspaperStyle 
          ? "bg-paper border-ink/10" 
          : "border-border/40 bg-background/60 backdrop-blur-xl"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              showNewspaperStyle ? "bg-ink text-paper" : "bg-primary text-primary-foreground"
            )}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn(
                "text-sm font-black tracking-tighter uppercase",
                showNewspaperStyle ? "text-ink" : "text-foreground"
              )}>Jeju Flow</h2>
              <p className={cn(
                "text-[10px] font-medium uppercase tracking-widest opacity-60",
                showNewspaperStyle ? "text-ink" : "text-muted-foreground"
              )}>Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? showNewspaperStyle 
                      ? "bg-ink text-paper" 
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : showNewspaperStyle
                      ? "text-ink/60 hover:text-ink hover:bg-ink/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive ? "" : "opacity-70"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn(
          "p-4 border-t space-y-4",
          showNewspaperStyle ? "border-ink/10" : "border-border/40"
        )}>
          <button
            onClick={() => setTheme(isNewspaper ? "light" : "newspaper")}
            className={cn(
              "w-full flex items-center gap-2 p-3 transition-all",
              showNewspaperStyle 
                ? "bg-ink text-paper font-black text-[10px] uppercase tracking-[0.3em]" 
                : "bg-primary text-primary-foreground rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02]"
            )}
          >
            <Newspaper className="w-4 h-4" />
            <span>{isNewspaper ? "현대적 모드 전환" : "신문 모드 읽기"}</span>
          </button>

          <div className={cn(
            "p-4 border",
            showNewspaperStyle 
              ? "bg-paper-darker/30 border-ink/10" 
              : "rounded-2xl bg-muted/30 border-border/50"
          )}>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-3",
              showNewspaperStyle ? "text-ink/60" : "text-muted-foreground"
            )}>System Theme</p>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs font-bold",
                showNewspaperStyle ? "text-ink" : "text-foreground"
              )}>테마 설정</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen relative flex flex-col flex-1 overflow-auto">
        {/* Subtle background glow effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-jeju-ocean/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-jeju-tangerine/5 blur-[120px]" />
        </div>

        {/* Header - Mobile Only */}
        <div className="lg:hidden sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/40 p-4 flex items-center justify-between z-40">
          <Link href="/" className="flex items-center gap-2">
            <Palmtree className="text-jeju-ocean w-6 h-6" />
            <span className="font-black tracking-tighter">JEJU FLOW</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="메뉴 열기">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0 bg-background/95 backdrop-blur-xl">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 relative z-10">
          {children}
        </div>

        {/* Global Footer - Attribution */}
        <footer className="p-6 md:p-8 border-t border-border/40 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] md:text-xs text-muted-foreground">
              © 2026 Jeju Flow Trend Dashboard. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground">출처:</span>
              <a 
                href="https://www.kopis.or.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] md:text-xs font-medium hover:text-jeju-ocean transition-colors"
              >
                (재)예술경영지원센터 공연예술통합전산망 (www.kopis.or.kr)
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
