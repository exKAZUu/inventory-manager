# 在庫管理 (inventory-manager)

個人用の部品在庫管理 Web アプリ。Django + Django REST Framework をバックエンド、React (Vite) をフロントエンドとし、SQLite に保存して Railway へデプロイする想定。

## 🚀 公開デモ

https://inventory-manager-production-9b21.up.railway.app

サンプル用途のため、ログイン画面にパスワードが表示されており誰でもログインできます。

## 主な機能
- 部品マスタ（部品名 / 型番 / 単価 / メーカー / 保管場所 / 最低在庫数 / メモ）
- 入出庫履歴（日時 / 種別 / 数量 / 理由メモ）
- 現在在庫の自動計算と最低在庫割れアラート
- 単一パスワードによるログイン
- スマホ／PC レスポンシブ UI（日本語）

## ディレクトリ構成

```
backend/    Django プロジェクト (REST API)
  inventory/    設定・URL ルーティング
  parts/        ドメインモデル・API
frontend/   Vite + React + TypeScript の SPA
scripts/    Railway 上で使うバックアップスクリプトなど
```

## ローカル開発

依存ツール: Python 3.11+, Node.js 20+

リポジトリは npm workspaces によるモノレポ構成で、ルートからすべての操作を行えます。

```bash
# 1. 環境変数を準備
cp .env.example .env

# 2. 初期セットアップ（一度だけ）
npm install                  # frontend を含む依存をインストール
npm run setup:backend        # backend/.venv 作成 & pip install
npm run migrate              # SQLite 初期化

# 3. 開発サーバを起動（Django + Vite を同時起動）
npm run dev                  # http://localhost:5173 を開く
```

Ctrl-C で両プロセスが停止します。ログには `[django]` / `[vite]` のプレフィクスが付きます。Vite が `/api/*` を Django (8000) にプロキシするため、ブラウザは 5173 にのみアクセスしてください。ログイン画面では `.env` の `APP_PASSWORD` を入力します。

### よく使うコマンド (ルートから)

| コマンド | 説明 |
|---|---|
| `npm run dev` | Django + Vite を同時起動 |
| `npm run dev:backend` | Django だけ起動 |
| `npm run dev:frontend` | Vite だけ起動 |
| `npm run build` | フロントエンドをビルドし、Django の静的ファイルを収集 |
| `npm run migrate` | DB マイグレーションを適用 |
| `npm run start` | 本番モード起動 (migrate → gunicorn) |

## 本番ビルド & 起動

```bash
npm ci
npm run setup:backend        # 初回のみ
npm run build                # vite build + collectstatic
npm run start                # migrate + gunicorn
```

Django が `/api/*` を提供し、それ以外のすべてのパスで React の `frontend/dist/index.html` を返します（クライアントサイドルーティング）。静的アセットは WhiteNoise が配信します。

## Railway デプロイ
1. Railway で新規プロジェクト → このリポジトリを GitHub 連携。
2. **Volume** を `/data` にマウント（1GB で十分）。
3. **環境変数**:
   - `DATABASE_PATH=/data/inventory.sqlite3`
   - `APP_PASSWORD=<強いパスワード>`
   - `SESSION_SECRET=<32文字以上のランダム文字列>`
   - `SESSION_COOKIE_SECURE=1`
   - `CSRF_TRUSTED_ORIGINS=https://<your-app>.up.railway.app`
4. デプロイ。`nixpacks.toml` の指示で `npm run build` → `collectstatic` → `migrate` → `gunicorn` が実行されます。

## バックアップ

```bash
railway run bash scripts/backup.sh
# /data/backup-<timestamp>.sqlite3 が作られます
railway run cat /data/inventory.sqlite3 > inventory.sqlite3   # 手元へダウンロード
```

## API 概要

| Method | Path | 説明 |
|---|---|---|
| GET    | `/api/session` | ログイン状態と CSRF トークンを取得 |
| POST   | `/api/session` | ログイン (`{password}`) |
| DELETE | `/api/session` | ログアウト |
| GET    | `/api/public-password` | デモ表示用パスワード |
| GET    | `/api/parts?q=` | 部品一覧（在庫付き） |
| POST   | `/api/parts` | 部品作成 |
| GET    | `/api/parts/{id}` | 部品詳細 |
| PATCH  | `/api/parts/{id}` | 部品更新 |
| DELETE | `/api/parts/{id}` | 部品削除 |
| GET    | `/api/parts/{id}/movements` | 部品の入出庫履歴 |
| GET    | `/api/movements?from=&to=&type=&part=` | 全履歴 |
| POST   | `/api/movements` | 入出庫記録 |

## 技術スタック
Python 3.11+, Django 5, Django REST Framework, SQLite, gunicorn, WhiteNoise / TypeScript, React 19, Vite, React Router 7, Tailwind CSS 3
