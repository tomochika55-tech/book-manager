import Link from "next/link";
import StarRating from "@/components/StarRating";
import { STATUS_LABELS, STATUS_STYLES, type BookStatus } from "@/lib/types";

type Props = {
  book: {
    id: string;
    title: string;
    author: string;
    genre: string | null;
    status: string;
    rating: number | null;
    coverUrl: string | null;
  };
};

export default function BookCard({ book }: Props) {
  const status = book.status as BookStatus;
  return (
    <Link href={`/books/${book.id}`} className="card block overflow-hidden transition hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="flex h-24 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-brand-100 to-brand-200 text-2xl">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>📖</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-gray-900">{book.title}</h3>
            <span
              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? ""}`}
            >
              {STATUS_LABELS[status] ?? book.status}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-500">{book.author}</p>
          {book.genre && (
            <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {book.genre}
            </span>
          )}
          {book.rating != null && (
            <div className="mt-2">
              <StarRating value={book.rating} size="sm" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
