# 📚 Yomu — 読書管理サービス

本を記録し、自分で評価し、共有し、次の一冊に出会える読書管理アプリです。

## 主な機能

- **本の記録** — タイトル・著者・ジャンル・ページ数・表紙・感想メモを登録
- **自分で評価** — 1〜5 の星評価をつけて、自分の読書を振り返り
- **ステータス管理** — 「読みたい / 読書中 / 読了」で本棚を整理
- **共有機能** — 公開設定した本を、読み取り専用の共有ページ（`/share/[id]`）でシェア
- **おすすめ機能** — 読了本の評価から好みのジャンルを推定し、次の一冊を提案
- **ダッシュボード** — 登録冊数・読了数・平均評価をひと目で確認

## 技術構成

- [Next.js 15](https://nextjs.org/)（App Router）+ React 19 + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite（データベース）
- [Tailwind CSS](https://tailwindcss.com/)（スタイリング）

## セットアップ

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数を用意
cp .env.example .env

# 3. データベースを作成
npm run db:push

# 4.（任意）サンプルデータを投入
npm run db:seed

# 5. 開発サーバーを起動
npm run dev
```

起動後、ブラウザで http://localhost:3000 を開きます。

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド（Prisma Client 生成込み） |
| `npm run start` | 本番サーバーを起動 |
| `npm run lint` | ESLint を実行 |
| `npm run db:push` | スキーマを DB に反映 |
| `npm run db:seed` | サンプルデータを投入 |

## ディレクトリ構成

```
src/
  app/
    page.tsx              本棚（ホーム・ダッシュボード）
    books/new/            本の追加
    books/[id]/           本の詳細
    books/[id]/edit/      本の編集
    recommendations/      おすすめ
    share/[id]/           公開共有ページ
    api/books/            本の CRUD API
  components/             UI コンポーネント
  lib/                    DB 接続・おすすめロジック・型
prisma/
  schema.prisma          データモデル
  seed.ts                サンプルデータ
```

## 今後の拡張アイデア

- ユーザー認証を追加して複数人で利用（現在は単一ユーザー想定）
- Google Books API 連携で書名から表紙・著者を自動取得
- おすすめ機能を Claude API に接続して、より高度な提案に
- 読書メーター（月別の読了数グラフ）
