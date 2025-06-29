# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## YOU MUST

- 回答は日本語で行ってください
- TODOには必ずブランチ作成・実装内容のテスト・コミット・push・PR作成（まだ作成されていない場合）が含まれるべきです
- **型チェックが省略されるようなコードは書かない**
  - **DON'T** `as any`, `as unknown`, `{foo: any}`など、型チェックが省略されることは行わない。

## 修正機能追加の際の作業開始時・終了時に必ず実施すること。必ず毎回全てTODOに含めてください

- **以下の操作は作業開始時に必ず行ってください**
  - **作業開始時**: 必ず専用ブランチを作成する（feat-<機能名>、fix-<修正内容>等）
  - **mainブランチでの直接作業は絶対禁止**: いかなる変更もmainブランチに直接コミットしない
  - **実際にコードを修正する際は事前に以下の作業を行う**
    - 探索(対象となるコードを注意深く探索する)
    - 計画(コードの修正計画を綿密に立てる)
    - 実施(計画に沿ってコードを変更、追加、削除する)

- **以下を必ず作業終了前に実行してください。**
  1. フォーマット(`npm run format`)
  2. 型チェック(`npm run type-check`)
  3. lint(`npm run lint`)
  4. テスト(`npm test`)
  5. 作業内容をコミット
  6. リモートブランチにpush (`git push -u origin <ブランチ名>`)
  7. PR作成 (gh CLIでPR作成)
     - @ai-rules/pr-guide.mdにガイドラインを記述しています。上記の作業時には必ず確認して必ず内容に従って作業を行ってください。
  8. ジャーナル記録の実施(## Journaling workflowを参照)

## 動作確認・テスト時の必須確認事項（コミット前に必ず実施されるべきです）

- **コードを変更、追加、削除した場合、ユーザーに完了報告を行う直前に、必ず以下を実行してください。**
  - 型チェック(`npm run type-check`)
  - lint(`npm run lint`)
  - テスト(`npm test`)
- 新規コンポーネントや機能、関数を作成した場合は、必ずテストを作成し、正常系、異常系をテストして下さい。
- テスト・動作確認は修正を行った際は必ず行ってください。
- E2Eテストとしてユーザ目線での動作が問題ないかしっかりと確認してください。playwright-mcp を利用して下さい。
- 必ず上記テストが通った場合のみコミットを作成して下さい。

## コマンド一覧

### 開発時の基本コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# ビルド（Prisma生成 + DB Push + Next.js ビルド）
npm run build

# プロダクションサーバー起動
npm start

# リント実行
npm run lint

# フォーマット実行
npm run format

# フォーマットチェック
npm run format:check

# テスト実行
npm test

# Prisma関連
npx prisma generate      # Prismaクライアント生成
npx prisma db push       # スキーマ変更をDBに反映
npx prisma db seed       # シードデータ投入
npx prisma studio        # Prisma Studio起動
```

### 単体テスト実行

```bash
# 全テスト実行
npm test

# 特定ファイルのテスト実行
npx vitest run src/lib/__tests__/rotation.test.ts

# ウォッチモードでテスト実行
npx vitest
```

## アーキテクチャ概要

### テクノロジースタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5
- **UI**: Mantine 8 + Tailwind CSS 4
- **データベース**: Prisma ORM (PostgreSQL本番、SQLite開発)
- **テスト**: Vitest + Testing Library

### ディレクトリ構成

```text
src/
├── app/                 # Next.js App Router（ページとレイアウト）
│   ├── actions/        # Server Actions（サーバーサイド処理）
│   ├── admin/          # 管理画面
│   └── history/        # 履歴ページ
├── components/         # 再利用可能なUIコンポーネント
└── lib/               # ビジネスロジックとユーティリティ
    ├── prisma.ts      # Prismaクライアント設定
    └── rotation.ts    # 当番ローテーションロジック
```

### データモデル

- **Member**: メンバー管理（グループ所属可能）
- **Place**: 掃除場所管理（グループ所属可能）
- **Week**: 週管理（月曜日開始）
- **DutyAssignment**: 当番割当（週×場所×メンバーの組み合わせ）
- **Group**: グループ管理（メンバーと場所をグループ化）

## 開発時の重要事項

### Server ActionsとClient Components

- データベース操作は`src/app/actions/`内のServer Actionsで実行
- UI更新はuseTransitionとuseFormStateを使用
- Prismaクライアントは`src/lib/prisma.ts`を経由してのみ使用

### ローテーションロジック

- `src/lib/rotation.ts`に集約されている
- 週単位での自動ローテーション機能
- グループ別に独立したローテーション管理
- 新しい週は前の週のローテーション順序を基に生成

### テスト方針

- ビジネスロジック（rotation.ts）は必ずテストを作成
- コンポーネントテストはMantineProviderでラップ
- Prismaクライアントはモック化して使用
- `src/**/__tests__/`ディレクトリにテストファイルを配置

### データベース変更時の手順

1. `prisma/schema.prisma`でスキーマ変更
2. `npx prisma db push`でローカルDBに反映
3. 必要に応じて`prisma/seed.ts`を更新
4. テストでモックの型も更新
