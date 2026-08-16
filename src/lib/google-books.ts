import type { BookSearchResult } from "@/app/api/books/search/route";

// Google Books API で書籍を検索する共通ロジック。
// API ルート（/api/books/search）とサーバーコンポーネント（おすすめの表紙取得など）の両方から使う。
export async function searchGoogleBooks(q: string): Promise<BookSearchResult[]> {
  if (!q.trim()) return [];

  const endpoint = new URL("https://www.googleapis.com/books/v1/volumes");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("maxResults", "8");
  endpoint.searchParams.set("printType", "books");

  try {
    const res = await fetch(endpoint.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: {
      volumeInfo?: {
        title?: string;
        authors?: string[];
        imageLinks?: { thumbnail?: string; smallThumbnail?: string };
        pageCount?: number;
        categories?: string[];
        publisher?: string;
        publishedDate?: string;
      };
    }) => {
      const v = item.volumeInfo ?? {};
      const thumb = v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail ?? null;
      const yearMatch = v.publishedDate?.match(/^\d{4}/);
      return {
        title: v.title ?? "",
        author: (v.authors ?? []).join(", "),
        coverUrl: thumb ? thumb.replace(/^http:/, "https:") : null,
        pages: typeof v.pageCount === "number" && v.pageCount > 0 ? v.pageCount : null,
        genre: v.categories?.[0] ?? null,
        publisher: v.publisher ?? null,
        publishedYear: yearMatch ? Number(yearMatch[0]) : null,
      };
    }).filter((r: BookSearchResult) => r.title);
  } catch {
    return [];
  }
}

// タイトル+著者から表紙URLだけを取得する（おすすめ一覧の表紙表示用）。見つからなければ null。
export async function fetchCoverUrl(title: string, author: string): Promise<string | null> {
  const results = await searchGoogleBooks(`${title} ${author}`.trim());
  return results[0]?.coverUrl ?? null;
}
