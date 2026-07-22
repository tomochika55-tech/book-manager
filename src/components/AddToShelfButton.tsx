"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// おすすめ一覧から「本棚に追加」を押したときの動作:
// 1) Google Books で書名を検索して詳細（表紙・ページ数など）を取得
// 2) 「読みたい」ステータスで自分の本棚に登録
export default function AddToShelfButton({
  title,
  author,
  genre,
}: {
  title: string;
  author: string;
  genre: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleAdd() {
    if (state !== "idle") return;
    setState("loading");
    try {
      // 1) Google Books で詳細を取得（失敗しても最低限のデータで登録は進める）
      let coverUrl: string | null = null;
      let pages: number | null = null;
      try {
        const q = `${title} ${author}`.trim();
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const hit = (data.results ?? []).find(
          (r: { title: string; author: string }) =>
            r.title.replace(/\s/g, "") === title.replace(/\s/g, ""),
        ) ?? data.results?.[0];
        if (hit) {
          coverUrl = hit.coverUrl ?? null;
          pages = hit.pages ?? null;
        }
      } catch {
        /* 検索失敗はスキップして最低限で登録 */
      }

      // 2) 本棚に登録（読みたいステータス）
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          genre,
          coverUrl,
          pages,
          status: "want",
        }),
      });
      if (!res.ok) throw new Error("追加に失敗しました");

      setState("done");
      router.refresh();
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const label = {
    idle: "読みたいに追加",
    loading: "追加中...",
    done: "✓ 追加しました",
    error: "エラー",
  }[state];

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={state !== "idle"}
      className={`btn flex-shrink-0 text-xs ${
        state === "done"
          ? "bg-emerald-100 text-emerald-700"
          : state === "error"
            ? "bg-red-100 text-red-700"
            : "bg-brand-100 text-brand-700 hover:bg-brand-200"
      }`}
    >
      {label}
    </button>
  );
}
