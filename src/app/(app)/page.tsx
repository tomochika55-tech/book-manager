import Link from "next/link";
import { Play, NotebookPen, Quote } from "lucide-react";
import { prisma } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import AddToShelfButton from "@/components/AddToShelfButton";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { recommendWithAi } from "@/lib/ai";
import { recommendNextBooks } from "@/lib/recommend";
import { fetchCoverUrl } from "@/lib/google-books";

export const dynamic = "force-dynamic";

function formatRelativeDate(d: Date) {
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `今日 ${time}`;
  if (isYesterday) return `昨日 ${time}`;
  return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
}

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const books = userId
    ? await prisma.book.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } })
    : [];

  // 現在読んでいる本（直近更新の1冊）
  const current = books.find((b) => b.status === "reading") ?? null;

  // 最近の記録（感想が書かれている本を新しい順に）
  const recentLogs = books.filter((b) => b.review).slice(0, 6);

  // あなたへの一冊（AIまたはルールベースの提案から先頭の1件）
  const aiRecs = await recommendWithAi(books);
  const heuristic = recommendNextBooks(books, 1);
  const featured = (aiRecs ?? heuristic.recommendations)[0] ?? null;
  const featuredCover = featured
    ? await fetchCoverUrl(featured.book.title, featured.book.author)
    : null;

  return (
    <>
      <AppHeader title="読む" />
      <main className="flex flex-col gap-section-gap px-margin-main pt-stack-md">
        {/* 現在読んでいる本 */}
        <section className="flex flex-col gap-stack-md">
          <h2 className="font-display-md text-display-md text-primary">現在読んでいる本</h2>
          {current ? (
            <article className="ambient-shadow flex flex-col gap-4 rounded-xl border border-[#E5E0D0] bg-surface-container-lowest p-4">
              <div className="flex items-start gap-4">
                <div className="spine-shadow relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-md bg-surface-variant">
                  {current.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">📖</div>
                  )}
                </div>
                <div className="flex h-36 flex-col justify-between py-1">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm line-clamp-2 text-primary">
                      {current.title}
                    </h3>
                    <p className="font-body-md text-body-md mt-1 text-outline">{current.author}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex gap-3">
                <Link
                  href={`/books/${current.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-container"
                >
                  <Play size={18} fill="currentColor" strokeWidth={0} />
                  続きを読む
                </Link>
                <Link
                  href={`/books/${current.id}/edit`}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-outline/20 text-primary transition-colors hover:bg-surface-container-low"
                  aria-label="編集"
                >
                  <NotebookPen size={20} strokeWidth={1.75} />
                </Link>
              </div>
            </article>
          ) : (
            <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center">
              <p className="font-body-md text-body-md text-outline">今、読書中の本はありません。</p>
              <Link href="/books/new" className="font-body-md text-body-md mt-2 inline-block text-secondary">
                本を追加する →
              </Link>
            </div>
          )}
        </section>

        {/* 最近の記録 */}
        <section className="flex flex-col gap-stack-md">
          <div className="flex items-end justify-between">
            <h2 className="font-display-md text-display-md text-primary">最近の記録</h2>
            <Link href="/records" className="font-label-sm text-label-sm text-secondary hover:underline">
              すべて見る
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="font-body-md text-body-md text-outline">
              本の詳細ページで感想を書くと、ここに表示されます。
            </p>
          ) : (
            <div className="hide-scrollbar -mx-margin-main flex gap-4 overflow-x-auto px-margin-main pb-4">
              {recentLogs.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="ambient-shadow flex w-64 flex-shrink-0 flex-col gap-3 rounded-xl border border-[#E5E0D0] bg-surface-container-lowest p-4"
                >
                  <div className="flex items-center gap-2 text-outline">
                    <Quote size={16} strokeWidth={1.75} />
                    <span className="font-label-sm text-label-sm">{formatRelativeDate(book.updatedAt)}</span>
                  </div>
                  <p className="font-body-md text-body-md line-clamp-3 leading-relaxed text-on-surface">
                    {book.review}
                  </p>
                  <div className="mt-auto flex items-center gap-2 border-t border-outline/10 pt-3">
                    <div className="h-8 w-6 flex-shrink-0 overflow-hidden rounded-[2px] bg-surface-variant">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <span className="font-label-sm text-label-sm line-clamp-1 text-primary">
                      {book.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* あなたへの一冊 */}
        {featured && (
          <section className="mb-8 flex flex-col gap-stack-md">
            <h2 className="font-display-md text-display-md text-primary">あなたへの一冊</h2>
            <div className="ambient-shadow relative flex flex-col items-center gap-4 rounded-2xl border border-[#E5E0D0] bg-surface-container-highest p-6 text-center">
              <span className="font-label-sm text-label-sm relative z-10 uppercase tracking-widest text-secondary">
                Featured Today
              </span>
              <div className="spine-shadow relative z-10 my-2 h-48 w-32 overflow-hidden rounded-md bg-surface-variant">
                {featuredCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredCover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">📖</div>
                )}
              </div>
              <div className="relative z-10 flex flex-col gap-1">
                <h3 className="font-display-md text-display-md text-primary">{featured.book.title}</h3>
                <p className="font-body-md text-body-md text-outline">{featured.book.author}</p>
              </div>
              <p className="font-body-md text-body-md relative z-10 max-w-[280px] text-on-surface/80">
                {featured.book.reason}
              </p>
              <div className="relative z-10">
                <AddToShelfButton
                  title={featured.book.title}
                  author={featured.book.author}
                  genre={featured.book.genre}
                  variant="pill"
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
