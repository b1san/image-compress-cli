import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { safeFileOperation } from './errors';

export interface ProcessOptions {
  quality: number;
  width?: number;
  height?: number;
  format?: string;
  skipSmall?: boolean;
  minSize?: number;
  aggressivePng?: boolean;
  ultraPng?: boolean; // 新しいオプション：Ultra PNG圧縮
}

export interface ProcessResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  inputSize: number;
  outputSize: number;
  reductionPercent: number;
  processingTime: number;
  skipped?: boolean;
  reason?: string;
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
  const startTime = Date.now();
  
  try {
    // 入力ファイルのサイズチェック
    const stats = await safeFileOperation(
      () => fs.promises.stat(inputPath),
      inputPath,
      'File stat check'
    );
    
    const inputSize = stats.size;
    
    if (options.skipSmall && inputSize < (options.minSize || 1024)) {
      return {
        inputPath,
        outputPath,
        success: true,
        inputSize,
        outputSize: inputSize,
        reductionPercent: 0,
        processingTime: Date.now() - startTime,
        skipped: true,
        reason: `File too small (${inputSize} bytes < ${options.minSize || 1024} bytes)`
      };
    }
    
    // 出力ディレクトリの作成
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Sharp インスタンスの作成とメタデータ取得
    const image = sharp(inputPath);
    const inputMetadata = await image.metadata();
    
    // 圧縮とリサイズの処理
    let processedImage = image;
    let outputSize: number = 0;
    
    if (options.width || options.height) {
      processedImage = processedImage.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // フォーマット別の処理
    if (options.format === 'jpeg' || (options.format === undefined && path.extname(inputPath).toLowerCase() === '.jpg') || (options.format === undefined && path.extname(inputPath).toLowerCase() === '.jpeg')) {
      processedImage = processedImage.jpeg({
        quality: options.quality,
        progressive: inputSize > 10000, // 10KB以上の場合のみプログレッシブ
        mozjpeg: true
      });
    } else if (options.format === 'png' || (options.format === undefined && path.extname(inputPath).toLowerCase() === '.png')) {
      // PNGの場合、段階的圧縮を自動実行
      const compressionLevel = Math.round((100 - options.quality) * 9 / 100);
      
      // まず標準圧縮を試行
      let bestCompression = processedImage.png({
        compressionLevel,
        progressive: false,
        palette: inputMetadata?.channels === 3,
        quality: options.quality,
      });
      
      // 標準圧縮の結果をバッファに保存して検証
      const standardBuffer = await bestCompression.toBuffer();
      let bestSize = standardBuffer.length;
      let bestBuffer = standardBuffer;
      let compressionMethod = 'standard';
      
      // 積極的圧縮を試行（aggressivePngオプションまたは標準圧縮で改善が少ない場合）
      if (options.aggressivePng || bestSize >= inputSize * 0.8) {
        try {
          const aggressiveCompression = sharp(inputPath);
          if (options.width || options.height) {
            aggressiveCompression.resize(options.width, options.height, {
              fit: 'inside',
              withoutEnlargement: true
            });
          }
          
          const aggressiveBuffer = await aggressiveCompression.png({
            compressionLevel: 9,
            progressive: false,
            palette: true,
            quality: Math.max(20, options.quality - 30),
            effort: 10,
            colors: inputMetadata?.channels === 4 ? 256 : undefined,
            dither: 1.0,
          }).toBuffer();
          
          if (aggressiveBuffer.length < bestSize) {
            bestBuffer = aggressiveBuffer;
            bestSize = aggressiveBuffer.length;
            compressionMethod = 'aggressive';
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️ Aggressive compression failed, using standard`));
        }
      }
      
      // 超強力圧縮を試行（ultraPngオプションまたは積極的圧縮でも改善が少ない場合）
      if (options.ultraPng || bestSize >= inputSize * 0.6) {
        try {
          const ultraCompression = sharp(inputPath);
          if (options.width || options.height) {
            ultraCompression.resize(options.width, options.height, {
              fit: 'inside',
              withoutEnlargement: true
            });
          }
          
          const ultraBuffer = await ultraCompression
            .png({
              palette: true,
              colors: inputMetadata?.channels === 4 ? 64 : 128,
              dither: 1.0,
            })
            .png({
              compressionLevel: 9,
              quality: Math.max(5, options.quality - 60),
              effort: 10,
            }).toBuffer();
          
          if (ultraBuffer.length < bestSize) {
            bestBuffer = ultraBuffer;
            bestSize = ultraBuffer.length;
            compressionMethod = 'ultra';
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️ Ultra compression failed, using ${compressionMethod}`));
        }
      }
      
      // 最適な圧縮結果を保存
      await fs.promises.writeFile(outputPath, bestBuffer);
      
      console.log(chalk.gray(`    🔧 PNG compression: ${compressionMethod} (${bestSize} bytes)`));
      
      // 出力ファイルサイズを取得（既に分かっているのでbestSizeを使用）
      outputSize = bestSize;
    } else if (options.format === 'webp') {
      if (options.aggressivePng) {
        processedImage = processedImage.webp({
          quality: Math.max(20, options.quality - 20),
          effort: 6,
          nearLossless: false,
          smartSubsample: true,
        });
      } else {
        processedImage = processedImage.webp({
          quality: options.quality,
        });
      }
      
      // 画像を保存
      await processedImage.toFile(outputPath);
      
      // 出力ファイルサイズを取得
      const outputStats = fs.statSync(outputPath);
      outputSize = outputStats.size;
    } else {
      // その他の形式（JPEG等）
      // 画像を保存
      await processedImage.toFile(outputPath);
      
      // 出力ファイルサイズを取得
      const outputStats = fs.statSync(outputPath);
      outputSize = outputStats.size;
    }
    
    // ファイルサイズが増加した場合の警告
    if (outputSize > inputSize && path.extname(inputPath).toLowerCase() === '.png' && !options.format) {
      console.log(chalk.yellow(`⚠️  PNG compression increased file size. Consider using --format jpeg for photos.`));
    }

    const reductionPercent = Math.round((1 - outputSize / inputSize) * 100);
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      inputPath,
      outputPath,
      inputSize,
      outputSize,
      reductionPercent,
      processingTime
    };
  } catch (error) {
    return {
      success: false,
      inputPath,
      outputPath,
      inputSize: 0,
      outputSize: 0,
      reductionPercent: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 処理結果を表示
 */
export function displayProcessResult(result: ProcessResult): void {
  if (!result.success) {
    console.log(chalk.red(`❌ ${path.basename(result.inputPath)}: ${result.error}`));
    return;
  }

  if (result.skipped && result.reason) {
    console.log(chalk.yellow(`⏭️  ${path.basename(result.inputPath)}: ${result.reason}`));
    return;
  }

  const compressionRatio = result.reductionPercent;
  const originalSizeKB = (result.inputSize / 1024).toFixed(1);
  const compressedSizeKB = (result.outputSize / 1024).toFixed(1);
  
  console.log(chalk.green(`✅ ${path.basename(result.inputPath)}`));
  console.log(chalk.gray(`   Size: ${originalSizeKB}KB → ${compressedSizeKB}KB`));
  
  if (compressionRatio > 0) {
    console.log(chalk.gray(`   Reduction: ${compressionRatio}%`));
  } else if (compressionRatio < 0) {
    console.log(chalk.yellow(`   Size increased: ${Math.abs(compressionRatio)}%`));
  }
  
  if (result.outputSize > result.inputSize) {
    console.log(chalk.yellow(`  ⚠️  File size increased by ${(result.outputSize - result.inputSize)} bytes`));
    if (path.extname(result.inputPath).toLowerCase() === '.png') {
      console.log(chalk.gray(`      💡 Try: --ultra-png for maximum PNG compression`));
      console.log(chalk.gray(`      💡 Or: --format jpeg for photos (usually 90%+ reduction)`));
    }
  } else if (result.reductionPercent > 0 && path.extname(result.inputPath).toLowerCase() === '.png') {
    console.log(chalk.gray(`      💡 For even smaller PNG: try --ultra-png (slower but smaller)`));
  }
}

/**
 * 処理統計を表示
 */
export function displaySummary(results: ProcessResult[]): void {
  const successful = results.filter(r => r.success && !r.skipped);
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => !r.success);
  
  const totalInputSize = successful.reduce((sum, r) => sum + r.inputSize, 0);
  const totalOutputSize = successful.reduce((sum, r) => sum + r.outputSize, 0);
  const totalSaved = totalInputSize - totalOutputSize;
  const compressionRatio = totalInputSize > 0 ? (totalSaved / totalInputSize * 100) : 0;
  
  console.log(chalk.blue('\n📊 Processing Summary'));
  console.log(chalk.gray('============================'));
  console.log(chalk.green(`Successful: ${successful.length}`));
  
  if (skipped.length > 0) {
    console.log(chalk.yellow(`Skipped: ${skipped.length}`));
  }
  
  if (failed.length > 0) {
    console.log(chalk.red(`Failed: ${failed.length}`));
  }
  
  if (successful.length > 0) {
    console.log(chalk.blue(`Original size: ${(totalInputSize / 1024 / 1024).toFixed(2)} MB`));
    console.log(chalk.blue(`Compressed size: ${(totalOutputSize / 1024 / 1024).toFixed(2)} MB`));
    console.log(
      chalk.green(`Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`) +
      chalk.gray(` (${compressionRatio.toFixed(1)}%)`)
    );
  }
}
