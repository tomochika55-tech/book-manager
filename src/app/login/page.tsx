"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("メールアドレスまたはパスワードが違います");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-stack-lg">
      <div className="flex flex-col items-center gap-stack-sm text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-14 w-14 rounded-xl" />
        <h1 className="font-display-lg text-display-lg text-primary">ログイン</h1>
        <p className="font-body-md text-body-md text-outline">Yomu で読書を記録しよう</p>
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
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center rounded-lg bg-primary py-3 font-medium text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="font-body-md text-body-md text-outline">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="text-secondary hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-margin-main py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
