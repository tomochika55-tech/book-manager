import Link from "next/link";
import { CircleUserRound } from "lucide-react";

// (app) 配下の各画面の上部ヘッダー。左=アプリロゴ（ホームへ戻る）、中央=画面タイトル、右=マイページ。
// title を省略するとロゴのみのシンプルなヘッダーになる（ホーム画面用）。
export default function AppHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-background px-margin-main">
      <Link
        href="/"
        className="-ml-1 flex items-center gap-2 rounded-full p-1 transition-opacity hover:opacity-80"
        aria-label="ホーム"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-8 w-8 rounded-md" />
      </Link>
      {title && (
        <h1 className="font-display-md text-display-md font-bold text-primary">{title}</h1>
      )}
      <Link
        href="/settings"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-low"
        aria-label="マイページ"
      >
        <CircleUserRound size={18} strokeWidth={1.75} />
      </Link>
    </header>
  );
}
