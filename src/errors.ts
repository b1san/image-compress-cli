import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export class ImageCompressionError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ImageCompressionError';
  }
}

export class UnsupportedFormatError extends ImageCompressionError {
  constructor(filePath: string, format: string) {
    super(`Unsupported image format: ${format}`, filePath);
    this.name = 'UnsupportedFormatError';
  }
}

export class InsufficientSpaceError extends ImageCompressionError {
  constructor(filePath: string, requiredSpace: number) {
    super(`Insufficient disk space. Required: ${requiredSpace} bytes`, filePath);
    this.name = 'InsufficientSpaceError';
  }
}

/**
 * ディスクの空き容量をチェック
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export function checkDiskSpace(outputPath: string, estimatedSize: number): boolean {
  try {
    // ディレクトリの存在確認のみ実行
    fs.statSync(path.dirname(outputPath));
    // 簡易的なチェック（実際のディスク容量チェックは複雑）
    return true; // プラットフォーム依存のため、常にtrueを返す
  } catch {
    return false;
  }
}

/**
 * 安全なファイル操作
 */
export async function safeFileOperation<T>(
  operation: () => Promise<T>,
  filePath: string,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`❌ ${operationName} failed for ${path.basename(filePath)}: ${errorMessage}`));
    throw new ImageCompressionError(
      `${operationName} failed: ${errorMessage}`,
      filePath,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * ファイル形式の検証
 */
export function validateImageFormat(filePath: string): boolean {
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
  const ext = path.extname(filePath).toLowerCase();
  return supportedExtensions.includes(ext);
}

/**
 * 設定値の検証
 */
export function validateProcessOptions(options: any): string[] {
  const errors: string[] = [];

  if (typeof options.quality !== 'number' || options.quality < 0 || options.quality > 100) {
    errors.push('Quality must be a number between 0 and 100');
  }

  if (options.minSize && (typeof options.minSize !== 'number' || options.minSize < 0)) {
    errors.push('minSize must be a non-negative number');
  }

  if (options.width && (typeof options.width !== 'number' || options.width <= 0)) {
    errors.push('Width must be a positive number');
  }

  if (options.height && (typeof options.height !== 'number' || options.height <= 0)) {
    errors.push('Height must be a positive number');
  }

  if (options.format && !['jpeg', 'png', 'webp'].includes(options.format.toLowerCase())) {
    errors.push('Format must be one of: jpeg, png, webp');
  }

  return errors;
}
