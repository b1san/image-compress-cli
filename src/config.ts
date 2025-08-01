import * as fs from 'fs';
import * as path from 'path';
import { ProcessOptions } from './compress';

export interface ConfigFile {
  quality?: number;
  format?: string;
  aggressivePng?: boolean;
  ultraPng?: boolean;
  skipSmall?: boolean;
  minSize?: number;
  output?: string;
  resize?: string;
  exclude?: string[];
  include?: string[];
}

const CONFIG_FILENAMES = [
  'img-compress.config.js',
  'img-compress.config.json',
  '.img-compress.json',
  '.img-compressrc'
];

/**
 * 設定ファイルを検索・読み込み
 */
export function loadConfig(startDir: string = process.cwd()): ConfigFile | null {
  let currentDir = startDir;
  
  while (currentDir !== path.dirname(currentDir)) {
    for (const filename of CONFIG_FILENAMES) {
      const configPath = path.join(currentDir, filename);
      
      if (fs.existsSync(configPath)) {
        try {
          return loadConfigFile(configPath);
        } catch (error) {
          console.warn(`Warning: Failed to load config file ${configPath}:`, error);
        }
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

/**
 * 設定ファイルの内容を読み込み
 */
function loadConfigFile(configPath: string): ConfigFile {
  const ext = path.extname(configPath);
  
  if (ext === '.js') {
    // ESLintスタイルのJSファイル
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    return config.default || config;
  } else {
    // JSONファイル
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  }
}

/**
 * CLIオプションと設定ファイルをマージ
 */
export function mergeConfig(
  cliOptions: Partial<ProcessOptions>,
  configFile: ConfigFile | null
): ProcessOptions {
  const defaultOptions: ProcessOptions = {
    quality: 80,
    skipSmall: true,
    minSize: 1024,
    aggressivePng: false
  };
  
  // 優先順位: CLI > 設定ファイル > デフォルト
  return {
    ...defaultOptions,
    ...(configFile || {}),
    ...cliOptions
  };
}

/**
 * サンプル設定ファイルを生成
 */
export function generateSampleConfig(outputPath: string): void {
  const sampleConfig: ConfigFile = {
    quality: 80,
    format: 'webp',
    aggressivePng: false,
    skipSmall: true,
    minSize: 1024,
    output: './compressed',
    exclude: [
      '**/*.tmp',
      '**/temp/**',
      '**/.DS_Store'
    ],
    include: [
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.png',
      '**/*.webp'
    ]
  };
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(sampleConfig, null, 2),
    'utf-8'
  );
}
