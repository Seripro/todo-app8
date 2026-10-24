# Todo App

React、Hono、MySQLで構成されたシンプルなTodoアプリケーションです。
Todoの追加、完了状態の切り替え、削除ができます。

## 技術スタック

- React 19
- Vite
- Hono
- Drizzle ORM
- MySQL 8
- Docker / Docker Compose

## 起動方法

プロジェクトのルートディレクトリで実行します。

```bash
docker compose up
```

起動時にAPIコンテナでDrizzleのマイグレーションが実行され、`todos_table` テーブルが作成されます。

ブラウザで次のURLを開きます。

- フロントエンド: http://localhost:5173
- API: http://localhost:3000
- MySQL: `localhost:3306`

バックグラウンドで起動する場合は、次を実行します。

```bash
docker compose up -d
```

ログを確認する場合は、次を実行します。

```bash
docker compose logs -f
```

## 停止方法

コンテナを停止します。

```bash
docker compose down
```

コンテナとMySQLの永続ボリュームを削除して、データを初期化する場合は次を実行します。

```bash
docker compose down -v
```

## API

ベースURLは `http://localhost:3000` です。

| メソッド | パス             | 説明                 |
| -------- | ---------------- | -------------------- |
| `GET`    | `/api/todos`     | Todo一覧を取得       |
| `POST`   | `/api/todos`     | Todoを追加           |
| `PATCH`  | `/api/todos/:id` | Todoの完了状態を更新 |
| `DELETE` | `/api/todos/:id` | Todoを削除           |

### Todoの追加

`title` は空白のみを含む値にはできません。

```bash
curl -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"READMEを確認する"}'
```

### 完了状態の更新

```bash
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}'
```

### Todoの削除

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

## ディレクトリ構成

```text
.
├── backend/                 # Hono APIサーバーとDrizzle ORM関連ファイル
│   ├── src/
│   │   ├── db/schema.ts     # todos_tableのスキーマ定義
│   │   └── index.ts         # APIエンドポイント
│   └── drizzle.config.ts    # Drizzle Kitの設定
├── frontend/                # React / Viteアプリケーション
│   └── src/App.tsx          # Todo画面とAPI呼び出し
└── docker-compose.yml
```

## ローカル開発

Docker Composeを使わずに個別起動する場合は、MySQLを用意したうえで、バックエンド用に `DATABASE_URL` を設定します。デフォルトのDocker Compose構成と同じ接続情報を使う場合は次の値です。

```bash
DATABASE_URL='mysql://user:password@localhost:3306/mydatabase'
```

バックエンドで依存関係をインストールし、マイグレーションを実行してから起動します。

```bash
cd backend
npm install
DATABASE_URL='mysql://user:password@localhost:3306/mydatabase' npx drizzle-kit generate
DATABASE_URL='mysql://user:password@localhost:3306/mydatabase' npx drizzle-kit migrate
DATABASE_URL='mysql://user:password@localhost:3306/mydatabase' npm run dev
```

別のターミナルでフロントエンドを起動します。

```bash
cd frontend
npm install
npm run dev
```

ローカル起動時のAPI接続先は、フロントエンドの `src/App.tsx` に定義されています。

## Drizzle ORMコマンド

Drizzle Kitの設定ファイルは `backend/drizzle.config.ts`、データモデルは `backend/src/db/schema.ts` です。`backend` ディレクトリで、`DATABASE_URL` を設定して次のコマンドを実行します。

```bash
# スキーマ定義からマイグレーションファイルを生成
npx drizzle-kit generate

# 生成済みマイグレーションをデータベースへ適用
npx drizzle-kit migrate
```

スキーマを変更した場合は、`generate` を実行してマイグレーションを生成したあと、`migrate` を実行してデータベースへ適用してください。
