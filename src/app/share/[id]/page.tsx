import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StarRating from "@/components/StarRating";
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
  const book = await prisma.book.findUnique({ where: { id } });

  // 存在しない or 非公開なら 404（共有されていない本は見せない）
  if (!book || !book.isPublic) notFound();

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
            <h2 className="mb-2 text-sm font-semibold text-gray-700">感想</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {book.review}
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        この記録は Yomu で作成されました
      </p>
    </div>
  );
}
