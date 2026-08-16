"use client";

import { useState } from "react";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (newPassword !== confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "変更に失敗しました");
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
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
          パスワードを変更しました
        </div>
      )}

      <div>
        <label className="font-label-sm text-label-sm text-outline" htmlFor="currentPassword">
          現在のパスワード
        </label>
        <input
          id="currentPassword"
          type="password"
          className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="font-label-sm text-label-sm text-outline" htmlFor="newPassword">
          新しいパスワード
        </label>
        <input
          id="newPassword"
          type="password"
          className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="font-label-sm text-label-sm text-outline" htmlFor="confirm">
          新しいパスワード（確認）
        </label>
        <input
          id="confirm"
          type="password"
          className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 flex items-center justify-center rounded-lg bg-primary py-3 font-medium text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
      >
        {saving ? "変更中..." : "パスワードを変更する"}
      </button>
    </form>
  );
}
