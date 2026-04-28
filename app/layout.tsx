import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeju Flow | 데이터 기반 제주 문화 트렌드 분석",
  description:
    "제주 플로우(Jeju Flow) - 전국 문화 콘텐츠 소비 트렌드를 실시간으로 분석하고 타겟 맞춤형 기획안을 제안하는 지능형 데이터 대시보드",
  keywords: ["제주플로우", "JejuFlow", "제주", "문화트렌드", "데이터분석", "대시보드", "AI인사이트"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
