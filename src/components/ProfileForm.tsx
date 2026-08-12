"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("表示名を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      {error && (
        <div className="rounded-lg bg-error-container px-4 py-2 font-body-md text-body-md text-on-error-container">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg bg-primary-container/30 px-4 py-2 font-body-md text-body-md text-primary">
          保存しました
        </div>
      )}

      <div>
        <label className="font-label-sm text-label-sm text-outline" htmlFor="name">
          表示名
        </label>
        <input
          id="name"
          className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      <div>
        <span className="font-label-sm text-label-sm text-outline">メールアドレス</span>
        <p className="mt-1 font-body-lg text-body-lg text-outline">{email}</p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 flex items-center justify-center rounded-lg bg-primary py-3 font-medium text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
      >
        {saving ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
