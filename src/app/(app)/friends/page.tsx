import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FriendsList from "@/components/FriendsList";

export default function FriendsPage() {
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
        <h1 className="font-display-md text-display-md font-bold text-primary">フレンド</h1>
      </header>
      <main className="px-margin-main pb-8 pt-stack-md">
        <FriendsList />
      </main>
    </>
  );
}
