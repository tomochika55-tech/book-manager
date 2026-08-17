import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

// POST /api/books/:id/like — 公開されている本の記録に「いいね」する（トグル）
export async function POST(_req: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || !book.isPublic) return NextResponse.json({ error: "見つかりません" }, { status: 404 });

  const existing = await prisma.like.findUnique({
    where: { userId_bookId: { userId, bookId: id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, bookId: id } });
    if (book.userId !== userId) {
      await prisma.notification.create({
        data: { userId: book.userId, actorId: userId, type: "like", bookId: id },
      });
    }
  }

  const count = await prisma.like.count({ where: { bookId: id } });
  return NextResponse.json({ liked: !existing, count });
}
