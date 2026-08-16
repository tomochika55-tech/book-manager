import Link from "next/link";
import {
  CircleUserRound,
  Lock,
  Bell,
  Palette,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/auth";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const userId = await getCurrentUserId();

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const [thisYearCount, totalFinishedCount, user] = userId
    ? await Promise.all([
        prisma.book.count({
          where: { userId, status: "finished", finishedAt: { gte: startOfYear } },
        }),
        prisma.book.count({ where: { userId, status: "finished" } }),
        prisma.user.findUnique({ where: { id: userId } }),
      ])
    : [0, 0, null];

  return (
    <>
      <AppHeader title="設定" />
      <main className="flex flex-col gap-section-gap px-margin-main pb-8 pt-stack-md">
        <section className="flex flex-col items-center gap-1 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface-container-high bg-surface-container text-on-surface-variant">
            <CircleUserRound size={48} strokeWidth={1.5} />
          </div>
          <h2 className="font-headline-sm text-headline-sm mt-2 text-primary">
            {user?.name || session?.user?.name || "ユーザー"}
          </h2>
          <p className="font-body-md text-body-md text-outline">{user?.email}</p>
        </section>

        <section className="ambient-shadow flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
          <div className="flex flex-1 flex-col items-center">
            <span className="font-display-md text-display-md text-primary">{thisYearCount}</span>
            <span className="font-label-sm text-label-sm text-outline">今年読んだ本</span>
          </div>
          <div className="h-12 w-px bg-outline-variant/40" />
          <div className="flex flex-1 flex-col items-center">
            <span className="font-display-md text-display-md text-primary">{totalFinishedCount}</span>
            <span className="font-label-sm text-label-sm text-outline">通算読了</span>
          </div>
        </section>

        <section className="flex flex-col gap-stack-sm">
          <h3 className="font-label-sm text-label-sm pl-2 uppercase tracking-widest text-outline">
            アカウント設定
          </h3>
          <div className="ambient-shadow overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
            <SettingsRow href="/settings/profile" Icon={CircleUserRound} label="プロフィール編集" />
            <SettingsRow href="/settings/password" Icon={Lock} label="パスワード変更" />
            <SettingsRow Icon={Bell} label="通知設定" stub />
            <SettingsRow Icon={Palette} label="表示設定（ダークモードなど）" stub />
            <SettingsRow href="/settings/about" Icon={Info} label="このアプリについて" last />
          </div>
        </section>

        <section className="flex justify-center">
          <LogoutButton className="font-body-md text-body-md flex items-center gap-2 rounded-full border border-secondary px-8 py-3 text-secondary transition-colors hover:bg-secondary/5">
            <LogOut size={18} strokeWidth={1.75} />
            ログアウト
          </LogoutButton>
        </section>
      </main>
    </>
  );
}

function SettingsRow({
  href,
  Icon,
  label,
  stub = false,
  last = false,
}: {
  href?: string;
  Icon: typeof CircleUserRound;
  label: string;
  stub?: boolean;
  last?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <Icon size={20} strokeWidth={1.75} className="text-outline" />
        <span className="font-body-lg text-body-lg text-on-surface">{label}</span>
      </div>
      {stub ? (
        <span className="font-label-sm text-label-sm rounded-full bg-surface-variant px-2 py-0.5 text-on-surface-variant">
          準備中
        </span>
      ) : (
        <ChevronRight size={20} strokeWidth={1.75} className="text-outline-variant" />
      )}
    </>
  );

  const className = `flex items-center justify-between p-stack-md transition-colors ${
    last ? "" : "border-b border-outline-variant/20"
  } ${stub ? "opacity-60" : "hover:bg-surface-container-low"}`;

  if (stub || !href) {
    return <div className={className}>{content}</div>;
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
