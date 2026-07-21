// ダッシュボード用の集計ロジック。純粋関数なのでテストしやすい。

type BookLike = {
  genre: string | null;
  status: string;
  rating: number | null;
  finishedAt: Date | null;
  pages: number | null;
};

export type MonthlyCount = { label: string; ym: string; count: number };
export type GenreCount = { genre: string; count: number };

/**
 * 直近 `months` か月の月別読了数を返す（古い順）。
 * 読了日(finishedAt)が無い読了本は集計対象外。
 */
export function monthlyFinished(books: BookLike[], months = 12): MonthlyCount[] {
  const now = new Date();
  const buckets: MonthlyCount[] = [];
  const index = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getMonth() + 1}月`;
    index.set(ym, buckets.length);
    buckets.push({ label, ym, count: 0 });
  }

  for (const b of books) {
    if (b.status !== "finished" || !b.finishedAt) continue;
    const d = new Date(b.finishedAt);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const idx = index.get(ym);
    if (idx != null) buckets[idx].count += 1;
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
