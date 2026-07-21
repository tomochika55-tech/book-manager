import { auth } from "@/auth";

/**
 * 現在ログイン中のユーザー ID を返す。未ログインなら null。
 * ミドルウェアで保護済みのページ/APIでは基本的に非 null になる。
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
