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

```bash
# 1. 環境変数を準備
cp .env.example .env   # 必要に応じて値を編集

# 2. バックエンド
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver   # http://localhost:8000

# 3. フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

開発時は Vite が `http://localhost:5173` を提供し、`/api/*` へのリクエストを Django (8000) にプロキシします。ログイン画面では `.env` の `APP_PASSWORD` を入力してください。

## 本番ビルド & 起動

```bash
cd frontend && npm ci && npm run build
cd ../backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput
gunicorn inventory.wsgi:application --bind 0.0.0.0:8000
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
