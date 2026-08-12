"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StarRating from "@/components/StarRating";
import BookSearch from "@/components/BookSearch";
import { STATUS_LABELS, type BookStatus } from "@/lib/types";

export type BookFormValues = {
  id?: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  pages: string;
  publisher: string;
  publishedYear: string;
  status: BookStatus;
  rating: number | null;
  review: string;
  isPublic: boolean;
};

const EMPTY: BookFormValues = {
  title: "",
  author: "",
  genre: "",
  coverUrl: "",
  pages: "",
  publisher: "",
  publishedYear: "",
  status: "want",
  rating: null,
  review: "",
  isPublic: false,
};

const GENRE_SUGGESTIONS = [
  "小説",
  "ミステリー",
  "SF",
  "ファンタジー",
  "ビジネス",
  "ノンフィクション",
  "自己啓発",
  "エッセイ",
  "漫画",
];

export default function BookForm({ initial }: { initial?: Partial<BookFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<BookFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(values.id);

  function update<K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.title.trim() || !values.author.trim()) {
      setError("タイトルと著者は必須です");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        author: values.author.trim(),
        genre: values.genre.trim() || null,
        coverUrl: values.coverUrl.trim() || null,
        pages: values.pages ? Number(values.pages) : null,
        publisher: values.publisher.trim() || null,
        publishedYear: values.publishedYear ? Number(values.publishedYear) : null,
        status: values.status,
        rating: values.rating,
        review: values.review.trim() || null,
        isPublic: values.isPublic,
      };
      const res = await fetch(isEdit ? `/api/books/${values.id}` : "/api/books", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const book = await res.json();
      router.push(`/books/${book.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {!isEdit && (
        <BookSearch
          onSelect={(r) =>
            setValues((v) => ({
              ...v,
              title: r.title || v.title,
              author: r.author || v.author,
              genre: r.genre || v.genre,
              coverUrl: r.coverUrl || v.coverUrl,
              pages: r.pages != null ? String(r.pages) : v.pages,
              publisher: r.publisher || v.publisher,
              publishedYear: r.publishedYear != null ? String(r.publishedYear) : v.publishedYear,
            }))
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">
            タイトル<span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            className="input"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="例: ノルウェイの森"
          />
        </div>
        <div>
          <label className="label" htmlFor="author">
            著者<span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            className="input"
            value={values.author}
            onChange={(e) => update("author", e.target.value)}
            placeholder="例: 村上春樹"
          />
        </div>
        <div>
          <label className="label" htmlFor="genre">
            ジャンル
          </label>
          <input
            id="genre"
            className="input"
            list="genre-list"
            value={values.genre}
            onChange={(e) => update("genre", e.target.value)}
            placeholder="例: 小説"
          />
          <datalist id="genre-list">
            {GENRE_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="pages">
            ページ数
          </label>
          <input
            id="pages"
            type="number"
            min={0}
            className="input"
            value={values.pages}
            onChange={(e) => update("pages", e.target.value)}
            placeholder="例: 320"
          />
        </div>
        <div>
          <label className="label" htmlFor="coverUrl">
            表紙画像URL
          </label>
          <input
            id="coverUrl"
            className="input"
            value={values.coverUrl}
            onChange={(e) => update("coverUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="label" htmlFor="publisher">
            出版社
          </label>
          <input
            id="publisher"
            className="input"
            value={values.publisher}
            onChange={(e) => update("publisher", e.target.value)}
            placeholder="例: 講談社"
          />
        </div>
        <div>
          <label className="label" htmlFor="publishedYear">
            発行年
          </label>
          <input
            id="publishedYear"
            type="number"
            min={0}
            className="input"
            value={values.publishedYear}
            onChange={(e) => update("publishedYear", e.target.value)}
            placeholder="例: 1987"
          />
        </div>
      </div>

      <div>
        <span className="label">ステータス</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as BookStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update("status", s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                values.status === s
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label">あなたの評価</span>
        <div className="flex items-center gap-3">
          <StarRating value={values.rating} onChange={(r) => update("rating", r)} size="lg" />
          {values.rating != null && (
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => update("rating", null)}
            >
              クリア
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="review">
          感想・メモ
        </label>
        <textarea
          id="review"
          className="input min-h-[120px]"
          value={values.review}
          onChange={(e) => update("review", e.target.value)}
          placeholder="心に残った場面、学んだことなど"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={values.isPublic}
          onChange={(e) => update("isPublic", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        この記録を公開して共有できるようにする
      </label>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "保存中..." : isEdit ? "更新する" : "追加する"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
