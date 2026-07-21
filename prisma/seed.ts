import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 動作確認用のサンプルデータ。`npm run db:seed` で投入できる。
async function main() {
  const count = await prisma.book.count();
  if (count > 0) {
    console.log(`既に ${count} 冊あるためスキップします。`);
    return;
  }

  await prisma.book.createMany({
    data: [
      {
        title: "容疑者Xの献身",
        author: "東野圭吾",
        genre: "ミステリー",
        status: "finished",
        rating: 5,
        review: "トリックと切ない結末が印象的だった。",
        pages: 394,
        isPublic: true,
        startedAt: new Date("2026-06-01"),
        finishedAt: new Date("2026-06-05"),
      },
      {
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
        title: "サピエンス全史",
        author: "ユヴァル・ノア・ハラリ",
        genre: "ノンフィクション",
        status: "reading",
        pages: 512,
        startedAt: new Date("2026-07-15"),
      },
      {
        title: "プロジェクト・ヘイル・メアリー",
        author: "アンディ・ウィアー",
        genre: "SF",
        status: "want",
      },
    ],
  });

  console.log("サンプルデータを投入しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
