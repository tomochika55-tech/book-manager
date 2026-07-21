import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBookStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

// GET /api/books/:id
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  return NextResponse.json(book);
}

// PATCH /api/books/:id — 部分更新
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.author === "string" && body.author.trim()) data.author = body.author.trim();
  if ("genre" in body) data.genre = emptyToNull(body.genre);
  if ("coverUrl" in body) data.coverUrl = emptyToNull(body.coverUrl);
  if ("pages" in body) data.pages = normalizeInt(body.pages);
  if ("review" in body) data.review = emptyToNull(body.review);
  if ("isPublic" in body) data.isPublic = Boolean(body.isPublic);
  if ("rating" in body) data.rating = normalizeRating(body.rating);

  if ("status" in body && isBookStatus(body.status)) {
    data.status = body.status;
    // ステータス遷移に合わせて日付を自動補完
    if (body.status !== "want" && !existing.startedAt) data.startedAt = new Date();
    if (body.status === "finished" && !existing.finishedAt) data.finishedAt = new Date();
    if (body.status !== "finished") data.finishedAt = null;
  }

  const book = await prisma.book.update({ where: { id }, data });
  return NextResponse.json(book);
}

// DELETE /api/books/:id
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  await prisma.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
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
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 5) return null;
  return Math.floor(n);
}
