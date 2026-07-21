import Link from "next/link";
import { prisma } from "@/lib/db";
import { recommendNextBooks } from "@/lib/recommend";
import { recommendWithAi, activeAiProvider } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const userId = await getCurrentUserId();
  const books = userId ? await prisma.book.findMany({ where: { userId } }) : [];

  // まず AI 提案を試み、キーが無い/失敗した場合は従来ロジックへフォールバック
  const aiRecs = await recommendWithAi(books);
  const usedAi = aiRecs !== null;
  const provider = activeAiProvider();

  const heuristic = recommendNextBooks(books, 3);
  const recommendations = aiRecs ?? heuristic.recommendations;
  const favoriteGenre = heuristic.favoriteGenre;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">あなたへのおすすめ</h1>
          {usedAi ? (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
              ✨ AI（{provider === "claude" ? "Claude" : "Gemini"}）
            </span>
          ) : (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
              ルールベース
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {usedAi ? (
            <>AIがあなたの読書履歴と評価を分析して、次の一冊を提案しました。</>
          ) : favoriteGenre ? (
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
                {book.genre && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {book.genre}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{book.author}</p>
              <p className="mt-2 text-sm text-gray-700">{book.reason}</p>
              <p className="mt-1 text-xs text-brand-600">💡 {basedOn}</p>
            </div>
            <Link href="/books/new" className="btn-ghost flex-shrink-0 text-xs">
              本棚に追加
            </Link>
          </div>
        ))}
      </div>

      {!usedAi && (
        <div className="rounded-xl bg-brand-50 p-5 text-sm text-brand-800">
          <p className="font-medium">💡 おすすめの精度を上げるには</p>
          <p className="mt-1 text-brand-700">
            読んだ本のステータスを「読了」にして、星評価とジャンルを登録しましょう。
            さらに、環境変数に <code className="rounded bg-white px-1">GEMINI_API_KEY</code> または{" "}
            <code className="rounded bg-white px-1">ANTHROPIC_API_KEY</code>{" "}
            を設定すると、AIによる高度な提案に切り替わります。
          </p>
        </div>
      )}
    </div>
  );
}
