import { prisma } from "@/lib/db";
import { recommendNextBooks } from "@/lib/recommend";
import { recommendWithAi, activeAiProvider } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { fetchCoverUrl } from "@/lib/google-books";
import AddToShelfButton from "@/components/AddToShelfButton";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const userId = await getCurrentUserId();
  const books = userId ? await prisma.book.findMany({ where: { userId } }) : [];

  // AI キーが設定されていれば AI 提案、なければ従来ロジックへフォールバック
  const aiRecs = await recommendWithAi(books);
  const usedAi = aiRecs !== null;
  const provider = activeAiProvider();

  const heuristic = recommendNextBooks(books, 3);
  const recommendations = aiRecs ?? heuristic.recommendations;
  const favoriteGenre = heuristic.favoriteGenre;

  const covers = await Promise.all(
    recommendations.map((r) => fetchCoverUrl(r.book.title, r.book.author)),
  );

  return (
    <>
      <AppHeader title="あなたへのおすすめ" />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-md">
        <div>
          {usedAi && (
            <span className="font-label-sm text-label-sm text-secondary">✨ AI による提案</span>
          )}
          <p className="font-body-md text-body-md mt-1 text-outline">
            {usedAi ? (
              <>あなたの読書履歴と評価をもとに、次の一冊を選びました。</>
            ) : favoriteGenre ? (
              <>
                あなたの評価から、好みのジャンルは
                <span className="font-semibold text-primary">「{favoriteGenre}」</span>
                と推定しました。
              </>
            ) : (
              <>
                読了した本に星評価をつけると、あなたの好みに合わせたおすすめが表示されます。
                まずは定番の作品から。
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-gutter-grid">
          {recommendations.map(({ book, basedOn }, i) => (
            <div
              key={book.title}
              className="ambient-shadow flex items-start gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <div className="spine-shadow flex h-20 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-variant text-xl">
                {covers[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={covers[i]!} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden>📖</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-headline-sm text-headline-sm text-primary">{book.title}</h3>
                  {book.genre && (
                    <span className="font-label-sm text-label-sm rounded bg-surface-variant px-2 py-0.5 text-on-surface-variant">
                      {book.genre}
                    </span>
                  )}
                </div>
                <p className="font-body-md text-body-md text-outline">{book.author}</p>
                <p className="font-body-md text-body-md mt-2 text-on-surface">{book.reason}</p>
                <p className="font-label-sm text-label-sm mt-1 text-secondary">💡 {basedOn}</p>
                <div className="mt-3">
                  <AddToShelfButton title={book.title} author={book.author} genre={book.genre} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {!provider && (
          <div className="rounded-xl bg-surface-container-high p-5">
            <p className="font-body-lg text-body-lg font-medium text-primary">
              💡 おすすめの精度を上げるには
            </p>
            <p className="font-body-md text-body-md mt-1 text-on-surface-variant">
              読んだ本のステータスを「読了」にして、星評価とジャンルを登録しましょう。
              登録された本の傾向から、好みに合った次の一冊を提案します。
            </p>
          </div>
        )}
      </main>
    </>
  );
}
