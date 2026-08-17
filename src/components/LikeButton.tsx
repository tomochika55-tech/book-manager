"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({
  bookId,
  initialLiked,
  initialCount,
}: {
  bookId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch(`/api/books/${bookId}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      /* 失敗時は状態を変えない */
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
        liked
          ? "border-secondary bg-secondary/10 text-secondary"
          : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
      }`}
    >
      <Heart size={16} strokeWidth={1.75} fill={liked ? "currentColor" : "none"} />
      {count > 0 ? count : "いいね"}
    </button>
  );
}
