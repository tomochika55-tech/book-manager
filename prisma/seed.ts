import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 動作確認用のサンプルデータ。`npm run db:seed` で投入できる。
// デモユーザー（demo@example.com / password）にサンプル本を紐づける。
async function main() {
  const passwordHash = await bcrypt.hash("password", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { email: "demo@example.com", name: "デモユーザー", passwordHash },
  });

  const count = await prisma.book.count({ where: { userId: user.id } });
  if (count > 0) {
    console.log(`デモユーザーには既に ${count} 冊あるためスキップします。`);
    return;
  }

  await prisma.book.createMany({
    data: [
      {
        userId: user.id,
        title: "容疑者Xの献身",
        author: "東野圭吾",
        genre: "ミステリー",
        status: "finished",
        rating: 5,
        review: "トリックと切ない結末が印象的だった。",
        pages: 394,
        isPublic: true,
        startedAt: new Date("2026-05-01"),
        finishedAt: new Date("2026-05-05"),
      },
      {
        userId: user.id,
        title: "十角館の殺人",
        author: "綾辻行人",
        genre: "ミステリー",
        status: "finished",
        rating: 4,
        review: "あの一行に鳥肌が立った。",
        pages: 468,
        startedAt: new Date("2026-06-10"),
        finishedAt: new Date("2026-06-14"),
      },
      {
        userId: user.id,
        title: "サピエンス全史",
        author: "ユヴァル・ノア・ハラリ",
        genre: "ノンフィクション",
        status: "reading",
        pages: 512,
        startedAt: new Date("2026-07-15"),
      },
      {
        userId: user.id,
        title: "プロジェクト・ヘイル・メアリー",
        author: "アンディ・ウィアー",
        genre: "SF",
        status: "want",
      },
      {
        userId: user.id,
        title: "FACTFULNESS",
        author: "ハンス・ロスリング",
        genre: "ノンフィクション",
        status: "finished",
        rating: 5,
        review: "世界の見方が変わった。",
        pages: 400,
        startedAt: new Date("2026-04-02"),
        finishedAt: new Date("2026-04-20"),
      },
    ],
  });

  console.log("サンプルデータを投入しました（ログイン: demo@example.com / password）。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
