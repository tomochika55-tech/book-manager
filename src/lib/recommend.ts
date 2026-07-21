import { CATALOG, type CatalogBook } from "@/lib/catalog";

type BookLike = {
  title: string;
  genre: string | null;
  status: string;
  rating: number | null;
};

export type Recommendation = {
  book: CatalogBook;
  basedOn: string; // なぜこれを勧めるのかの説明
};

export type RecommendResult = {
  favoriteGenre: string | null;
  recommendations: Recommendation[];
};

/**
 * ユーザーの読書結果に応じて「次の一冊」を提案する。
 *
 * ロジック:
 *  1. 読了かつ評価済みの本からジャンルごとの平均評価を計算
 *  2. 平均評価が最も高い（同点なら冊数が多い）ジャンルを「好みのジャンル」とする
 *  3. そのジャンルの本で、まだ登録していないものをカタログから提案
 *  4. データが足りない場合は幅広いジャンルから初心者向けに提案
 */
export function recommendNextBooks(
  books: BookLike[],
  limit = 3,
): RecommendResult {
  const ownedTitles = new Set(books.map((b) => b.title.trim()));

  // 1 & 2: 好みのジャンルを求める
  const rated = books.filter(
    (b) => b.status === "finished" && b.rating != null && b.genre,
  );

  const genreStats = new Map<string, { sum: number; count: number }>();
  for (const b of rated) {
    const g = b.genre as string;
    const cur = genreStats.get(g) ?? { sum: 0, count: 0 };
    cur.sum += b.rating as number;
    cur.count += 1;
    genreStats.set(g, cur);
  }

  let favoriteGenre: string | null = null;
  let bestScore = -1;
  let bestCount = -1;
  for (const [genre, { sum, count }] of genreStats) {
    const avg = sum / count;
    if (avg > bestScore || (avg === bestScore && count > bestCount)) {
      bestScore = avg;
      bestCount = count;
      favoriteGenre = genre;
    }
  }

  // 3: 好みのジャンルからおすすめ
  const recommendations: Recommendation[] = [];
  if (favoriteGenre) {
    const inGenre = CATALOG.filter(
      (c) => c.genre === favoriteGenre && !ownedTitles.has(c.title),
    );
    for (const book of inGenre) {
      recommendations.push({
        book,
        basedOn: `あなたが高く評価した「${favoriteGenre}」の作品です`,
      });
      if (recommendations.length >= limit) break;
    }
  }

  // 4: 足りなければ他ジャンルから補完（新規ユーザーのフォールバック含む）
  if (recommendations.length < limit) {
    const seen = new Set(recommendations.map((r) => r.book.title));
    const others = CATALOG.filter(
      (c) => !ownedTitles.has(c.title) && !seen.has(c.title),
    );
    // ジャンルが偏らないよう軽くシャッフル的に散らす
    const byGenre = new Map<string, CatalogBook[]>();
    for (const c of others) {
      const arr = byGenre.get(c.genre) ?? [];
      arr.push(c);
      byGenre.set(c.genre, arr);
    }
    const genreQueues = [...byGenre.values()];
    let idx = 0;
    while (recommendations.length < limit && genreQueues.some((q) => q.length)) {
      const queue = genreQueues[idx % genreQueues.length];
      const book = queue.shift();
      if (book) {
        recommendations.push({
          book,
          basedOn: favoriteGenre
            ? "気分を変えて別ジャンルにも挑戦してみては？"
            : "まずは幅広いジャンルの定番から選びました",
        });
      }
      idx++;
    }
  }

  return { favoriteGenre, recommendations };
}
