"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "登録に失敗しました");
      }
      // 登録後はそのままログイン
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) throw new Error("登録は完了しましたが、ログインに失敗しました");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-margin-main py-12">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-stack-lg">
        <div className="flex flex-col items-center gap-stack-sm text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-14 w-14 rounded-xl" />
          <h1 className="font-display-lg text-display-lg text-primary">新規登録</h1>
          <p className="font-body-md text-body-md text-outline">
            アカウントを作成して本棚を始めよう
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ambient-shadow flex w-full flex-col gap-stack-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
        >
          {error && (
            <div className="rounded-lg bg-error-container px-4 py-2 font-body-md text-body-md text-on-error-container">
              {error}
            </div>
          )}
          <div>
            <label className="font-label-sm text-label-sm text-outline" htmlFor="name">
              お名前（任意）
            </label>
            <input
              id="name"
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-outline" htmlFor="email">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-outline" htmlFor="password">
              パスワード（6文字以上）
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center rounded-lg bg-primary py-3 font-medium text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p className="font-body-md text-body-md text-outline">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-secondary hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
