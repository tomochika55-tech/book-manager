import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBookStatus } from "@/lib/types";
import { getCurrentUserId } from "@/lib/auth-helpers";

// GET /api/books — ログイン中ユーザーの本の一覧を返す
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const books = await prisma.book.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(books);
}

// POST /api/books — 本を新規登録
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const body = await request.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  if (!title || !author) {
    return NextResponse.json(
      { error: "タイトルと著者は必須です" },
      { status: 400 },
    );
  }

  const status = isBookStatus(body.status) ? body.status : "want";
  const rating = normalizeRating(body.rating);

  const book = await prisma.book.create({
    data: {
      userId,
      title,
      author,
      genre: emptyToNull(body.genre),
      coverUrl: emptyToNull(body.coverUrl),
      pages: normalizeInt(body.pages),
      publisher: emptyToNull(body.publisher),
      publishedYear: normalizeInt(body.publishedYear),
      status,
      rating,
      review: emptyToNull(body.review),
      isPublic: Boolean(body.isPublic),
      startedAt: status !== "want" ? new Date() : null,
      finishedAt: status === "finished" ? new Date() : null,
    },
  });

  return NextResponse.json(book, { status: 201 });
}

function emptyToNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function normalizeInt(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

function normalizeRating(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 5) return null;
  return Math.floor(n);
}
