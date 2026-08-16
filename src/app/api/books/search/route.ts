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
// APIキー不要。書名から表紙・著者・ページ数などを自動取得するために使う。
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  // 注意: langRestrict=ja は Google 側の言語メタデータが欠けている本を
  // 取りこぼす原因になるため使わない（日本語の書名でもヒットしないことがあった）。
  const results = await searchGoogleBooks(q);
  return NextResponse.json({ results });
}
