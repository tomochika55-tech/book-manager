import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, NotebookPen, Quote } from "lucide-react";
import { prisma } from "@/lib/db";
import StarRating from "@/components/StarRating";
import BookActions from "@/components/BookActions";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { STATUS_LABELS, type BookStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<BookStatus, string> = {
  want: "bg-secondary-container text-on-secondary-container",
  reading: "bg-primary-container text-primary-fixed",
  finished: "bg-tertiary-container text-tertiary-fixed",
};

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || book.userId !== userId) notFound();

  const status = book.status as BookStatus;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-background px-margin-main">
        <Link
          href="/"
          className="-ml-2 rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
          aria-label="本棚へ戻る"
        >
          <ArrowLeft size={22} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display-md text-display-md font-bold text-primary">書籍詳細</h1>
        <Link
          href={`/books/${book.id}/edit`}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
          aria-label="編集"
        >
          <NotebookPen size={20} strokeWidth={1.75} />
        </Link>
      </header>

      <main className="flex flex-col gap-section-gap px-margin-main pb-12 pt-stack-md">
        {/* 表紙・タイトル */}
        <section className="flex flex-col items-center gap-4 text-center">
          <div className="spine-shadow h-56 w-36 overflow-hidden rounded-lg bg-surface-variant">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">📖</div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display-lg text-display-lg text-primary">{book.title}</h2>
            <p className="font-body-lg text-body-lg text-outline">{book.author}</p>
          </div>
          <span
            className={`rounded-full px-4 py-1.5 font-label-sm text-label-sm ${STATUS_BADGE[status] ?? ""}`}
          >
            {STATUS_LABELS[status] ?? book.status}
          </span>
        </section>

        {/* メタ情報 */}
        <section className="grid grid-cols-2 gap-3">
          <div className="ambient-shadow flex flex-col gap-1 rounded-xl border border-[#E5E0D0] bg-surface-container-lowest p-4">
            <span className="font-label-sm text-label-sm text-outline">発行年</span>
            <span className="font-body-lg text-body-lg text-on-surface">
              {book.publishedYear ?? "—"}
            </span>
          </div>
          <div className="ambient-shadow flex flex-col gap-1 rounded-xl border border-[#E5E0D0] bg-surface-container-lowest p-4">
            <span className="font-label-sm text-label-sm text-outline">出版社</span>
            <span className="font-body-lg text-body-lg line-clamp-1 text-on-surface">
              {book.publisher ?? "—"}
            </span>
          </div>
          <div className="ambient-shadow flex flex-col gap-1 rounded-xl border border-[#E5E0D0] bg-surface-container-lowest p-4">
            <span className="font-label-sm text-label-sm text-outline">ページ数</span>
            <span className="font-body-lg text-body-lg text-on-surface">
              {book.pages != null ? `${book.pages}p` : "—"}
            </span>
          </div>
          <div className="ambient-shadow flex flex-col gap-1 rounded-xl border border-[#E5E0D0] bg-surface-container-lowest p-4">
            <span className="font-label-sm text-label-sm text-outline">評価</span>
            {book.rating != null ? (
              <StarRating value={book.rating} size="sm" />
            ) : (
              <span className="font-body-lg text-body-lg text-on-surface">—</span>
            )}
          </div>
        </section>

        {/* 感想・メモ */}
        <section className="flex flex-col gap-stack-md">
          <div className="flex items-center gap-2 text-outline">
            <Quote size={18} strokeWidth={1.75} />
            <h3 className="font-headline-sm text-headline-sm text-primary">感想・メモ</h3>
          </div>
          {book.review ? (
            <p className="font-body-lg text-body-lg whitespace-pre-wrap leading-relaxed text-on-surface">
              {book.review}
            </p>
          ) : (
            <p className="font-body-md text-body-md text-outline">
              まだ感想が書かれていません。
            </p>
          )}
          <Link
            href={`/books/${book.id}/edit`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-on-primary transition-colors hover:bg-primary-container"
          >
            <NotebookPen size={18} strokeWidth={1.75} />
            {book.review ? "感想を編集する" : "感想を書く"}
          </Link>
        </section>

        <BookActions id={book.id} isPublic={book.isPublic} />
      </main>
    </>
  );
}
