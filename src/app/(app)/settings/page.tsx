import Link from "next/link";
import {
  CircleUserRound,
  Bell,
  Palette,
  CloudUpload,
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
  const [finishedCount, user] = userId
    ? await Promise.all([
        prisma.book.count({ where: { userId, status: "finished" } }),
        prisma.user.findUnique({ where: { id: userId } }),
      ])
    : [0, null];

  return (
    <>
      <AppHeader title="設定" />
      <main className="flex flex-col gap-section-gap px-margin-main pt-stack-md">
        <section className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface-container-high bg-surface-container text-on-surface-variant">
            <CircleUserRound size={48} strokeWidth={1.5} />
          </div>
          <h2 className="font-display-md text-display-md mt-2 text-primary">
            {user?.name || session?.user?.name || "ユーザー"}
          </h2>
          <p className="font-body-md text-body-md text-outline">読了 {finishedCount} 冊</p>
        </section>

        <section className="flex flex-col gap-stack-sm">
          <SettingsLink href="/settings/profile" Icon={CircleUserRound} label="プロフィール編集" />
          <SettingsStub Icon={Bell} label="通知設定" />
          <SettingsStub Icon={Palette} label="表示設定（ダークモードなど）" />
          <SettingsStub Icon={CloudUpload} label="データのバックアップ" />
          <SettingsLink href="/settings/about" Icon={Info} label="このアプリについて" />

          <LogoutButton className="ambient-shadow mt-stack-sm flex w-full items-center gap-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md text-left transition-colors hover:bg-error-container/40">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
              <LogOut size={20} strokeWidth={1.75} />
            </span>
            <span className="font-body-lg text-body-lg flex-1 text-on-surface">ログアウト</span>
          </LogoutButton>
        </section>
      </main>
    </>
  );
}

function SettingsLink({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: typeof CircleUserRound;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="ambient-shadow flex items-center gap-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md transition-colors hover:bg-surface-container-low"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-variant text-primary-container">
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <span className="font-body-lg text-body-lg flex-1 text-on-surface">{label}</span>
      <ChevronRight size={20} strokeWidth={1.75} className="text-outline" />
    </Link>
  );
}

function SettingsStub({ Icon, label }: { Icon: typeof CircleUserRound; label: string }) {
  return (
    <div className="flex items-center gap-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md opacity-60">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <span className="font-body-lg text-body-lg flex-1 text-on-surface">{label}</span>
      <span className="font-label-sm text-label-sm rounded-full bg-surface-variant px-2 py-0.5 text-on-surface-variant">
        準備中
      </span>
    </div>
  );
}
