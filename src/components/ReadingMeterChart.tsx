"use client";

import { useState } from "react";
import type { MonthlyCount, YearlyCount } from "@/lib/stats";

type Props = {
  monthly: MonthlyCount[];
  yearly: YearlyCount[];
  title: string;
  unit?: string; // 数値の単位（例: "冊", "ページ"）。省略時は "冊"
};

// 月別/年別を切り替えられる棒グラフ。読了数・ページ数など数値系の推移表示に使う。
export default function ReadingMeterChart({ monthly, yearly, title, unit = "冊" }: Props) {
  const [view, setView] = useState<"month" | "year">("month");
  const data = view === "month" ? monthly : yearly;
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {view === "month" ? "直近12か月" : "直近5年"}で {total.toLocaleString()}
            {unit}
          </span>
          <div className="flex rounded-md bg-gray-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`rounded px-2 py-1 font-medium transition ${
                view === "month" ? "bg-white text-brand-700 shadow-sm" : "text-gray-500"
              }`}
            >
              月別
            </button>
            <button
              type="button"
              onClick={() => setView("year")}
              className={`rounded px-2 py-1 font-medium transition ${
                view === "year" ? "bg-white text-brand-700 shadow-sm" : "text-gray-500"
              }`}
            >
              年別
            </button>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          データが増えると、ここに推移が表示されます。
        </p>
      ) : (
        <div className="flex items-end justify-between gap-1" style={{ height: 140 }}>
          {data.map((d) => {
            const h = (d.count / max) * 100;
            return (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-brand-500 transition-all"
                    style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }}
                    title={`${d.label}: ${d.count.toLocaleString()}${unit}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.label}</span>
                <span className="text-[10px] font-medium text-gray-600">
                  {d.count > 0 ? d.count.toLocaleString() : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
