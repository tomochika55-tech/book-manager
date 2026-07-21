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
    <div className="mx-auto max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">新規登録</h1>
        <p className="mt-1 text-sm text-gray-500">アカウントを作成して本棚を始めよう</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}
        <div>
          <label className="label" htmlFor="name">
            お名前（任意）
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            パスワード（6文字以上）
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "登録中..." : "登録する"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
