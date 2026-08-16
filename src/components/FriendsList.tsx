"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type UserRow = { id: string; name: string | null; email: string; isFollowing: boolean };

export default function FriendsList() {
  const [tab, setTab] = useState<"following" | "followers">("following");
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<UserRow[] | null>(null);
  const [listUsers, setListUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());

  async function loadTab(t: "following" | "followers") {
    setLoading(true);
    const res = await fetch(`/api/follows?type=${t}`);
    const data = await res.json();
    setListUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => loadTab(tab), 0);
    return () => clearTimeout(t);
  }, [tab]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 1) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setSearchResults(data.users ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function handleQueryChange(value: string) {
    setQ(value);
    if (value.trim().length < 1) setSearchResults(null);
  }

  async function toggleFollow(user: UserRow) {
    setPending((p) => new Set(p).add(user.id));
    try {
      if (user.isFollowing) {
        await fetch(`/api/follows?followingId=${user.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: user.id }),
        });
      }
      const flip = (list: UserRow[]) =>
        list.map((u) => (u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u));
      setSearchResults((r) => (r ? flip(r) : r));
      setListUsers((l) => (tab === "following" && user.isFollowing ? l.filter((u) => u.id !== user.id) : flip(l)));
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(user.id);
        return next;
      });
    }
  }

  const displayUsers = searchResults ?? listUsers;

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="relative w-full">
        <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
        <input
          className="w-full rounded-full border-none bg-surface-variant py-3 pl-10 pr-4 font-body-md text-body-md text-on-surface-variant placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary-container"
          placeholder="フレンドを検索"
          value={q}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>

      {searchResults === null && (
        <div className="relative flex border-b border-outline/20">
          <button
            type="button"
            onClick={() => setTab("following")}
            className={`flex-1 pb-3 text-center font-label-sm text-label-sm transition-colors ${
              tab === "following"
                ? "border-b-2 border-primary font-bold text-primary"
                : "text-outline hover:text-primary"
            }`}
          >
            フォロー中
          </button>
          <button
            type="button"
            onClick={() => setTab("followers")}
            className={`flex-1 pb-3 text-center font-label-sm text-label-sm transition-colors ${
              tab === "followers"
                ? "border-b-2 border-primary font-bold text-primary"
                : "text-outline hover:text-primary"
            }`}
          >
            フォロワー
          </button>
        </div>
      )}

      {loading && searchResults === null ? (
        <p className="font-body-md text-body-md text-outline">読み込み中...</p>
      ) : displayUsers.length === 0 ? (
        <p className="font-body-md text-body-md text-outline">
          {searchResults !== null
            ? "見つかりませんでした。"
            : tab === "following"
              ? "まだ誰もフォローしていません。検索してフレンドを見つけましょう。"
              : "まだフォロワーがいません。"}
        </p>
      ) : (
        <ul className="flex flex-col gap-stack-md">
          {displayUsers.map((u) => (
            <li
              key={u.id}
              className="ambient-shadow flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-outline/20 bg-surface-variant">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    {(u.name || u.email)[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    {u.name || u.email}
                  </span>
                  <span className="font-body-md text-body-md text-sm text-on-surface-variant">
                    {u.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={pending.has(u.id)}
                onClick={() => toggleFollow(u)}
                className={`font-label-sm text-label-sm flex-shrink-0 rounded-full px-4 py-2 transition-colors disabled:opacity-60 ${
                  u.isFollowing
                    ? "bg-surface-variant text-primary hover:bg-surface-dim"
                    : "border border-primary text-primary hover:bg-primary/5"
                }`}
              >
                {u.isFollowing ? "フォロー中" : "フォローする"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
