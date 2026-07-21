import type { DefaultSession } from "next-auth";

// セッションのユーザーに id を持たせるための型拡張。
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
