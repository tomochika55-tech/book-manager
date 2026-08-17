import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { searchGoogleBooks } from "@/lib/google-books";

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
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  // 注意: langRestrict=ja は Google 側の言語メタデータが欠けている本を
  // 取りこぼす原因になるため使わない（日本語の書名でもヒットしないことがあった）。
  const results = await searchGoogleBooks(q);

  // 検索が0件だった場合、キー未設定が原因である可能性をUIから分かるようにする
  // （実際の失敗理由はサーバーログの [google-books] search failed/threw を参照）
  if (results.length === 0 && !process.env.GOOGLE_BOOKS_API_KEY) {
    return NextResponse.json({
      results: [],
      error: "GOOGLE_BOOKS_API_KEY が設定されていないため検索に失敗している可能性があります",
    });
  }

  return NextResponse.json({ results });
}
