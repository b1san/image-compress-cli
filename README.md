# im## 🚀 Features

- **🔄 Batch Processing**: Process multiple images in a directory with a beautiful progress bar
- **📦 Multiple Formats**: Support for JPEG, PNG, WebP, TIFF, and BMP
- **🎯 Format Conversion**: Convert between image formats
- **📏 Smart Resizing**: Resize images while maintaining aspect ratio
- **⚡ High Performance**: Uses Sharp library for fast image processing
# img-compress-cli

画像フォルダを対象に、CLIから一括で画像圧縮・リサイズ・形式変換を行うNode.js製のツール。

## 🚀 Features

- **🔄 Batch Processing**: Process multiple images in a directory with a beautiful progress bar
- **📦 Multiple Formats**: Support for JPEG, PNG, WebP, TIFF, and BMP
- **� Format Conversion**: Convert between image formats
- **📏 Smart Resizing**: Resize images while maintaining aspect ratio
- **⚡ High Performance**: Uses Sharp library for fast image processing
- **�🎨 Smart PNG Compression**: Automatic progressive compression (standard → aggressive → ultra)
- **📊 Detailed Statistics**: Shows compression ratios and space saved
- **⚙️ Configuration Files**: Support for persistent settings via config files
- **🛡️ Error Handling**: Comprehensive error handling with helpful messages
- **📈 Progress Tracking**: Visual progress bar for batch operations
- **💡 自動提案機能**: 最適なフォーマット変換の提案
- **⚡ スキップ機能**: 小さなファイルの自動スキップ
- **📊 Detailed Statistics**: Shows compression ratios and space saved
- **⚙️ Configuration Files**: Support for persistent settings via config files
- **🛡️ Error Handling**: Comprehensive error handling with helpful messages
- **📈 Progress Tracking**: Visual progress bar for batch operationsli

画像フォルダを対象に、CLIから一括で画像圧縮・リサイズ・形式変換を行うNode.js製のツール。

## 🚀 Features

- **� Batch Processing**: Process multiple images in a directory with a beautiful progress bar
- **� Multiple Formats**: Support for JPEG, PNG, WebP, TIFF, and BMP
- **🎯 Format Conversion**: Convert between image formats
- **📏 Smart Resizing**: Resize images while maintaining aspect ratio
- **⚡ High Performance**: Uses Sharp library for fast image processing
- **🎨 Optimized PNG Compression**: Special handling for PNG files with aggressive compression options
- **📊 Detailed Statistics**: Shows compression ratios and space saved
- **⚙️ Configuration Files**: Support for persistent settings via config files
- **� Error Handling**: Comprehensive error handling with helpful messages
- **� Progress Tracking**: Visual progress bar for batch operations
- 💡 自動提案機能（最適なフォーマット変換）
- ⚙️ 小さなファイルのスキップ機能

## インストール

### npm (グローバルインストール)

```bash
npm install -g img-compress-cli
```

### ローカルでの開発・実行

```bash
git clone <this-repository>
cd img-compress-cli
npm install
npm run build
npm link  # グローバルコマンドとして利用可能
```

## 使い方

### 基本的な使い方

```bash
img-compress ./input-folder
```

### 高品質な圧縮（推奨）

```bash
# PNG写真 → JPEG変換（最大97%削減）
img-compress ./photos --format jpeg --quality 75

# PNG自動最適化（標準→積極的→超強力を自動選択）
img-compress ./photos --quality 50

# WebP変換（バランス重視）
img-compress ./photos --format webp --quality 80
```

### オプション一覧

| オプション | 短縮形 | 説明 | デフォルト |
|-----------|-------|------|-----------|
| `--output` | `-o` | 出力フォルダ | `./output` |
| `--quality` | `-q` | 圧縮品質（0-100） | `80` |
| `--resize` | `-r` | リサイズサイズ（例：800x600） | - |
| `--format` | `-f` | 出力形式（jpeg, png, webp） | 元の形式 |
| `--aggressive-png` | - | PNG積極的圧縮（遅いが小さい） | `false` |
| `--ultra-png` | - | PNG超強力圧縮（最遅だが最小） | `false` |
| `--skip-small` | - | 小さなファイルをスキップ | `true` |
| `--min-size` | - | 処理する最小ファイルサイズ（bytes） | `1024` |

## 使用例

### 基本的な圧縮

```bash
img-compress ./photos --quality 70
```

## 🎨 スマートPNG圧縮

このツールは**自動的に最適なPNG圧縮**を選択します：

### 🔧 自動圧縮レベル選択
1. **標準圧縮**: まず通常の圧縮を試行
2. **積極的圧縮**: 標準で改善が少ない場合（80%以上のサイズ）、自動的により強力な圧縮を適用
3. **超強力圧縮**: さらに必要な場合（60%以上のサイズ）、最大圧縮を自動適用

### 📊 実際の処理例
```bash
# シンプルに実行するだけで最適化
img-compress ./images --quality 70

# 出力例:
✅ photo.png
   Size: 2267.5KB → 891.2KB
   Reduction: 61%
   🔧 PNG compression: aggressive (891234 bytes)
```

### ✨ 主な特徴
- **オプション不要**: `--ultra-png`や`--aggressive-png`を指定しなくても自動最適化
- **段階的処理**: 複数の圧縮レベルを試行し、最小サイズを自動選択
- **透明性保持**: 透明度やアルファチャンネルを維持しながら圧縮
- **インテリジェント判定**: ファイルサイズの改善度に応じて適切な圧縮レベルを選択

**オプション無しで自動最適化！**

### WebP形式に一括変換

```bash
img-compress ./photos --format webp --quality 85
```

### リサイズ＋圧縮

```bash
img-compress ./large-images --resize 1920x1080 --quality 80
```

### 小さなファイルも処理

```bash
img-compress ./icons --min-size 0 --quality 75
```

### 高解像度写真の最適化

```bash
img-compress ./raw-photos \
  --output ./optimized \
  --resize 2048x1536 \
  --format webp \
  --quality 85
```

## 圧縮効果の目安

| ファイル種類 | 推奨手法 | 期待削減率 |
|-------------|---------|-----------|
| PNG写真 | `--format jpeg --quality 75` | **90-98%** |
| PNG写真（透明なし） | `--format webp --quality 80` | **85-95%** |
| PNG維持（自動最適化） | `--quality 50` | **40-70%** |
| JPEG写真 | `--quality 70-80` | **20-40%** |
| 高解像度画像 | `--resize + --format webp` | **80-95%** |

**✨ PNG画像は自動的に最適な圧縮方法が選択されます**

## 自動提案機能

ツールが自動的に最適化を提案します：

```bash
✅ photo.png
   Size: 2267.5KB → 891.2KB
   Reduction: 61%
   � PNG compression: aggressive (891234 bytes)
   💡 For even smaller PNG: try --ultra-png (slower but smaller)
```

### 🤖 スマート提案システム
- **ファイルサイズ増加時**: より適切なフォーマット変換を提案
- **PNG最適化**: さらなる圧縮オプションを提案  
- **処理結果表示**: 使用された圧縮レベルを明示

## 実際の使用例と結果

### PNG写真の圧縮テスト（6.36MB → 0.16MB、97.5%削減）

```bash
# 元ファイル: 3つのPNG画像（合計6.36MB）
$ ls -la input/
-rw-r--r--  2321910  ChatGPT Image 2025年7月31日 23_25_32.png
-rw-r--r--  2171021  ChatGPT Image 2025年8月1日 16_45_14.png  
-rw-r--r--  2171021  ChatGPT Image 2025年8月1日 17_07_12.png

# JPEG変換で劇的な削減
$ img-compress ./input --format jpeg --quality 75

📊 Processing Summary
============================
Successful: 3
Original size: 6.36 MB
Compressed size: 0.16 MB
Space saved: 6.20 MB (97.5%)
```

### PNG維持での積極的圧縮（6.36MB → 3.71MB、41.6%削減）

```bash
$ img-compress ./input --quality 50 --aggressive-png

📊 Processing Summary
============================
Successful: 3
Original size: 6.36 MB
Compressed size: 3.71 MB
Space saved: 2.65 MB (41.6%)
```

## ⚙️ Configuration Files

設定ファイルでデフォルトオプションを設定できます：

### JavaScript設定ファイル (.img-compress.config.js)
```javascript
module.exports = {
  quality: 80,
  output: './compressed',
  minSize: 1024,
  skipSmall: true,
  // PNG圧縮オプション（どちらか一つを選択）
  aggressivePng: false,   // 積極的圧縮を強制
  ultraPng: false,        // 超強力圧縮を強制
  // format: 'jpeg',      // 形式変換
  // resize: '1920x1080', // リサイズ
};
```

### JSON設定ファイル (img-compress.config.json)
```json
{
  "quality": 85,
  "output": "./output",
  "minSize": 2048,
  "skipSmall": true,
  "aggressivePng": false,
  "ultraPng": true
}
```

### 📁 設定ファイル検索順序
1. `.img-compress.config.js` (カレントディレクトリ)
2. `img-compress.config.json` (カレントディレクトリ) 
3. `img-compress.config.js` (カレントディレクトリ)

**注意**: CLIオプションは設定ファイルの値を上書きします。

## 🛡️ エラーハンドリング

ツールには包括的なエラーハンドリングが含まれています：

- **ファイルアクセスエラー**: 権限問題や存在しないファイルの処理
- **フォーマット検証**: サポートされる画像形式の検証
- **サイズ警告**: 圧縮によりファイルサイズが増加した場合の警告
- **進捗追跡**: バッチ処理中に失敗したファイルの追跡
- **グレースフル復旧**: 一つのファイルが失敗しても他のファイルの処理を継続

## 📊 パフォーマンス機能

- **プログレスバー**: バッチ操作の視覚的進捗インジケーター
- **スマートPNG処理**: PNG圧縮が効果的でない場合の検出
- **ファイルサイズ最適化**: オーバーヘッドを避けるため非常に小さなファイルをスキップ
- **メモリ効率**: メモリ使用量を管理するため画像を一つずつ処理

### Dockerイメージのビルド

```bash
docker build -t img-compress-cli .
```

### よくある質問（FAQ）

### Q: どの形式が一番効率的？

**A: 用途によって最適解が異なります**

| 用途 | 推奨フォーマット | 理由 |
|-----|----------------|------|
| 写真（透明度不要） | JPEG | 最高の圧縮率（90-98%削減） |
| 写真（モダンブラウザ） | WebP | JPEGより20-30%小さい |
| イラスト・ロゴ | PNG（積極的圧縮） | 透明度とシャープな線を保持 |
| アニメーション | 元のまま | GIFは対応予定 |

### Q: 品質設定の目安は？

**A: 用途別の推奨設定**

```bash
# Web用（軽量重視）
img-compress ./photos --quality 70 --format webp

# 印刷用（品質重視）  
img-compress ./photos --quality 85 --format jpeg

# アーカイブ用（バランス）
img-compress ./photos --quality 80 --format webp
```

### Q: 透明度のあるPNGはどうすればいい？

**A: 自動最適化または段階的に圧縮を試してください**

```bash
# 基本: 自動最適化（推奨）
img-compress ./logos --quality 70

# 手動で段階的に試したい場合:
# ステップ1: 積極的圧縮を強制
img-compress ./logos --aggressive-png --quality 50

# ステップ2: 超強力圧縮を強制（品質は下がるがファイルサイズ最小）
img-compress ./logos --ultra-png --quality 30

# WebPも透明度をサポート（より小さい）
img-compress ./logos --format webp --quality 80
```

**💡 通常は自動最適化で十分です！**

### Q: 一度に大量のファイルを処理できる？

**A: 可能です。再帰的に全サブフォルダも処理します**

```bash
# 数千枚でも一括処理
img-compress ./photo-archive --format webp --quality 75

# 進捗状況も表示されます
⠋ Processing 1247/2841: IMG_5439.jpg
```

## Docker での使用

```bash
docker run --rm \
  -v $(pwd)/input:/input \
  -v $(pwd)/output:/output \
  img-compress-cli \
  /input --output /output --format webp --quality 80
```

## トラブルシューティング

### Q: ファイル容量が増えてしまう

**A: 以下の対処法を試してください**

1. **PNG写真の場合**: JPEG変換を使用
   ```bash
   img-compress ./photos --format jpeg --quality 75
   ```

2. **小さなファイルの場合**: 自動でスキップされます
   ```bash
   # 手動で処理する場合
   img-compress ./icons --min-size 0
   ```

3. **PNG維持が必要な場合**: 自動最適化または手動で段階的圧縮
   ```bash
   # 推奨: 自動最適化（オプション不要）
   img-compress ./images --quality 50
   
   # 手動で積極的圧縮を強制
   img-compress ./images --aggressive-png --quality 50
   
   # さらに小さくしたい場合は超強力圧縮を強制
   img-compress ./images --ultra-png --quality 30
   ```

### Q: 処理が遅い

**A: 以下で高速化できます**

```bash
# 積極的PNG圧縮を無効化（デフォルト設定）
img-compress ./photos --quality 75

# 形式変換で高速化
img-compress ./photos --format webp --quality 80

# 注意: --ultra-png は非常に遅いため、必要な場合のみ使用
```

## 開発者向け

### 開発環境のセットアップ

```bash
git clone <this-repository>
cd img-compress-cli
npm install
```

### 開発中の実行

```bash
npm run dev -- ./test-images --quality 85
```

### ビルド

```bash
npm run build
```

### テスト実行

```bash
npm test
```

### リント・フォーマット

```bash
npm run lint
npm run format
```

## 技術スタック

- **Node.js** - ランタイム
- **TypeScript** - 開発言語  
- **Sharp** - 高速画像処理ライブラリ
- **Commander.js** - CLI パーサー
- **Ora** - スピナー表示
- **Chalk** - ターミナル色付け
- **Jest** - テストフレームワーク
- **ESLint + Prettier** - 静的解析・コードフォーマット

## バージョン履歴

### v1.1.0 (最新)
- ✅ **スマートPNG圧縮**: 自動的に最適な圧縮レベルを選択
- ✅ **プログレスバー表示**: バッチ処理の視覚的進捗表示
- ✅ **設定ファイル対応**: `.img-compress.config.js`と`.json`形式
- ✅ **強化されたエラーハンドリング**: カスタム例外クラスと詳細エラー情報
- ✅ **段階的PNG圧縮**: 標準→積極的→超強力を自動適用（オプション不要）

### v1.0.0
- ✅ 基本的な画像圧縮機能
- ✅ リサイズ・形式変換
- ✅ PNG積極的圧縮オプション追加
- ✅ 小さなファイルスキップ機能
- ✅ 自動提案機能
- ✅ 詳細な処理統計表示

## ライセンス

ISC

## 貢献

Issue や Pull Request を歓迎します！

## 今後の機能拡張予定

- [ ] 監視モード（ファイル変更検知）
- [ ] 差分処理（変更されたファイルのみ）
- [ ] AVIF形式サポート  
- [ ] バッチ処理レポート出力（HTML/CSV）
- [ ] GPU加速サポート
- [ ] クラウドストレージ連携
- [x] ~~プログレスバー表示~~ ✅ 完了
- [x] ~~設定ファイル対応~~ ✅ 完了
- [x] ~~PNG自動最適化~~ ✅ 完了
