"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Share2, Trash2 } from "lucide-react";

export default function BookActions({
  id,
  isPublic,
}: {
  id: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDelete() {
    if (!confirm("この本の記録を削除しますか？")) return;
    setDeleting(true);
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
      alert("削除に失敗しました");
    }
  }

  function handleCopy() {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isPublic && (
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-10 items-center gap-2 rounded-lg border border-outline/20 px-3 font-label-sm text-label-sm text-primary transition-colors hover:bg-surface-container-low"
        >
          <Share2 size={16} strokeWidth={1.75} />
          {copied ? "コピーしました" : "共有リンク"}
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex h-10 items-center gap-2 rounded-lg border border-error/30 px-3 font-label-sm text-label-sm text-error transition-colors hover:bg-error-container disabled:opacity-60"
      >
        <Trash2 size={16} strokeWidth={1.75} />
        {deleting ? "削除中..." : "削除"}
      </button>
    </div>
  );
}
