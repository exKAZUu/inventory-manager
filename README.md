# 在庫管理 (inventory-manager)

個人用の部品在庫管理 Web アプリ。Next.js + SQLite + Prisma で構築し、Railway にデプロイすることを想定。

## 🚀 公開デモ

https://inventory-manager-production-9b21.up.railway.app

サンプル用途のため、ログイン画面にパスワードが表示されており誰でもログインできます。

## 主な機能
- 部品マスタ（部品名 / 型番 / 単価 / メーカー / 保管場所 / 最低在庫数 / メモ）
- 入出庫履歴（日時 / 種別 / 数量 / 理由メモ）
- 現在在庫の自動計算と最低在庫割れアラート
- 単一パスワードによるログイン
- スマホ／PC レスポンシブ UI（日本語）

## ローカル開発手順

```bash
# 1. 依存をインストール
npm install

# 2. .env を準備（同梱の .env を編集、もしくは .env.example をコピー）
#    APP_PASSWORD: ログインに使うパスワード
#    SESSION_SECRET: Cookie 署名鍵（32文字以上）。
#                    生成例: openssl rand -base64 48
#    DATABASE_URL: ローカルは file:./dev.db、Railway は file:/data/inventory.db

# 3. SQLite を初期化（テーブル作成）
npx prisma migrate dev --name init

# 4. 開発サーバを起動
npm run dev
# → http://localhost:3000
```

`http://localhost:3000/login` で `.env` の `APP_PASSWORD` を入力するとログインできます。

## Railway デプロイ
1. Railway で新規プロジェクト → このリポジトリを GitHub 連携。
2. **Volume** を `/data` にマウント（1GB で十分）。
3. **環境変数** を設定:
   - `DATABASE_URL=file:/data/inventory.db`
   - `APP_PASSWORD=<強いパスワード>`
   - `SESSION_SECRET=<32文字以上のランダム文字列>`
4. デプロイ。`railway.json` で `prisma migrate deploy` → `next build` → `next start` が自動実行されます。

## バックアップ
Railway 上で以下を実行すると `/data/backup-<timestamp>.db` が作られます。
```bash
railway run bash scripts/backup.sh
```
ファイルを手元にダウンロードしたい場合は `railway run cat /data/inventory.db > inventory.db` のようにします。

## コマンド一覧
- `npm run dev` — 開発サーバ
- `npm run build` — 本番ビルド（Prisma generate を含む）
- `npm run start` — 本番起動
- `npm run db:migrate` — マイグレーションを作成・適用（開発）
- `npm run db:deploy` — マイグレーションを適用（本番）
- `npm run lint` / `npm run format` — Biome

## 技術スタック
TypeScript, Next.js 15 (App Router), React 19, Tailwind CSS v4, Prisma + SQLite, iron-session, zod, Biome
