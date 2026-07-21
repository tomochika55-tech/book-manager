// アプリ全体で使う型と、ステータス表示のためのラベル定義。

export type BookStatus = "want" | "reading" | "finished";

export const STATUS_LABELS: Record<BookStatus, string> = {
  want: "読みたい",
  reading: "読書中",
  finished: "読了",
};

export const STATUS_ORDER: BookStatus[] = ["reading", "want", "finished"];

export const STATUS_STYLES: Record<BookStatus, string> = {
  want: "bg-amber-100 text-amber-800",
  reading: "bg-brand-100 text-brand-800",
  finished: "bg-emerald-100 text-emerald-800",
};

export function isBookStatus(value: unknown): value is BookStatus {
  return value === "want" || value === "reading" || value === "finished";
}
