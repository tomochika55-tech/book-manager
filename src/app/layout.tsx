import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
                <span aria-hidden>📚</span> Yomu
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/" className="btn-ghost">
                  本棚
                </Link>
                <Link href="/recommendations" className="btn-ghost">
                  おすすめ
                </Link>
                <Link href="/books/new" className="btn-primary">
                  + 本を追加
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-gray-400">
            Yomu — あなたの読書を記録する
          </footer>
        </div>
      </body>
    </html>
  );
}
