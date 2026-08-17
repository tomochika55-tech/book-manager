import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StarRating from "@/components/StarRating";
import LikeButton from "@/components/LikeButton";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { STATUS_LABELS, type BookStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || !book.isPublic) return { title: "Yomu" };
  return {
    title: `${book.title} — Yomu で共有`,
    description: book.review ?? `${book.author} の作品`,
  };
}

// 共有ページ: 公開設定された本だけを、読み取り専用で誰でも閲覧できる。
export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewerId = await getCurrentUserId();
  const book = await prisma.book.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  // 存在しない or 非公開なら 404（共有されていない本は見せない）
  if (!book || !book.isPublic) notFound();

  // 同じ書名+著者で他ユーザーが公開している感想も取得（自分は除く、感想ありのみ）
  const otherReviews = await prisma.book.findMany({
    where: {
      id: { not: book.id },
      isPublic: true,
      title: book.title,
      author: book.author,
      review: { not: null },
    },
    include: { user: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  const likeTargetIds = [book.id, ...otherReviews.map((r) => r.id)];
  const [likeCounts, myLikes] = await Promise.all([
    prisma.like.groupBy({ by: ["bookId"], where: { bookId: { in: likeTargetIds } }, _count: true }),
    viewerId
      ? prisma.like.findMany({
          where: { userId: viewerId, bookId: { in: likeTargetIds } },
          select: { bookId: true },
        })
      : Promise.resolve([]),
  ]);
  const countMap = new Map(likeCounts.map((l) => [l.bookId, l._count]));
  const likedSet = new Set(myLikes.map((l) => l.bookId));

  const status = book.status as BookStatus;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <span className="text-sm text-gray-400">📚 Yomu で共有された読書記録</span>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-48 w-32 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-5xl">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden>📖</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="mt-1 text-gray-600">{book.author}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {book.genre && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">{book.genre}</span>
            )}
            <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
              {STATUS_LABELS[status]}
            </span>
          </div>
          {book.rating != null && <StarRating value={book.rating} size="lg" />}
        </div>

        {book.review && (
          <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
            <h2 className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>感想</span>
              <span className="text-xs font-normal text-gray-400">
                by {book.user?.name || "匿名ユーザー"}
              </span>
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {book.review}
            </p>
          </div>
        )}

        <div className="flex justify-center border-t border-gray-100 px-8 py-4">
          {viewerId && viewerId !== book.userId ? (
            <LikeButton
              bookId={book.id}
              initialLiked={likedSet.has(book.id)}
              initialCount={countMap.get(book.id) ?? 0}
            />
          ) : (
            (countMap.get(book.id) ?? 0) > 0 && (
              <span className="text-sm text-gray-500">❤ {countMap.get(book.id)}</span>
            )
          )}
        </div>
      </div>

      {/* 同じ本に対する他ユーザーの感想 */}
      {otherReviews.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">
            みんなの感想
            <span className="ml-2 text-sm font-normal text-gray-400">
              {otherReviews.length} 件
            </span>
          </h2>
          <ul className="space-y-3">
            {otherReviews.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{r.user?.name || "匿名ユーザー"}</span>
                  {r.rating != null && <StarRating value={r.rating} size="sm" />}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {r.review}
                </p>
                <div className="mt-2">
                  {viewerId && viewerId !== r.userId ? (
                    <LikeButton
                      bookId={r.id}
                      initialLiked={likedSet.has(r.id)}
                      initialCount={countMap.get(r.id) ?? 0}
                    />
                  ) : (
                    (countMap.get(r.id) ?? 0) > 0 && (
                      <span className="text-xs text-gray-500">❤ {countMap.get(r.id)}</span>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-gray-400">
        この記録は Yomu で作成されました
      </p>
    </div>
  );
}
