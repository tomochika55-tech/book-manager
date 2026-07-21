import Link from "next/link";
import { prisma } from "@/lib/db";
import BookCard from "@/components/BookCard";
import MonthlyChart from "@/components/MonthlyChart";
import GenreChart from "@/components/GenreChart";
import { getCurrentUserId } from "@/lib/auth-helpers";
import {
  monthlyFinished,
  genreDistribution,
  tsundokuCount,
  totalPagesRead,
} from "@/lib/stats";
import { STATUS_LABELS, STATUS_ORDER, type BookStatus } from "@/lib/types";

// 常に最新のデータを表示する（キャッシュしない）
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const books = userId
    ? await prisma.book.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } })
    : [];

  const finished = books.filter((b) => b.status === "finished");
  const ratings = finished.filter((b) => b.rating != null).map((b) => b.rating as number);
  const avgRating =
    ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  const grouped: Record<BookStatus, typeof books> = {
    reading: books.filter((b) => b.status === "reading"),
    want: books.filter((b) => b.status === "want"),
    finished,
  };

  const monthly = monthlyFinished(books, 12);
  const genres = genreDistribution(books);
  const tsundoku = tsundokuCount(books);
  const pages = totalPagesRead(books);

  return (
    <div className="space-y-10">
      {/* ダッシュボード（サマリー） */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Stat label="登録した本" value={books.length} />
        <Stat label="読了" value={finished.length} />
        <Stat label="積読" value={tsundoku} suffix={tsundoku > 0 ? "冊" : ""} />
        <Stat label="平均評価" value={avgRating} suffix={avgRating !== "—" ? "★" : ""} />
        <Stat label="読んだページ" value={pages.toLocaleString()} />
      </section>

      {books.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {/* グラフ */}
          <section className="grid gap-4 lg:grid-cols-2">
            <MonthlyChart data={monthly} />
            <GenreChart data={genres} />
          </section>

          {STATUS_ORDER.map((status) => {
            const list = grouped[status];
            if (list.length === 0) return null;
            return (
              <section key={status}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                  {STATUS_LABELS[status]}
                  <span className="text-sm font-normal text-gray-400">{list.length}</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {list.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
        {suffix && <span className="ml-0.5 text-base text-amber-400">{suffix}</span>}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-4 p-12 text-center">
      <span className="text-5xl" aria-hidden>
        📚
      </span>
      <div>
        <h2 className="text-lg font-bold text-gray-800">まだ本がありません</h2>
        <p className="mt-1 text-sm text-gray-500">
          最初の一冊を登録して、あなたの読書記録を始めましょう。
        </p>
      </div>
      <Link href="/books/new" className="btn-primary">
        + 本を追加する
      </Link>
    </div>
  );
}
