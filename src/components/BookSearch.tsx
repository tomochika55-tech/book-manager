"use client";

import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import type { BookSearchResult } from "@/app/api/books/search/route";

// Google Books で書名を検索し、選ぶとフォームに自動入力するためのウィジェット。
export default function BookSearch({
  onSelect,
}: {
  onSelect: (result: BookSearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [scanning, setScanning] = useState(false);

  // query を省略すると入力欄の値で検索する（バーコードからは isbn: クエリを渡す）
  async function search(query?: string) {
    const term = (query ?? q).trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleBarcode(code: string) {
    setScanning(false);
    // ISBN の数字だけ取り出して isbn: 検索
    const isbn = code.replace(/[^0-9Xx]/g, "");
    setQ(isbn);
    search(`isbn:${isbn}`);
  }

  return (
    <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-4">
      <p className="mb-2 text-sm font-medium text-brand-800">
        🔍 書名またはバーコードで検索して自動入力（Google Books）
      </p>
      <div className="flex gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="例: ノルウェイの森 / ISBN"
        />
        <button
          type="button"
          className="btn bg-white text-brand-700 ring-1 ring-brand-300 hover:bg-brand-50 flex-shrink-0"
          onClick={() => setScanning(true)}
          title="バーコードで検索"
        >
          📷
        </button>
        <button
          type="button"
          className="btn-primary flex-shrink-0"
          onClick={() => search()}
          disabled={loading}
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </div>

      {scanning && (
        <BarcodeScanner onDetected={handleBarcode} onClose={() => setScanning(false)} />
      )}

      {searched && !loading && results.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">結果が見つかりませんでした。手入力してください。</p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setResults([]);
                  setSearched(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 text-left transition hover:border-brand-400 hover:bg-brand-50"
              >
                <div className="flex h-14 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 text-lg">
                  {r.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden>📖</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{r.title}</p>
                  <p className="truncate text-xs text-gray-500">{r.author || "著者不明"}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-brand-600">選ぶ →</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
