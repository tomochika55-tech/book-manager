import type { NextAuthConfig } from "next-auth";

// エッジ（middleware）でも読み込める軽量な設定。
// bcrypt や Prisma などの Node 専用モジュールはここに入れない。
export const authConfig = {
  // セルフホスト/各種ホスティング（Vercel以外）でホスト検証エラーを避けるため信頼する。
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], // 実際のプロバイダは auth.ts で追加する
  callbacks: {
    // ミドルウェアでのアクセス制御。ログインが必要なページを保護する。
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // 公開ページ（共有・ログイン・登録・認証/登録API）は常に許可
      const isPublic =
        pathname.startsWith("/share/") ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/api/auth") ||
        pathname === "/api/register";

      if (isPublic) return true;
      // それ以外はログイン必須
      return isLoggedIn;
    },
    // JWT にユーザー ID を載せる
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // セッションにユーザー ID を反映する
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
