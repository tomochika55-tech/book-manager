"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 通知ページを開いたら未読をすべて既読にする（ヘッダーのバッジをクリアするため）
export default function MarkNotificationsRead() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications", { method: "PATCH" }).then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
