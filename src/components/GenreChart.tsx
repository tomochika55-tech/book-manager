import type { GenreCount } from "@/lib/stats";

// ジャンル別の冊数を円グラフ（ドーナツ）で表示する。
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
  const shown = data.slice(0, 8);
  const total = shown.reduce((s, d) => s + d.count, 0);

  const R = 40; // 半径
  const C = 2 * Math.PI * R; // 円周（スライス長の基準）

  // 各スライスの弧の長さと開始位置(offset)を純粋な reduce で計算する
  // （render中の外部変数の書き換えを避けるため let/mutation は使わない）
  const slices = shown.reduce<
    Array<GenreCount & { dash: number; offset: number }>
  >((acc, d) => {
    const dash = (d.count / total) * C;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    return [...acc, { ...d, dash, offset }];
  }, []);

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-800">ジャンル別</h2>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          本を登録すると、ジャンルの内訳が表示されます。
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 160 160" className="h-40 w-40 flex-shrink-0 -rotate-90">
            {slices.map((d, i) => (
              <circle
                key={d.genre}
                cx="80"
                cy="80"
                r={R}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="30"
                strokeDasharray={`${d.dash} ${C - d.dash}`}
                strokeDashoffset={-d.offset}
              >
                <title>{`${d.genre}: ${d.count}冊`}</title>
              </circle>
            ))}
          </svg>
          <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
            {shown.map((d, i) => (
              <li key={d.genre} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="truncate text-gray-700">{d.genre}</span>
                <span className="ml-auto flex-shrink-0 text-gray-400">
                  {d.count}冊 ({Math.round((d.count / total) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
