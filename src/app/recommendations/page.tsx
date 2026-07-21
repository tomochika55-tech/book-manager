import Link from "next/link";
import { prisma } from "@/lib/db";
import { recommendNextBooks } from "@/lib/recommend";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const books = await prisma.book.findMany();
  const { favoriteGenre, recommendations } = recommendNextBooks(books, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">あなたへのおすすめ</h1>
        <p className="mt-2 text-sm text-gray-500">
          {favoriteGenre ? (
            <>
              あなたの評価から、好みのジャンルは
              <span className="font-semibold text-brand-700">「{favoriteGenre}」</span>
              と推定しました。次の一冊はいかがですか？
            </>
          ) : (
            <>
              読了した本に星評価をつけると、あなたの好みに合わせたおすすめが表示されます。
              まずは定番の作品から。
            </>
          )}
        </p>
      </div>

      <div className="grid gap-4">
        {recommendations.map(({ book, basedOn }) => (
          <div key={book.title} className="card flex items-start gap-4 p-5">
            <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-200 text-xl">
              <span aria-hidden>📖</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900">{book.title}</h3>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {book.genre}
                </span>
              </div>
              <p className="text-sm text-gray-500">{book.author}</p>
              <p className="mt-2 text-sm text-gray-700">{book.reason}</p>
              <p className="mt-1 text-xs text-brand-600">💡 {basedOn}</p>
            </div>
            <Link
              href={{
                pathname: "/books/new",
              }}
              className="btn-ghost flex-shrink-0 text-xs"
            >
              本棚に追加
            </Link>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-brand-50 p-5 text-sm text-brand-800">
        <p className="font-medium">💡 おすすめの精度を上げるには</p>
        <p className="mt-1 text-brand-700">
          読んだ本のステータスを「読了」にして、星評価とジャンルを登録しましょう。
          あなたの好みを学習して、より合った一冊を提案します。
        </p>
      </div>
    </div>
  );
}
