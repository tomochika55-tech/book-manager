"use client";

import { useState } from "react";

type Props = {
  value: number | null;
  // 指定すると編集可能になり、変更時に呼ばれる
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
};

const SIZES = { sm: "text-base", md: "text-xl", lg: "text-3xl" };

/**
 * 星評価。onChange を渡すとクリックで編集できる。
 * 渡さなければ表示専用。
 */
export default function StarRating({ value, onChange, size = "md" }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const editable = typeof onChange === "function";
  const shown = hover ?? value ?? 0;

  return (
    <div className={`inline-flex ${SIZES[size]}`} role={editable ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!editable}
          aria-label={`${star} つ星`}
          className={`${editable ? "cursor-pointer" : "cursor-default"} px-0.5 leading-none ${
            star <= shown ? "text-amber-400" : "text-gray-300"
          }`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => editable && setHover(star)}
          onMouseLeave={() => editable && setHover(null)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
