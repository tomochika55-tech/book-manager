import type { GenreCount } from "@/lib/stats";

// ジャンル別の冊数を横棒で表示する。色は視認しやすいブランド系＋アクセント。
const COLORS = [
  "#476fb5",
  "#e0803b",
  "#4f9d69",
  "#b5546f",
  "#8a6fb5",
  "#c9a227",
  "#5aa0b5",
  "#9b6a4a",
];

export default function GenreChart({ data }: { data: GenreCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const shown = data.slice(0, 8);

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-800">ジャンル別</h2>
      {shown.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          本を登録すると、ジャンルの内訳が表示されます。
        </p>
      ) : (
        <ul className="space-y-2">
          {shown.map((d, i) => (
            <li key={d.genre} className="flex items-center gap-3">
              <span className="w-20 flex-shrink-0 truncate text-sm text-gray-600" title={d.genre}>
                {d.genre}
              </span>
              <div className="flex h-5 flex-1 items-center">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${(d.count / max) * 100}%`,
                    minWidth: 6,
                    backgroundColor: COLORS[i % COLORS.length],
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
