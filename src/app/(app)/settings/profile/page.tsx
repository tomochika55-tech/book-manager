import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const userId = await getCurrentUserId();
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

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
        <h1 className="font-display-md text-display-md font-bold text-primary">プロフィール編集</h1>
      </header>
      <main className="px-margin-main pt-stack-md">
        <ProfileForm initialName={user?.name ?? ""} email={user?.email ?? ""} />
      </main>
    </>
  );
}
