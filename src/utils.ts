import * as fs from 'fs';
import * as path from 'path';

/**
 * サポートしている画像拡張子
 */
export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];

/**
 * ディレクトリ内から画像ファイルを再帰的に検索
 */
export function findImageFiles(dir: string): string[] {
  const imageFiles: string[] = [];
  
  function traverse(currentDir: string): void {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          imageFiles.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return imageFiles;
}

/**
 * リサイズサイズの文字列をパース
 */
export function parseResizeOption(resizeStr: string): { width: number; height: number } | null {
  const match = resizeStr.match(/^(\d+)x(\d+)$/);
  if (!match) {
    return null;
  }
  
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
}

/**
 * 相対パスを出力ディレクトリ内のパスに変換
 */
export function getOutputPath(
  inputPath: string,
  inputDir: string,
  outputDir: string,
  format?: string
): string {
  const relativePath = path.relative(inputDir, inputPath);
  const parsedPath = path.parse(relativePath);
  
  // フォーマット指定がある場合は拡張子を変更
  if (format) {
    parsedPath.ext = `.${format}`;
    parsedPath.base = parsedPath.name + parsedPath.ext;
  }
  
  return path.join(outputDir, parsedPath.dir, parsedPath.base);
}

/**
 * 品質の値をバリデーション
 */
export function validateQuality(quality: string): number {
  const q = parseInt(quality, 10);
  if (isNaN(q) || q < 0 || q > 100) {
    throw new Error('Quality must be a number between 0 and 100');
  }
  return q;
}

/**
 * 出力フォーマットをバリデーション
 */
export function validateFormat(format: string): string {
  const validFormats = ['jpeg', 'png', 'webp'];
  if (!validFormats.includes(format.toLowerCase())) {
    throw new Error(`Format must be one of: ${validFormats.join(', ')}`);
  }
  return format.toLowerCase();
}
