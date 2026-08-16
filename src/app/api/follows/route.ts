import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

// GET /api/follows?type=following|followers — フォロー中/フォロワーの一覧を返す
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const type = new URL(request.url).searchParams.get("type") === "followers" ? "followers" : "following";

  if (type === "followers") {
    const rows = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    const followingIds = new Set(
      (await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } })).map(
        (f) => f.followingId,
      ),
    );
    return NextResponse.json({
      users: rows.map((r) => ({ ...r.follower, isFollowing: followingIds.has(r.follower.id) })),
    });
  }

  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    users: rows.map((r) => ({ ...r.following, isFollowing: true })),
  });
}

// POST /api/follows — { followingId } をフォローする
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const body = await request.json();
  const followingId = typeof body.followingId === "string" ? body.followingId : "";
  if (!followingId || followingId === userId) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userId, followingId } },
    create: { followerId: userId, followingId },
    update: {},
  });

  await prisma.notification.create({
    data: { userId: followingId, actorId: userId, type: "follow" },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/follows?followingId=... — フォローを解除する
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const followingId = new URL(request.url).searchParams.get("followingId");
  if (!followingId) return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });

  await prisma.follow.deleteMany({ where: { followerId: userId, followingId } });
  return NextResponse.json({ ok: true });
}
