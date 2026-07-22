// ダッシュボード用の集計ロジック。純粋関数なのでテストしやすい。

type BookLike = {
  genre: string | null;
  status: string;
  rating: number | null;
  finishedAt: Date | null;
  pages: number | null;
};

export type MonthlyCount = { label: string; key: string; count: number };
export type YearlyCount = { label: string; key: string; count: number };
export type GenreCount = { genre: string; count: number };
export type StatusCount = { status: string; label: string; count: number };

/**
 * 直近 `months` か月の月別読了数を返す（古い順）。
 * 読了日(finishedAt)が無い読了本は集計対象外。
 */
export function monthlyFinished(books: BookLike[], months = 12): MonthlyCount[] {
  return monthlyAggregate(books, months, () => 1);
}

/** 直近 `months` か月の月別「読んだページ数」を返す（読了本のページ数を月に計上）。 */
export function monthlyPagesRead(books: BookLike[], months = 12): MonthlyCount[] {
  return monthlyAggregate(books, months, (b) => b.pages ?? 0);
}

function monthlyAggregate(
  books: BookLike[],
  months: number,
  valueOf: (b: BookLike) => number,
): MonthlyCount[] {
  const now = new Date();
  const buckets: MonthlyCount[] = [];
  const index = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getMonth() + 1}月`;
    index.set(key, buckets.length);
    buckets.push({ label, key, count: 0 });
  }

  for (const b of books) {
    if (b.status !== "finished" || !b.finishedAt) continue;
    const d = new Date(b.finishedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const idx = index.get(key);
    if (idx != null) buckets[idx].count += valueOf(b);
  }

  return buckets;
}

/** 直近 `years` 年分の年別読了数を返す（古い順）。 */
export function yearlyFinished(books: BookLike[], years = 5): YearlyCount[] {
  return yearlyAggregate(books, years, () => 1);
}

/** 直近 `years` 年分の年別「読んだページ数」を返す。 */
export function yearlyPagesRead(books: BookLike[], years = 5): YearlyCount[] {
  return yearlyAggregate(books, years, (b) => b.pages ?? 0);
}

function yearlyAggregate(
  books: BookLike[],
  years: number,
  valueOf: (b: BookLike) => number,
): YearlyCount[] {
  const now = new Date();
  const buckets: YearlyCount[] = [];
  const index = new Map<string, number>();

  for (let i = years - 1; i >= 0; i--) {
    const y = now.getFullYear() - i;
    const key = String(y);
    index.set(key, buckets.length);
    buckets.push({ label: `${y}年`, key, count: 0 });
  }

  for (const b of books) {
    if (b.status !== "finished" || !b.finishedAt) continue;
    const key = String(new Date(b.finishedAt).getFullYear());
    const idx = index.get(key);
    if (idx != null) buckets[idx].count += valueOf(b);
  }

  return buckets;
}

/** ジャンル別の冊数（多い順）。ジャンル未設定は「未分類」に集約。 */
export function genreDistribution(books: BookLike[]): GenreCount[] {
  const counts = new Map<string, number>();
  for (const b of books) {
    const g = b.genre?.trim() || "未分類";
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

/** ステータス別の冊数（積読/読書中/読了）。棒グラフ表示用。 */
export function statusBreakdown(books: BookLike[]): StatusCount[] {
  const order: { status: string; label: string }[] = [
    { status: "want", label: "積読" },
    { status: "reading", label: "読書中" },
    { status: "finished", label: "読了" },
  ];
  return order.map(({ status, label }) => ({
    status,
    label,
    count: books.filter((b) => b.status === status).length,
  }));
}

/** 積読（読みたいステータス）の冊数。 */
export function tsundokuCount(books: BookLike[]): number {
  return books.filter((b) => b.status === "want").length;
}

/** 読了本の合計ページ数。 */
export function totalPagesRead(books: BookLike[]): number {
  return books
    .filter((b) => b.status === "finished" && b.pages != null)
    .reduce((sum, b) => sum + (b.pages ?? 0), 0);
}
