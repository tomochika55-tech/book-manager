import { PrismaClient } from "@prisma/client";

// Next.js の開発時ホットリロードで PrismaClient が量産されるのを防ぐため、
// グローバルに 1 インスタンスをキャッシュする。
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
