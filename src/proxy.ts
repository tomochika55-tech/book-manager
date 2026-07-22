import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Proxy（旧 middleware）はエッジで動くため、Node 専用モジュールを含まない
// authConfig だけを使ってアクセス制御を行う。
export default NextAuth(authConfig).auth;

export const config = {
  // 静的ファイルと画像最適化を除く全ルートに適用
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
