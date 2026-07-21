import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BookForm from "@/components/BookForm";
import { getCurrentUserId } from "@/lib/auth-helpers";
import type { BookStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || book.userId !== userId) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/books/${book.id}`} className="text-sm text-brand-600 hover:underline">
          ← 詳細へ戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">本を編集</h1>
      </div>
      <BookForm
        initial={{
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre ?? "",
          coverUrl: book.coverUrl ?? "",
          pages: book.pages != null ? String(book.pages) : "",
          status: book.status as BookStatus,
          rating: book.rating,
          review: book.review ?? "",
          isPublic: book.isPublic,
        }}
      />
    </div>
  );
}
