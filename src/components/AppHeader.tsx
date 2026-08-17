import Link from "next/link";
import { Bell, CircleUserRound, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

// (app) 配下の各画面の上部ヘッダー。左=アプリロゴ（ホームへ戻る）、中央=画面タイトル、
// 右=フレンド・通知（未読バッジ付き）・マイページ。
// title を省略するとロゴのみのシンプルなヘッダーになる（ホーム画面用）。
export default async function AppHeader({ title }: { title?: string }) {
  const userId = await getCurrentUserId();
  const unreadCount = userId
    ? await prisma.notification.count({ where: { userId, read: false } })
    : 0;

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
      <div className="flex items-center gap-1">
        <Link
          href="/friends"
          className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          aria-label="フレンド"
        >
          <Users size={20} strokeWidth={1.75} />
        </Link>
        <Link
          href="/notifications"
          className="relative rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          aria-label="通知"
        >
          <Bell size={20} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary" />
          )}
        </Link>
        <Link
          href="/settings"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-low"
          aria-label="マイページ"
        >
          <CircleUserRound size={18} strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
