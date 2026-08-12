import type { Metadata } from "next";
import { Noto_Serif_JP, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// 外部フォントCDNに依存しないよう、ビルド時に自己ホストする。
const notoSerifJP = Noto_Serif_JP({
  // Noto Serif JP は日本語グリフを標準搭載。subsets はラテン文字の追加読み込み用。
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yomu — 読書管理",
  description: "本を記録し、評価し、共有し、次の一冊に出会える読書管理サービス",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${plusJakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
