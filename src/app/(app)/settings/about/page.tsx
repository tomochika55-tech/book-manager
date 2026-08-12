import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-2 bg-background px-margin-main">
        <Link
          href="/settings"
          className="-ml-2 rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          aria-label="設定へ戻る"
        >
          <ArrowLeft size={22} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display-md text-display-md font-bold text-primary">このアプリについて</h1>
      </header>
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-md">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center">
          <p className="font-display-lg text-display-lg text-primary">読む</p>
          <p className="font-body-md text-body-md mt-1 text-outline">Yomu — 読書管理アプリ</p>
        </div>
        <p className="font-body-lg text-body-lg leading-relaxed text-on-surface">
          「読む」は、読んだ本・読みたい本を記録し、感想を書き留め、次の一冊を見つけるための読書管理アプリです。
        </p>
      </main>
    </>
  );
}
