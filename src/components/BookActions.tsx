"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="flex flex-wrap gap-2">
      {isPublic && (
        <button type="button" className="btn-ghost" onClick={handleCopy}>
          {copied ? "コピーしました！" : "🔗 共有リンクをコピー"}
        </button>
      )}
      <button type="button" className="btn-danger" onClick={handleDelete} disabled={deleting}>
        {deleting ? "削除中..." : "削除"}
      </button>
    </div>
  );
}
