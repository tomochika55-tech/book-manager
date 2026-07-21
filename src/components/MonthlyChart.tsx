import type { MonthlyCount } from "@/lib/stats";

// 月別読了数の棒グラフ（読書メーター）。依存ライブラリ無しの軽量な SVG。
export default function MonthlyChart({ data }: { data: MonthlyCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-gray-800">読書メーター</h2>
        <span className="text-sm text-gray-500">直近12か月で {total} 冊</span>
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          読了した本が増えると、月ごとの読書量がここに表示されます。
        </p>
      ) : (
        <div className="flex items-end justify-between gap-1" style={{ height: 140 }}>
          {data.map((d) => {
            const h = (d.count / max) * 100;
            return (
              <div key={d.ym} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-brand-500 transition-all"
                    style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }}
                    title={`${d.ym}: ${d.count}冊`}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.label}</span>
                <span className="text-[10px] font-medium text-gray-600">
                  {d.count > 0 ? d.count : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
