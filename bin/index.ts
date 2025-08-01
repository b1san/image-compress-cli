#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import * as fs from 'fs';
import * as path from 'path';
import { 
  findImageFiles, 
  parseResizeOption, 
  getOutputPath, 
  validateQuality, 
  validateFormat 
} from '../src/utils';
import { processImage, displayProcessResult, displaySummary, ProcessResult } from '../src/compress';
import { loadConfig } from '../src/config';
import { ImageCompressionError } from '../src/errors';

const program = new Command();

// パッケージ情報を取得
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf8')
);

program
  .name('img-compress')
  .description('CLI tool for batch image compression, resizing, and format conversion')
  .version(packageJson.version);

program
  .argument('<input>', 'Input directory containing images')
  .option('-o, --output <dir>', 'Output directory (default: ./output)')
  .option('-q, --quality <number>', 'Compression quality 0-100 (default: 80)', '80')
  .option('-r, --resize <size>', 'Resize images to WIDTHxHEIGHT (e.g., 800x600)')
  .option('-f, --format <format>', 'Output format: jpeg, png, webp (default: original)')
  .option('--aggressive-png', 'Use more aggressive PNG compression (slower but smaller)', false)
  .option('--ultra-png', 'Use maximum PNG compression (slowest but smallest)', false)
  .option('--skip-small', 'Skip files smaller than 1KB (default: true)', true)
  .option('--min-size <bytes>', 'Minimum file size to process in bytes (default: 1024)', '1024')
  .action(async (input: string, options) => {
    const spinner = ora('Starting image compression...').start();
    
    try {
      // 設定ファイルの読み込み
      let config = {};
      try {
        const loadedConfig = await loadConfig();
        if (loadedConfig) {
          config = loadedConfig;
          console.log(chalk.blue('📋 Configuration file loaded'));
        }
      } catch (error) {
        // 設定ファイルがない場合は無視
        if (error instanceof ImageCompressionError) {
          console.log(chalk.yellow(`⚠️ Config warning: ${error.message}`));
        }
      }
      
      // 設定ファイルとCLIオプションをマージ
      const finalOptions = { ...config, ...options };
      
      // オプションのバリデーション
      const quality = validateQuality(finalOptions.quality || '80');
      let resizeOptions: { width: number; height: number } | undefined;
      
      if (finalOptions.resize) {
        const parsedResize = parseResizeOption(finalOptions.resize);
        if (!parsedResize) {
          spinner.fail(chalk.red('Invalid resize format. Use WIDTHxHEIGHT (e.g., 800x600)'));
          process.exit(1);
        }
        resizeOptions = parsedResize;
      }
      
      let format: string | undefined;
      if (finalOptions.format) {
        format = validateFormat(finalOptions.format);
      }
      
      // オプションの表示
      console.log(chalk.blue('\n📸 Image Compression CLI'));
      console.log(chalk.gray('================================'));
      console.log(chalk.green(`Input directory: ${input}`));
      console.log(chalk.green(`Output directory: ${finalOptions.output || './output'}`));
      console.log(chalk.green(`Quality: ${quality}%`));
      
      if (resizeOptions) {
        console.log(chalk.green(`Resize: ${resizeOptions.width}x${resizeOptions.height}`));
      }
      
      if (format) {
        console.log(chalk.green(`Format: ${format}`));
      }
      
      // 入力ディレクトリの存在確認
      if (!fs.existsSync(input)) {
        spinner.fail(chalk.red(`Input directory "${input}" does not exist`));
        process.exit(1);
      }
      
      if (!fs.statSync(input).isDirectory()) {
        spinner.fail(chalk.red(`"${input}" is not a directory`));
        process.exit(1);
      }
      
      // 出力ディレクトリの作成
      const outputDir = finalOptions.output || './output';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(chalk.yellow(`Created output directory: ${outputDir}`));
      }
      
      spinner.text = 'Searching for image files...';
      
      // 画像ファイルを検索
      const imageFiles = findImageFiles(input);
      
      if (imageFiles.length === 0) {
        spinner.warn(chalk.yellow('No image files found in the input directory'));
        console.log(chalk.gray('Supported formats: jpg, jpeg, png, webp, tiff, bmp'));
        process.exit(0);
      }
      
      spinner.succeed(chalk.green(`Found ${imageFiles.length} image(s) to process`));
      
      // 画像処理
      console.log(chalk.blue('\n� Processing images...'));
      console.log(chalk.gray('============================'));
      
      const results: ProcessResult[] = [];
      
      // プログレスバーの初期化
      const progressBar = new cliProgress.SingleBar({
        format: 'Progress |{bar}| {percentage}% | {value}/{total} | {filename}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      
      progressBar.start(imageFiles.length, 0, { filename: 'Starting...' });

      for (let i = 0; i < imageFiles.length; i++) {
        const inputPath = imageFiles[i];
        const outputPath = getOutputPath(inputPath, input, outputDir, format);
        
        progressBar.update(i, { filename: path.basename(inputPath) });

        const result = await processImage(inputPath, outputPath, {
          quality,
          width: resizeOptions?.width,
          height: resizeOptions?.height,
          format,
          skipSmall: finalOptions.skipSmall !== false,
          minSize: parseInt(finalOptions.minSize || '1024', 10),
          aggressivePng: finalOptions.aggressivePng || false,
          ultraPng: finalOptions.ultraPng || false,
        });
        
        results.push(result);
      }
      
      progressBar.update(imageFiles.length, { filename: 'Complete!' });
      progressBar.stop();
      
      // 処理結果の詳細表示
      console.log(chalk.blue('\n📊 Processing Results'));
      console.log(chalk.gray('============================'));
      results.forEach(result => displayProcessResult(result));
      
      // 処理結果のサマリー表示
      displaySummary(results);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed === 0) {
        console.log(chalk.green(`\n🎉 All ${successful} images processed successfully!`));
      } else {
        console.log(chalk.yellow(`\n⚠️  Processed ${successful} images successfully, ${failed} failed`));
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// エラーハンドリング
try {
  program.parse();
} catch (error) {
  // ヘルプ表示時は正常終了
  if (error instanceof Error && error.message.includes('outputHelp')) {
    process.exit(0);
  }
  console.error(chalk.red('Command parsing error:'), error);
  process.exit(1);
}
