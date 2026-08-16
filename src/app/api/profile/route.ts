import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

// PATCH /api/profile — 表示名を更新する
export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "表示名を入力してください" }, { status: 400 });

  const user = await prisma.user.update({ where: { id: userId }, data: { name } });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
