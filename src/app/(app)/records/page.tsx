import { Quote } from "lucide-react";
import { prisma } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 感想を書いたすべての本を、更新日時の新しい順に並べる「記録」一覧。
export default async function RecordsPage() {
  const userId = await getCurrentUserId();
  const logs = userId
    ? await prisma.book.findMany({
        where: { userId, review: { not: null } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <>
      <AppHeader title="記録" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-md">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-12 text-center">
            <span className="text-4xl" aria-hidden>
              ✍️
            </span>
            <p className="font-body-md text-body-md text-outline">
              本の詳細ページで感想を書くと、ここに記録として並びます。
            </p>
          </div>
        ) : (
          logs.map((book) => (
            <article
              key={book.id}
              className="ambient-shadow flex gap-stack-md rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-[2px] bg-surface-variant">
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm">📖</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-outline">
                  <Quote size={16} strokeWidth={1.75} />
                  <span className="font-label-sm text-label-sm">{formatDateTime(book.updatedAt)}</span>
                </div>
                <p className="font-body-md text-body-md mt-1 text-on-surface">{book.review}</p>
                <p className="font-label-sm text-label-sm mt-2 text-primary">{book.title}</p>
              </div>
            </article>
          ))
        )}
      </main>
    </>
  );
}
