# 📚 Yomu — 読書管理サービス

本を記録し、自分で評価し、共有し、次の一冊に出会える読書管理アプリです。

## 主な機能

- **ユーザー認証** — メール+パスワードで登録/ログイン。本棚はユーザーごとに分離（[Auth.js](https://authjs.dev/)）
- **本の記録** — タイトル・著者・ジャンル・ページ数・表紙・感想メモを登録
- **書名/バーコードから自動入力** — Google Books API で書名検索（入力中に候補表示）、またはカメラでISBNバーコードを読み取って表紙・著者・ページ数を自動取得
- **自分で評価** — 1〜5 の星評価をつけて、自分の読書を振り返り
- **ステータス管理** — 「読みたい（積読）/ 読書中 / 読了」で本棚を整理
- **共有機能** — 公開設定した本を、読み取り専用の共有ページ（`/share/[id]`）でシェア。同じ本を読んだ他ユーザーの公開感想も一覧表示
- **おすすめ機能** — AI（Claude / Gemini）が読書履歴と評価から次の一冊を提案。APIキーが無い場合は好みジャンル推定によるルールベースへ自動フォールバック。ワンクリックで本棚（読みたい）に追加可能
- **ダッシュボード** — 登録冊数・読了数・積読・平均評価・読んだページ数のサマリーに加え、読了数/ページ数の月別・年別切り替え棒グラフ、ジャンル別円グラフ、ステータス別（積読/読書中/読了）棒グラフ

## 技術構成

- [Next.js 15](https://nextjs.org/)（App Router）+ React 19 + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite（データベース）
- [Auth.js (NextAuth v5)](https://authjs.dev/)（認証）
- [Tailwind CSS](https://tailwindcss.com/)（スタイリング）

## セットアップ

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数を用意（AUTH_SECRET を必ず設定）
cp .env.example .env
# 生成: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. データベースを作成
npm run db:push

# 4.（任意）サンプルデータを投入（demo@example.com / password でログイン可）
npm run db:seed

# 5. 開発サーバーを起動
npm run dev
```

起動後、ブラウザで http://localhost:3000 を開きます。

## 環境変数

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL のプール付き接続 URL（Neon なら `-pooler` 入り） |
| `DIRECT_URL` | ✅ | PostgreSQL の直結 URL（マイグレーション用。Neon なら `-pooler` なし） |
| `AUTH_SECRET` | ✅ | セッション署名用のランダム文字列 |
| `GEMINI_API_KEY` | 任意 | 設定するとおすすめが Gemini による AI 提案になる |
| `ANTHROPIC_API_KEY` | 任意 | 設定するとおすすめが Claude による AI 提案になる（Gemini より優先） |

AI キーが未設定でも、ルールベースのおすすめで動作します。

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
    login/ register/      ログイン・新規登録
    books/new/            本の追加（Google Books 検索付き）
    books/[id]/           本の詳細
    books/[id]/edit/      本の編集
    recommendations/      おすすめ（AI / ルールベース）
    share/[id]/           公開共有ページ
    api/auth/             認証（NextAuth）
    api/register/         ユーザー登録
    api/books/            本の CRUD API
    api/books/search/     Google Books 検索
  auth.ts / auth.config.ts / middleware.ts   認証設定・ルート保護
  components/             UI コンポーネント（グラフ含む）
  lib/                    DB 接続・おすすめ・AI・集計・型
prisma/
  schema.prisma          データモデル（User / Book）
  seed.ts                サンプルデータ
```

## デプロイ（Vercel + Neon）

このアプリは PostgreSQL を使います。無料の [Neon](https://neon.tech/) を使うのが手軽です。

1. **Neon** で無料プロジェクトを作成し、接続文字列を2つ控える
   - プール付き（`-pooler` 入り）→ `DATABASE_URL`
   - 直結（`-pooler` なし）→ `DIRECT_URL`
2. **Vercel** にこのリポジトリをインポート
3. Vercel の **Environment Variables** に `DATABASE_URL` / `DIRECT_URL` / `AUTH_SECRET`（任意で AI キー）を設定
4. **Deploy**。ビルド時に `prisma migrate deploy` が走り、テーブルが自動作成されます

ローカル開発でも同じ Neon を使えます（`.env` に上記を設定）。

## 今後の拡張アイデア

- Google ログイン（OAuth）の追加（`src/auth.ts` に Google プロバイダを追加）
- 本番用データベース（Postgres 等）への移行
- 読書目標（年間◯冊）とその進捗トラッキング
- タグ・シリーズ管理、全文検索
