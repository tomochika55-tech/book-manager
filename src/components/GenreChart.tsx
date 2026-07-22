import type { GenreCount } from "@/lib/stats";

const COLORS = ["#476fb5","#e0803b","#4f9d69","#b5546f","#8a6fb5","#c9a227","#5aa0b5","#9b6a4a"];

export default function GenreChart({ data }: { data: GenreCount[] }) {
  const shown = data.slice(0, 8);
  const total = shown.reduce((s, d) => s + d.count, 0);

  const R = 40;                    // ← 半径
  const C = 2 * Math.PI * R;       // 円周（スライス長の基準）
  let offset = 0;                  // これまでのスライスが占めた分

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-800">ジャンル別</h2>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">本を登録すると内訳が表示されます。</p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
            {shown.map((d, i) => {
              const dash = (d.count / total) * C;     // このジャンルの弧の長さ
              const seg = (
                <circle
                  key={d.genre} cx="80" cy="80" r={R} fill="none"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth="80"                     // ← 太さ（下の注参照）
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}           // 開始位置をずらす
                />
              );
              offset += dash;
              return seg;
            })}
          </svg>
          <ul className="space-y-1 text-sm">
            {shown.map((d, i) => (
              <li key={d.genre} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-700">{d.genre}</span>
                <span className="text-gray-400">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
