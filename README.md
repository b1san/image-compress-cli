# img-compress-cli

画像フォルダを対象に、CLIから一括で画像圧縮・リサイズ・形式変換を行うNode.js製のツール。

## 🚀 特徴

- **🎨 スマートPNG圧縮**: 自動的に最適な圧縮レベルを選択（標準→積極的→超強力）
- **🔄 バッチ処理**: フォルダ内の画像を一括処理、プログレスバー表示
- **📦 多形式サポート**: JPEG, PNG, WebP, TIFF, BMP対応
- **🎯 形式変換**: 画像形式の相互変換
- **📏 スマートリサイズ**: アスペクト比を維持したリサイズ
- **⚡ 高性能**: Sharpライブラリによる高速処理
- **⚙️ 設定ファイル対応**: 永続的な設定保存
- **🛡️ エラーハンドリング**: 包括的なエラー処理

## インストール・セットアップ

```bash
git clone <this-repository>
cd img-compress-cli
npm install
npm run build
```

## 基本的な使い方

```bash
# 基本的な圧縮
npm run dev -- ./input-folder

# 出力フォルダを指定
npm run dev -- ./input-folder --output ./compressed

# 品質とフォーマットを指定
npm run dev -- ./photos --format jpeg --quality 75
```

## 🎨 スマートPNG圧縮

**オプション指定不要で自動最適化！**

このツールは自動的に最適なPNG圧縮レベルを選択します：

1. **標準圧縮**: まず通常の圧縮を試行
2. **積極的圧縮**: 改善が少ない場合（80%以上のサイズ）、自動的により強力な圧縮を適用
3. **超強力圧縮**: さらに必要な場合（60%以上のサイズ）、最大圧縮を自動適用

```bash
# シンプルに実行するだけで最適化
npm run dev -- ./images --quality 70

# 出力例:
✅ photo.png
   Size: 2267.5KB → 891.2KB
   Reduction: 61%
   🔧 PNG compression: aggressive
```

## よく使う例

### JPEG変換（最大97%削減）
```bash
npm run dev -- ./photos --format jpeg --quality 75
```

### WebP変換（バランス重視）
```bash
npm run dev -- ./photos --format webp --quality 80
```

### リサイズ＋圧縮
```bash
npm run dev -- ./large-images --resize 1920x1080 --quality 80
```

## オプション一覧

| オプション | 短縮形 | 説明 | デフォルト |
|-----------|-------|------|-----------|
| `--output` | `-o` | 出力フォルダ | `./output` |
| `--quality` | `-q` | 圧縮品質（0-100） | `80` |
| `--resize` | `-r` | リサイズサイズ（例：800x600） | - |
| `--format` | `-f` | 出力形式（jpeg, png, webp） | 元の形式 |
| `--ultra-png` | - | PNG超強力圧縮を強制 | `false` |
| `--skip-small` | - | 小さなファイルをスキップ | `true` |
| `--min-size` | - | 処理する最小ファイルサイズ（bytes） | `1024` |

## 💡 圧縮効果の目安

| ファイル種類 | 推奨手法 | 期待削減率 |
|-------------|---------|-----------|
| PNG写真 | `--format jpeg --quality 75` | **90-98%** |
| PNG写真（透明なし） | `--format webp --quality 80` | **85-95%** |
| PNG維持（自動最適化） | `--quality 50` | **40-70%** |
| JPEG写真 | `--quality 70-80` | **20-40%** |
| 高解像度画像 | `--resize + --format webp` | **80-95%** |

## ⚙️ 設定ファイル

デフォルトオプションを設定ファイルで保存できます：

### .img-compress.config.js
```javascript
module.exports = {
  quality: 80,
  output: './compressed',
  minSize: 1024,
  skipSmall: true,
  ultraPng: false,        // 超強力圧縮を強制
  // format: 'jpeg',      // 形式変換
  // resize: '1920x1080', // リサイズ
};
```

### img-compress.config.json
```json
{
  "quality": 85,
  "output": "./output",
  "minSize": 2048,
  "skipSmall": true,
  "ultraPng": true
}
```

## よくある質問

### Q: どの形式が一番効率的？
**A:** 用途によって最適解が異なります

| 用途 | 推奨フォーマット | 理由 |
|-----|----------------|------|
| 写真（透明度不要） | JPEG | 最高の圧縮率（90-98%削減） |
| 写真（モダンブラウザ） | WebP | JPEGより20-30%小さい |
| イラスト・ロゴ | PNG（自動最適化） | 透明度とシャープな線を保持 |

### Q: 透明度のあるPNGはどうすればいい？
**A:** 自動最適化または段階的に圧縮を試してください

```bash
# 基本: 自動最適化（推奨）
npm run dev -- ./logos --quality 70

# WebPも透明度をサポート（より小さい）
npm run dev -- ./logos --format webp --quality 80
```

### Q: ファイル容量が増えてしまう
**A:** 以下の対処法を試してください

```bash
# PNG写真の場合: JPEG変換を使用
npm run dev -- ./photos --format jpeg --quality 75

# PNG維持が必要な場合: 自動最適化
npm run dev -- ./images --quality 50
```

## 圧縮結果の例

### PNG写真の圧縮テスト（6.36MB → 0.16MB、97.5%削減）

```bash
# JPEG変換で劇的な削減
npm run dev -- ./input --format jpeg --quality 75

📊 Processing Summary
============================
Successful: 3
Original size: 6.36 MB
Compressed size: 0.16 MB
Space saved: 6.20 MB (97.5%)
```

## 開発者向け

### 開発・テスト
```bash
# 開発中の実行
npm run dev -- ./test-images --quality 85

# ビルド
npm run build

# テスト実行
npm test

# リント・フォーマット
npm run lint
npm run format
```

### 技術スタック
- **Node.js** - ランタイム
- **TypeScript** - 開発言語  
- **Sharp** - 高速画像処理ライブラリ
- **Commander.js** - CLI パーサー
- **Jest** - テストフレームワーク
- **ESLint + Prettier** - 静的解析・コードフォーマット

## バージョン履歴

### v1.1.0 (最新)
- ✅ **スマートPNG圧縮**: 自動的に最適な圧縮レベルを選択
- ✅ **段階的PNG圧縮**: 標準→積極的→超強力を自動適用（オプション不要）
- ✅ **プログレスバー表示**: バッチ処理の視覚的進捗表示
- ✅ **設定ファイル対応**: `.img-compress.config.js`と`.json`形式
- ✅ **強化されたエラーハンドリング**: カスタム例外クラスと詳細エラー情報

### v1.0.0
- ✅ 基本的な画像圧縮機能
- ✅ リサイズ・形式変換
- ✅ 小さなファイルスキップ機能
- ✅ 詳細な処理統計表示

## ライセンス

ISC

## 今後の機能拡張予定

- [ ] AVIF形式サポート  
- [ ] 監視モード（ファイル変更検知）
- [ ] バッチ処理レポート出力（HTML/CSV）
- [x] ~~スマートPNG圧縮~~ ✅ 完了
- [x] ~~プログレスバー表示~~ ✅ 完了
- [x] ~~設定ファイル対応~~ ✅ 完了
