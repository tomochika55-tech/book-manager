"use client";

import { useEffect, useRef, useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import type { BookSearchResult } from "@/app/api/books/search/route";

// Google Books で書名を検索し、選ぶとフォームに自動入力するためのウィジェット。
// 入力から 400ms 経過後に自動でオートコンプリート候補を出す。
export default function BookSearch({
  onSelect,
}: {
  onSelect: (result: BookSearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 現在の入力に対する検索を実行する関数の参照。debounce のたび最新に置き換える。
  const abortRef = useRef<AbortController | null>(null);

  async function runSearch(term: string) {
    // 進行中のリクエストがあればキャンセル（打鍵中の連続リクエスト対策）
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(term)}`, {
        signal: ctrl.signal,
      });
      const data = await res.json();
      setResults(data.results ?? []);
      if (data.error) setError(data.error);
    } catch (err) {
      if ((err as { name?: string } | undefined)?.name !== "AbortError") {
        setError("検索に失敗しました");
        setResults([]);
      }
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }

  // 入力を debounce（400ms 静止したら検索。2文字未満は onChange 側で結果をクリアする）
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => runSearch(term), 400);
    return () => clearTimeout(t);
  }, [q]);

  function handleInputChange(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setResults([]);
      setError(null);
    }
  }

  function handleBarcode(code: string) {
    setScanning(false);
    const isbn = code.replace(/[^0-9Xx]/g, "");
    setQ(isbn);
    runSearch(`isbn:${isbn}`);
  }

  return (
    <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-4">
      <p className="mb-2 text-sm font-medium text-brand-800">
        🔍 書名またはバーコードで検索して自動入力
      </p>
      <div className="flex gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="例: ノルウェイの森 / ISBN（入力中に候補が出ます）"
          autoComplete="off"
        />
        <button
          type="button"
          className="btn bg-white text-brand-700 ring-1 ring-brand-300 hover:bg-brand-50 flex-shrink-0"
          onClick={() => setScanning(true)}
          title="バーコードで検索"
        >
          📷
        </button>
      </div>

      {scanning && (
        <BarcodeScanner onDetected={handleBarcode} onClose={() => setScanning(false)} />
      )}

      {loading && (
        <p className="mt-2 text-xs text-gray-500">検索中...</p>
      )}

      {!loading && error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {!loading && !error && q.trim().length >= 2 && results.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">
          結果が見つかりませんでした。下のフォームに手入力してください。
        </p>
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
                  setQ("");
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
