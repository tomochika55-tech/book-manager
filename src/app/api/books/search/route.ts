import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-helpers";

export type BookSearchResult = {
  title: string;
  author: string;
  coverUrl: string | null;
  pages: number | null;
  genre: string | null;
  publisher: string | null;
  publishedYear: number | null;
};

// GET /api/books/search?q=... — Google Books API で書籍を検索する。
// APIキー不要。書名から表紙・著者・ページ数などを自動取得するために使う。
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  // 注意: langRestrict=ja は Google 側の言語メタデータが欠けている本を
  // 取りこぼす原因になるため使わない（日本語の書名でもヒットしないことがあった）。
  const endpoint = new URL("https://www.googleapis.com/books/v1/volumes");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("maxResults", "8");
  endpoint.searchParams.set("printType", "books");

  try {
    const res = await fetch(endpoint.toString(), {
      headers: { Accept: "application/json" },
      // 検索結果は短時間キャッシュ
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ results: [], error: "検索サービスに接続できませんでした" });
    }
    const data = await res.json();
    const results: BookSearchResult[] = (data.items ?? []).map((item: {
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
      // publishedDate は "1987" / "1987-09" / "1987-09-04" などの形式なので先頭4桁を年として取り出す
      const yearMatch = v.publishedDate?.match(/^\d{4}/);
      return {
        title: v.title ?? "",
        author: (v.authors ?? []).join(", "),
        // Google の画像は http のことがあるので https に寄せる
        coverUrl: thumb ? thumb.replace(/^http:/, "https:") : null,
        pages: typeof v.pageCount === "number" && v.pageCount > 0 ? v.pageCount : null,
        genre: v.categories?.[0] ?? null,
        publisher: v.publisher ?? null,
        publishedYear: yearMatch ? Number(yearMatch[0]) : null,
      };
    }).filter((r: BookSearchResult) => r.title);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "検索に失敗しました" });
  }
}
