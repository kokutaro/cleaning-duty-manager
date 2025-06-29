# Mantineマイグレーション計画

## 概要

現在のアプリケーションは部分的にMantineを導入していますが、まだ多くの箇所で従来のHTML要素やTailwindCSSのスタイリングが使用されています。このドキュメントは、Mantineへの完全移行計画を示します。

## 現在の状況

### ✅ 移行完了済み

- [x] `src/components/Button.tsx` - MantineのButtonコンポーネントを使用
- [x] `src/components/SidebarLayout.tsx` - MantineのAppShell、Burger、Group、Stackを使用
- [x] `src/components/ThemeToggle.tsx` - MantineのSegmentedControl、useMantineColorSchemeを使用
- [x] `src/components/SubmitButton.tsx` - MantineのButtonを使用（Buttonコンポーネント経由）
- [x] `src/app/admin/components/ConfirmDeleteButton.tsx` - MantineのButtonを使用（Buttonコンポーネント経由）
- [x] `src/app/HomeContent.tsx` - MantineのPaperコンポーネントを使用（割当カード）
- [x] `src/app/layout.tsx` - MantineProvider、ColorSchemeScriptを使用

## 移行対象コンポーネント

### 🔄 高優先度（基本コンポーネント）

#### 1. Spinnerコンポーネント

- **ファイル**: `src/components/Spinner.tsx`
- **現状**: カスタムSVGスピナー
- **移行先**: `@mantine/core` の `Loader`
- **理由**: Mantineの統一されたローディングインジケーターを使用

#### 2. フォーム入力要素

- **ファイル**: `src/app/admin/page.tsx`
- **現状**: プレーンHTML `<input>`, `<select>`
- **移行先**: `@mantine/core` の `TextInput`, `Select`
- **理由**: 統一されたフォームデザインとバリデーション機能

### 🔄 中優先度（レイアウトコンポーネント）

#### 3. テーブルコンポーネント

- **ファイル**: `src/app/history/HistoryContent.tsx`
- **現状**: プレーンHTML `<table>`
- **移行先**: `@mantine/core` の `Table`
- **理由**: 統一されたテーブルスタイリングとレスポンシブ対応

#### 4. カードレイアウト

- **ファイル**: `src/app/history/HistoryContent.tsx`
- **現状**: Tailwindクラス（border, rounded-md, p-4）
- **移行先**: `@mantine/core` の `Card`
- **理由**: 統一されたカードデザイン

### 🔄 低優先度（スタイリング改善）

#### 5. セクション分割

- **ファイル**: `src/app/admin/page.tsx`
- **現状**: divタグ + Tailwindクラス
- **移行先**: `@mantine/core` の `Stack`, `Group`
- **理由**: より意味的なレイアウトコンポーネント

#### 6. リストコンポーネント

- **ファイル**: `src/app/admin/page.tsx`
- **現状**: `<ul>` + Tailwindクラス
- **移行先**: `@mantine/core` の `List`
- **理由**: 統一されたリストスタイリング

## 移行手順

### Phase 1: 基本コンポーネント移行

- [ ] Spinnerコンポーネントの移行
- [ ] フォーム入力要素の移行（TextInput, Select）
- [ ] テスト実行とデザイン確認

### Phase 2: レイアウトコンポーネント移行

- [ ] テーブルコンポーネントの移行
- [ ] カードレイアウトの移行
- [ ] テスト実行とデザイン確認

### Phase 3: スタイリング統一

- [ ] セクション分割の移行
- [ ] リストコンポーネントの移行
- [ ] 最終テスト実行

## 移行時の注意事項

### 1. TypeScript型定義

- Mantineコンポーネントの型定義を適切に使用
- `as any`や型チェック回避は禁止

### 2. テーマ設定

- MantineのデフォルトテーマとTailwindCSSとの共存
- 必要に応じてMantineテーマのカスタマイズ

### 3. アクセシビリティ

- Mantineコンポーネントの標準的なaria属性を活用
- キーボードナビゲーション対応の確認

### 4. レスポンシブ対応

- Mantineの`responsive`プロパティを活用
- 既存のTailwindCSSのブレークポイントとの整合性

## 完了基準

### 機能面

- [ ] 全ての機能が正常に動作する
- [ ] フォーム送信、削除確認などの既存機能が維持される
- [ ] レスポンシブデザインが適切に動作する

### デザイン面

- [ ] 全体的なデザインの統一性
- [ ] ダークモード/ライトモードの適切な切り替え
- [ ] ホバー状態、フォーカス状態の適切な表示

### コード品質

- [ ] TypeScript型チェックが通過
- [ ] ESLintエラーが解消
- [ ] 全テストが通過

## 実装ガイドライン

### 1. 段階的移行

- 一度に全て変更せず、コンポーネント単位で移行
- 各段階でテストを実行して問題を早期発見

### 2. 後方互換性

- 既存のコンポーネントAPIは可能な限り維持
- 破壊的変更がある場合は段階的に移行

### 3. パフォーマンス

- バンドルサイズへの影響を確認
- 必要に応じて遅延読み込みを検討

## 参考資料

- [Mantine公式ドキュメント](https://mantine.dev/)
- [Mantine Form](https://mantine.dev/form/use-form/)
- [Mantine Theming](https://mantine.dev/theming/theme-object/)
