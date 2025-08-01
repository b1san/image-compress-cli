import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export interface ProcessOptions {
  quality: number;
  width?: number;
  height?: number;
  format?: string;
  skipSmall?: boolean;
  minSize?: number;
  aggressivePng?: boolean;
}

export interface ProcessResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  error?: string;
}

/**
 * 単一画像を処理
 */
export async function processImage(
  inputPath: string,
  outputPath: string,
  options: ProcessOptions
): Promise<ProcessResult> {
  try {
    // 入力ファイルサイズを取得
    const inputStats = fs.statSync(inputPath);
    const originalSize = inputStats.size;
    
    // 入力画像の情報を取得
    const inputMetadata = await sharp(inputPath).metadata();
    
    // 小さなファイルの処理
    const minSize = options.minSize || 1024;
    if (options.skipSmall !== false && originalSize < minSize) {
      console.log(chalk.yellow(`  → Skipping small file (${originalSize} bytes, min: ${minSize})`));
      // 元ファイルをコピー
      fs.copyFileSync(inputPath, outputPath);
      const outputStats = fs.statSync(outputPath);
      return {
        success: true,
        inputPath,
        outputPath,
        originalSize,
        compressedSize: outputStats.size,
      };
    }
    
    // 出力ディレクトリを作成
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Sharpでの画像処理
    let sharpInstance = sharp(inputPath);
    
    // メタデータを削除してファイルサイズを削減
    sharpInstance = sharpInstance.rotate(); // 自動回転（EXIFに基づく）
    
    // リサイズ処理
    if (options.width && options.height) {
      sharpInstance = sharpInstance.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // フォーマット変換と圧縮
    switch (options.format) {
      case 'jpeg': {
        sharpInstance = sharpInstance.jpeg({ 
          quality: options.quality,
          progressive: originalSize > 10000, // 10KB以上の場合のみプログレッシブ
          mozjpeg: true // より効率的な圧縮
        });
        break;
      }
      case 'png': {
        // PNGは圧縮レベル（0-9）を使用 - より適切な計算
        // quality 100 -> compressionLevel 0 (最小圧縮)
        // quality 0 -> compressionLevel 9 (最大圧縮)
        const compressionLevel = Math.round((100 - options.quality) * 9 / 100);
        sharpInstance = sharpInstance.png({ 
          compressionLevel: Math.max(0, Math.min(9, compressionLevel)),
          progressive: originalSize > 10000,
          palette: inputMetadata.channels === 3,
          effort: options.aggressivePng ? 10 : 7 // より積極的な圧縮
        });
        break;
      }
      case 'webp': {
        sharpInstance = sharpInstance.webp({ 
          quality: options.quality
        });
        break;
      }
      default: {
        // フォーマット指定がない場合は元のフォーマットを維持
        const ext = path.extname(inputPath).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') {
          sharpInstance = sharpInstance.jpeg({ 
            quality: options.quality,
            progressive: originalSize > 10000,
            mozjpeg: true
          });
        } else if (ext === '.png') {
          const compressionLevel = Math.round((100 - options.quality) * 9 / 100);
          sharpInstance = sharpInstance.png({ 
            compressionLevel: Math.max(0, Math.min(9, compressionLevel)),
            progressive: originalSize > 10000,
            palette: inputMetadata.channels === 3,
            effort: options.aggressivePng ? 10 : 7
          });
        } else if (ext === '.webp') {
          sharpInstance = sharpInstance.webp({ 
            quality: options.quality
          });
        }
        break;
      }
    }
    
    // 画像を保存
    await sharpInstance.toFile(outputPath);
    
    // 出力ファイルサイズを取得
    const outputStats = fs.statSync(outputPath);
    const compressedSize = outputStats.size;
    
    // PNGファイルで容量が増えた場合の提案
    if (compressedSize > originalSize && path.extname(inputPath).toLowerCase() === '.png' && !options.format) {
      console.log(chalk.yellow(`  💡 Tip: Consider using --format jpeg for better compression of this PNG`));
    }
    
    return {
      success: true,
      inputPath,
      outputPath,
      originalSize,
      compressedSize,
    };
    
  } catch (error) {
    return {
      success: false,
      inputPath,
      outputPath,
      originalSize: 0,
      compressedSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 処理結果を表示
 */
export function displayProcessResult(result: ProcessResult): void {
  if (result.success) {
    const compressionRatio = ((result.originalSize - result.compressedSize) / result.originalSize * 100);
    const originalSizeKB = (result.originalSize / 1024).toFixed(1);
    const compressedSizeKB = (result.compressedSize / 1024).toFixed(1);
    
    console.log(
      chalk.green(`✓ ${path.basename(result.inputPath)}`) +
      chalk.gray(` ${originalSizeKB}KB → ${compressedSizeKB}KB`) +
      chalk.blue(` (${compressionRatio > 0 ? '-' : '+'}${Math.abs(compressionRatio).toFixed(1)}%)`)
    );
    
    // デバッグ情報（容量が増えた場合）
    if (result.compressedSize > result.originalSize) {
      console.log(chalk.yellow(`  ⚠️  File size increased by ${(result.compressedSize - result.originalSize)} bytes`));
    }
  } else {
    console.log(
      chalk.red(`✗ ${path.basename(result.inputPath)}`) +
      chalk.gray(` - ${result.error}`)
    );
  }
}

/**
 * 処理統計を表示
 */
export function displaySummary(results: ProcessResult[]): void {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const totalOriginalSize = successful.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressedSize = successful.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const compressionRatio = totalOriginalSize > 0 ? (totalSaved / totalOriginalSize * 100) : 0;
  
  console.log(chalk.blue('\n📊 Processing Summary'));
  console.log(chalk.gray('============================'));
  console.log(chalk.green(`Successful: ${successful.length}`));
  
  if (failed.length > 0) {
    console.log(chalk.red(`Failed: ${failed.length}`));
  }
  
  if (successful.length > 0) {
    console.log(chalk.blue(`Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`));
    console.log(chalk.blue(`Compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`));
    console.log(
      chalk.green(`Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`) +
      chalk.gray(` (${compressionRatio.toFixed(1)}%)`)
    );
  }
}
