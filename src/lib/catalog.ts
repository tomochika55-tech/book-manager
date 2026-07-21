// おすすめ機能で使う内蔵カタログ。
// 外部 API に依存せずに動くよう、ジャンルごとに定番の候補を持っておく。
// 将来的にはここを外部書籍 API（Google Books 等）や Claude API に差し替え可能。

export type CatalogBook = {
  title: string;
  author: string;
  genre: string;
  reason: string;
};

export const CATALOG: CatalogBook[] = [
  // 小説
  { title: "ノルウェイの森", author: "村上春樹", genre: "小説", reason: "喪失と成長を描いた現代文学の定番。" },
  { title: "コンビニ人間", author: "村田沙耶香", genre: "小説", reason: "普通とは何かを問う芥川賞受賞作。" },
  { title: "夜は短し歩けよ乙女", author: "森見登美彦", genre: "小説", reason: "軽快な語り口で読みやすい人気作。" },
  // ミステリー
  { title: "容疑者Xの献身", author: "東野圭吾", genre: "ミステリー", reason: "論理と感情が交錯する傑作ミステリー。" },
  { title: "十角館の殺人", author: "綾辻行人", genre: "ミステリー", reason: "本格ミステリーの金字塔。" },
  { title: "medium 霊媒探偵城塚翡翠", author: "相沢沙呼", genre: "ミステリー", reason: "叙述トリックが光る話題作。" },
  // SF
  { title: "プロジェクト・ヘイル・メアリー", author: "アンディ・ウィアー", genre: "SF", reason: "科学と友情の宇宙冒険。読後感が良い。" },
  { title: "三体", author: "劉慈欣", genre: "SF", reason: "壮大なスケールの中国発SF大作。" },
  { title: "夏への扉", author: "ロバート・A・ハインライン", genre: "SF", reason: "時間ものSFの名作。" },
  // ビジネス・自己啓発
  { title: "エッセンシャル思考", author: "グレッグ・マキューン", genre: "ビジネス", reason: "本当に大事なことに集中する技術。" },
  { title: "イシューからはじめよ", author: "安宅和人", genre: "ビジネス", reason: "問題解決の質を上げる定番。" },
  { title: "７つの習慣", author: "スティーブン・R・コヴィー", genre: "ビジネス", reason: "自己成長の古典的名著。" },
  // ノンフィクション・教養
  { title: "サピエンス全史", author: "ユヴァル・ノア・ハラリ", genre: "ノンフィクション", reason: "人類史を俯瞰する知的興奮の一冊。" },
  { title: "FACTFULNESS", author: "ハンス・ロスリング", genre: "ノンフィクション", reason: "世界を正しく見るためのデータの見方。" },
  { title: "銃・病原菌・鉄", author: "ジャレド・ダイアモンド", genre: "ノンフィクション", reason: "文明の格差を解き明かす名著。" },
  // ファンタジー
  { title: "ハリー・ポッターと賢者の石", author: "J.K.ローリング", genre: "ファンタジー", reason: "世界中で愛される王道ファンタジー。" },
  { title: "獣の奏者", author: "上橋菜穂子", genre: "ファンタジー", reason: "重厚な世界観の国産ファンタジー。" },
  { title: "指輪物語", author: "J.R.R.トールキン", genre: "ファンタジー", reason: "ファンタジーの原点にして頂点。" },
];
