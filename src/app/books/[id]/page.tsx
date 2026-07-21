import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StarRating from "@/components/StarRating";
import BookActions from "@/components/BookActions";
import { STATUS_LABELS, STATUS_STYLES, type BookStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) notFound();

  const status = book.status as BookStatus;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/" className="text-sm text-brand-600 hover:underline">
        ← 本棚へ戻る
      </Link>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row">
          <div className="flex h-48 w-32 flex-shrink-0 items-center justify-center self-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-5xl sm:self-start">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden>📖</span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
              <span
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? ""}`}
              >
                {STATUS_LABELS[status] ?? book.status}
              </span>
            </div>
            <p className="text-gray-600">{book.author}</p>

            <div className="flex flex-wrap gap-2 text-sm">
              {book.genre && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">{book.genre}</span>
              )}
              {book.pages != null && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                  {book.pages} ページ
                </span>
              )}
              {book.isPublic && (
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">公開中</span>
              )}
            </div>

            {book.rating != null && (
              <div>
                <StarRating value={book.rating} size="md" />
              </div>
            )}

            <div className="text-sm text-gray-500">
              {formatDate(book.startedAt) && <p>読み始め: {formatDate(book.startedAt)}</p>}
              {formatDate(book.finishedAt) && <p>読了: {formatDate(book.finishedAt)}</p>}
            </div>
          </div>
        </div>

        {book.review && (
          <div className="border-t border-gray-100 px-6 py-5">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">感想・メモ</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {book.review}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <Link href={`/books/${book.id}/edit`} className="btn-primary">
            編集
          </Link>
          <BookActions id={book.id} isPublic={book.isPublic} />
        </div>
      </div>
    </div>
  );
}
