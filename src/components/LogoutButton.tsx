"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ??
        "font-body-md text-body-md rounded-lg px-4 py-2 font-medium text-secondary transition-colors hover:bg-secondary-container/20"
      }
    >
      ログアウト
    </button>
  );
}
