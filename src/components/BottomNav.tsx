"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, NotebookPen, Library, Settings } from "lucide-react";

const TABS = [
  { href: "/", label: "ホーム", Icon: Home },
  { href: "/records", label: "記録", Icon: NotebookPen },
  { href: "/library", label: "ライブラリ", Icon: Library },
  { href: "/settings", label: "設定", Icon: Settings },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-[72px] w-full items-center justify-around border-t border-outline/10 bg-surface-container-low px-4 py-2">
      {TABS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center transition-colors ${
              active ? "text-primary" : "text-outline hover:text-secondary"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
            <span className={`font-label-sm text-label-sm mt-1 ${active ? "font-bold" : ""}`}>
              {label}
            </span>
            {active && <span className="mt-1 h-1 w-1 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}
