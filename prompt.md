# プロジェクト名: img-compress-cli

## 概要:
画像フォルダを対象に、CLIから一括で画像圧縮・リサイズ・形式変換を行うNode.js製のツール。

## 使用技術:
- Node.js
- TypeScript
- sharp（画像処理）
- commander（CLIオプション解析）
- ora（スピナー）
- chalk（ログ出力装飾）
- eslint / prettier（静的解析・整形）
- jest（ユニットテスト）
- Docker（実行・配布用）

## CLIの使い方:

```bash
img-compress ./input \
  --output ./dist \
  --quality 80 \
  --resize 800x600 \
  --format webp
```

### 対応オプション:

| オプション     | 説明                                 |
|----------------|--------------------------------------|
| `--output`     | 出力フォルダ（なければ自動作成）      |
| `--quality`    | 圧縮品質（0〜100）                   |
| `--resize`     | 幅x高さ（例：`800x600`）              |
| `--format`     | 出力形式（`jpeg`, `png`, `webp`）     |

## 機能要件:

- 指定フォルダ内の画像を再帰的に検索し一括処理
- JPEG / PNG / WebP の拡張子に対応
- リサイズ・圧縮・形式変換（WebP変換含む）
- ログ表示（ファイル数・進捗）
- 上書きせず指定の出力先に保存
- 処理対象がない場合は警告を出力
- `npm install -g` で CLI コマンドとして利用可能
- Jest による単体テストを導入
- ESLint / Prettier による静的解析と整形
- Dockerfile付き（ビルド・実行可能）

## ディレクトリ構成（初期案）:

```
img-compress-cli/
├── bin/
│   └── index.ts        # CLIエントリーポイント
├── src/
│   ├── compress.ts     # 画像圧縮ロジック
│   ├── resize.ts       # リサイズ処理
│   ├── convert.ts      # 形式変換処理
│   └── utils.ts        # 共通関数
├── tests/
│   └── compress.test.ts
├── Dockerfile
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## 開発ステップ（順番に実装推奨）:

1. `bin/index.ts` にCLIエントリーポイント作成（commander）
2. `src/compress.ts` にsharpを使った画像圧縮処理を実装
3. `src/resize.ts` にリサイズ処理を実装（オプションでサイズ指定）
4. `src/convert.ts` に画像フォーマット変換処理
5. ログ出力を `chalk` + `ora` で装飾
6. オプションバリデーションやエラーハンドリングを追加
7. Jestで単体テスト
8. `#!/usr/bin/env node` を使ってCLI化
9. Dockerfileを用意してビルド・実行テスト

## 補足:
- 今後、watchモードや差分検知による最適化も拡張可能。
- CI/CDやnpm公開も視野に。

---

## 🔧 開始点:
まずは `bin/index.ts` にコマンドラインオプションを定義し、ログだけ出力する最低限のCLIから始めてください。
