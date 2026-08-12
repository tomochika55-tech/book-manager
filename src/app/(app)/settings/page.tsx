import { CircleUserRound } from "lucide-react";
import { prisma } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/auth";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const userId = await getCurrentUserId();
  const finishedCount = userId
    ? await prisma.book.count({ where: { userId, status: "finished" } })
    : 0;

  return (
    <>
      <AppHeader title="設定" />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-md">
        <section className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
            <CircleUserRound size={28} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-headline-sm text-headline-sm truncate text-primary">
              {session?.user?.name || "ユーザー"}
            </p>
            <p className="font-body-md text-body-md truncate text-outline">
              {session?.user?.email}
            </p>
            <p className="font-label-sm text-label-sm mt-1 text-secondary">
              読了 {finishedCount} 冊
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <LogoutButton className="font-body-md text-body-md flex w-full items-center gap-3 px-4 py-3 text-left text-secondary transition-colors hover:bg-secondary-container/10" />
        </section>
      </main>
    </>
  );
}
