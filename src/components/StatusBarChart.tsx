import type { StatusCount } from "@/lib/stats";

const COLORS: Record<string, string> = {
  want: "#e0803b",
  reading: "#476fb5",
  finished: "#4f9d69",
};

// ステータス別（積読・読書中・読了）の冊数を横棒グラフで表示する。
export default function StatusBarChart({ data }: { data: StatusCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-800">ステータス別（積読・読書中・読了）</h2>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">本を登録すると内訳が表示されます。</p>
      ) : (
        <ul className="space-y-3">
          {data.map((d) => (
            <li key={d.status} className="flex items-center gap-3">
              <span className="w-16 flex-shrink-0 text-sm text-gray-600">{d.label}</span>
              <div className="flex h-6 flex-1 items-center">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${(d.count / max) * 100}%`,
                    minWidth: d.count > 0 ? 8 : 0,
                    backgroundColor: COLORS[d.status] ?? "#999",
                  }}
                />
                <span className="ml-2 text-xs font-medium text-gray-500">{d.count}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
