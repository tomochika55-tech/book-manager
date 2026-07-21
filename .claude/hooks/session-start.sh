#!/bin/bash
# SessionStart hook — Claude Code on the web でセッション開始時に依存関係を準備する。
# 依存インストール・環境変数・DB を用意し、lint やアプリ起動がすぐ動く状態にする。
set -euo pipefail

# Claude Code on the web（リモート環境）でのみ実行する。
# ローカルでの通常の開発を邪魔しないためのガード。
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] 依存パッケージをインストールしています..."
# npm ci ではなく npm install を使う（コンテナのキャッシュを活かしやすい / 冪等）。
npm install

# .env が無ければ雛形からコピー（SQLite の接続先を設定）。
if [ ! -f .env ]; then
  echo "[session-start] .env を作成しています..."
  cp .env.example .env
fi

# AUTH_SECRET が未設定/プレースホルダのままならランダム生成して差し替える。
if ! grep -q '^AUTH_SECRET=' .env || grep -q 'replace-with-a-random-secret' .env; then
  echo "[session-start] AUTH_SECRET を生成しています..."
  SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
  # 既存の AUTH_SECRET 行を削除してから追記
  grep -v '^AUTH_SECRET=' .env > .env.tmp || true
  mv .env.tmp .env
  echo "AUTH_SECRET=\"$SECRET\"" >> .env
fi

echo "[session-start] Prisma Client を生成しています..."
npx prisma generate

# DB が設定・到達可能ならマイグレーションを適用する。
# （未設定でもセッションが止まらないよう失敗は無視する）
echo "[session-start] データベースのマイグレーションを適用しています..."
npx prisma migrate deploy || echo "[session-start] DB 未接続のためスキップしました。"

echo "[session-start] セットアップ完了。"
