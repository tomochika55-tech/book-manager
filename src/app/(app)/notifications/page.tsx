import Link from "next/link";
import { ArrowLeft, Heart, UserPlus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";
import MarkNotificationsRead from "@/components/MarkNotificationsRead";

export const dynamic = "force-dynamic";

function formatRelative(d: Date) {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "昨日";
  if (diffDay < 7) return `${diffDay}日前`;
  return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
}

export default async function NotificationsPage() {
  const userId = await getCurrentUserId();
  const notifications = userId
    ? await prisma.notification.findMany({
        where: { userId },
        include: { actor: { select: { name: true } }, book: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-2 bg-background px-margin-main">
        <Link
          href="/"
          className="-ml-2 rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          aria-label="ホームへ戻る"
        >
          <ArrowLeft size={22} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display-md text-display-md font-bold text-primary">通知</h1>
      </header>
      <main className="flex flex-col gap-stack-md px-margin-main pb-8 pt-stack-md">
        {notifications.length === 0 ? (
          <p className="font-body-md text-body-md text-outline">まだ通知はありません。</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`relative flex items-start gap-4 rounded-xl p-4 ${
                n.read ? "" : "border border-[#E5E0D0] bg-surface-container/50"
              }`}
            >
              {!n.read && (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-secondary" />
              )}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  n.type === "like"
                    ? "bg-secondary-container/20 text-secondary"
                    : "bg-primary-container/20 text-primary"
                }`}
              >
                {n.type === "like" ? (
                  <Heart size={18} strokeWidth={1.75} fill="currentColor" />
                ) : (
                  <UserPlus size={18} strokeWidth={1.75} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-semibold">{n.actor.name || "ユーザー"}</span>
                  {n.type === "like" ? (
                    <>
                      があなたの「{n.book?.title ?? "本"}」の記録に「いいね」しました。
                    </>
                  ) : (
                    <>があなたをフォローしました。</>
                  )}
                </p>
                <span className="font-label-sm text-label-sm mt-1 block text-outline">
                  {formatRelative(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </main>
      <MarkNotificationsRead />
    </>
  );
}
