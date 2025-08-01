# img-compress-cli

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

# PNG維持で積極的圧縮（最大40%削減）
img-compress ./photos --quality 50 --aggressive-png

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
| `--skip-small` | - | 小さなファイルをスキップ | `true` |
| `--min-size` | - | 処理する最小ファイルサイズ（bytes） | `1024` |

## 使用例

### 基本的な圧縮

```bash
img-compress ./photos --quality 70
```

### PNG写真の最適化（大幅削減）

```bash
# JPEG変換（写真に最適）
img-compress ./photos --format jpeg --quality 75

# PNG維持で積極的圧縮
img-compress ./photos --quality 50 --aggressive-png
```

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
| PNG維持 | `--aggressive-png --quality 50` | **30-50%** |
| JPEG写真 | `--quality 70-80` | **20-40%** |
| 高解像度画像 | `--resize + --format webp` | **80-95%** |

## 自動提案機能

ツールが自動的に最適化を提案します：

```bash
✓ photo.png 2267.5KB → 2698.6KB (+19.0%)
  💡 Tip: Consider using --format jpeg for better compression of this PNG
```

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

You can create configuration files to set default options:

### JavaScript Configuration (.img-compress.config.js)
```javascript
module.exports = {
  quality: 80,
  output: './compressed',
  minSize: 1024,
  skipSmall: true,
  aggressivePng: false,
  // format: 'jpeg',
  // resize: '1920x1080',
};
```

### JSON Configuration (img-compress.config.json)
```json
{
  "quality": 85,
  "output": "./output",
  "minSize": 2048,
  "skipSmall": true,
  "aggressivePng": true
}
```

Configuration files are searched in the following order:
1. `.img-compress.config.js` (in current directory)
2. `img-compress.config.json` (in current directory) 
3. `img-compress.config.js` (in current directory)

CLI options will override configuration file settings.

## 🛡️ Error Handling

The tool includes comprehensive error handling:

- **File Access Errors**: Handles permission issues and missing files
- **Format Validation**: Validates supported image formats
- **Size Warnings**: Alerts when compression increases file size
- **Progress Tracking**: Shows which files fail during batch processing
- **Graceful Recovery**: Continues processing other files if one fails

## 📊 Performance Features

- **Progress Bar**: Visual progress indicator for batch operations
- **Smart PNG Handling**: Detects when PNG compression isn't effective
- **File Size Optimization**: Skips very small files to avoid overhead
- **Memory Efficient**: Processes images one at a time to manage memory usage

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

**A: PNG維持で積極的圧縮を使用**

```bash
# 透明度を保持したまま圧縮
img-compress ./logos --aggressive-png --quality 60

# WebPも透明度をサポート（より小さい）
img-compress ./logos --format webp --quality 80
```

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

3. **PNG維持が必要な場合**: 積極的圧縮を使用
   ```bash
   img-compress ./images --aggressive-png --quality 50
   ```

### Q: 処理が遅い

**A: 以下で高速化できます**

```bash
# 積極的PNG圧縮を無効化
img-compress ./photos --quality 75

# 形式変換で高速化
img-compress ./photos --format webp --quality 80
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
- [ ] プログレスバー表示
- [ ] AVIF形式サポート
- [ ] 設定ファイル対応
- [ ] バッチ処理レポート出力
