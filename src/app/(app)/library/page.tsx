import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import BookCard from "@/components/BookCard";
import ReadingMeterChart from "@/components/ReadingMeterChart";
import GenreChart from "@/components/GenreChart";
import StatusBarChart from "@/components/StatusBarChart";
import { getCurrentUserId } from "@/lib/auth-helpers";
import {
  monthlyFinished,
  yearlyFinished,
  monthlyPagesRead,
  yearlyPagesRead,
  genreDistribution,
  statusBreakdown,
  tsundokuCount,
  totalPagesRead,
} from "@/lib/stats";
import { STATUS_LABELS, STATUS_ORDER, type BookStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
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

  const monthlyRead = monthlyFinished(books, 12);
  const yearlyRead = yearlyFinished(books, 5);
  const monthlyPages = monthlyPagesRead(books, 12);
  const yearlyPages = yearlyPagesRead(books, 5);
  const genres = genreDistribution(books);
  const statuses = statusBreakdown(books);
  const tsundoku = tsundokuCount(books);
  const pages = totalPagesRead(books);

  return (
    <>
      <AppHeader title="ライブラリ" />
      <main className="flex flex-col gap-section-gap px-margin-main pt-stack-md">
        <section className="grid grid-cols-2 gap-gutter-grid sm:grid-cols-5">
          <Stat label="登録した本" value={books.length} />
          <Stat label="読了" value={finished.length} />
          <Stat label="積読" value={tsundoku} suffix={tsundoku > 0 ? "冊" : ""} />
          <Stat label="平均評価" value={avgRating} suffix={avgRating !== "—" ? "★" : ""} />
          <Stat label="読んだページ" value={pages.toLocaleString()} />
        </section>

        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="grid gap-gutter-grid lg:grid-cols-2">
              <ReadingMeterChart title="読書メーター（読了数）" monthly={monthlyRead} yearly={yearlyRead} unit="冊" />
              <GenreChart data={genres} />
              <ReadingMeterChart title="読んだページ数" monthly={monthlyPages} yearly={yearlyPages} unit="ページ" />
              <StatusBarChart data={statuses} />
            </section>

            {STATUS_ORDER.map((status) => {
              const list = grouped[status];
              if (list.length === 0) return null;
              return (
                <section key={status} className="flex flex-col gap-stack-md">
                  <h2 className="font-display-md text-display-md flex items-center gap-2 text-primary">
                    {STATUS_LABELS[status]}
                    <span className="font-body-md text-body-md font-normal text-outline">
                      {list.length}
                    </span>
                  </h2>
                  <div className="grid gap-gutter-grid sm:grid-cols-2">
                    {list.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>

      <Link
        href="/books/new"
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary-container"
        aria-label="本を追加"
      >
        <Plus size={24} strokeWidth={2} />
      </Link>
    </>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <p className="font-body-md text-body-md text-outline">{label}</p>
      <p className="font-display-md text-display-md mt-1 text-primary">
        {value}
        {suffix && <span className="ml-0.5 text-base text-secondary">{suffix}</span>}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-12 text-center">
      <span className="text-5xl" aria-hidden>
        📚
      </span>
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary">まだ本がありません</h2>
        <p className="font-body-md text-body-md mt-1 text-outline">
          最初の一冊を登録して、あなたの読書記録を始めましょう。
        </p>
      </div>
      <Link
        href="/books/new"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-on-primary transition-colors hover:bg-primary-container"
      >
        + 本を追加する
      </Link>
    </div>
  );
}
