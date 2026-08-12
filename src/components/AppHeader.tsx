import Link from "next/link";
import { BookOpen, CircleUserRound } from "lucide-react";

// (app) 配下の各画面の上部ヘッダー。左=ホームへ戻る、中央=画面タイトル、右=マイページ。
export default function AppHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-background px-margin-main">
      <Link
        href="/"
        className="-ml-2 rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
        aria-label="ホーム"
      >
        <BookOpen size={22} strokeWidth={1.75} />
      </Link>
      <h1 className="font-display-md text-display-md font-bold text-primary">{title}</h1>
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
