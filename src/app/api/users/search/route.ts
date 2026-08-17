import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

// GET /api/users/search?q=... — 名前またはメールアドレスでユーザーを検索する（自分自身は除外）
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 20,
  });

  const following = await prisma.follow.findMany({
    where: { followerId: userId, followingId: { in: users.map((u) => u.id) } },
    select: { followingId: true },
  });
  const followingSet = new Set(following.map((f) => f.followingId));

  return NextResponse.json({
    users: users.map((u) => ({ ...u, isFollowing: followingSet.has(u.id) })),
  });
}
