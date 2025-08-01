import { processImage, displayProcessResult, displaySummary, ProcessOptions } from '../src/compress';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// テスト用の一時ディレクトリを作成
const testDir = path.join(os.tmpdir(), 'img-compress-test');
const inputDir = path.join(testDir, 'input');
const outputDir = path.join(testDir, 'output');

beforeAll(() => {
  // テスト用ディレクトリを作成
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
});

afterAll(() => {
  // テスト用ディレクトリを削除
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

describe('Compress', () => {
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('processImage', () => {
    it('should skip small files when skipSmall is true', async () => {
      // 小さなテストファイルを作成
      const testFilePath = path.join(inputDir, 'small.txt');
      fs.writeFileSync(testFilePath, 'small file content');
      
      const options: ProcessOptions = {
        quality: 80,
        skipSmall: true,
        minSize: 1024
      };

      const result = await processImage(
        testFilePath,
        path.join(outputDir, 'small.txt'),
        options
      );

      expect(result.success).toBe(true);
      expect(result.inputSize).toBeLessThan(1024);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Skipping small file')
      );
    });

    it('should handle invalid image files gracefully', async () => {
      // 無効な画像ファイルを作成
      const invalidImagePath = path.join(inputDir, 'invalid.jpg');
      fs.writeFileSync(invalidImagePath, 'not an image');

      const options: ProcessOptions = {
        quality: 80,
        skipSmall: false,
        minSize: 0
      };

      const result = await processImage(
        invalidImagePath,
        path.join(outputDir, 'invalid.jpg'),
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('displayProcessResult', () => {
    it('should display successful result correctly', () => {
      const result = {
        success: true,
        inputPath: '/test/image.jpg',
        outputPath: '/output/image.jpg',
        inputSize: 1024,
        outputSize: 512,
        reductionPercent: 50,
        processingTime: 100
      };

      displayProcessResult(result);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ image.jpg')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1.0KB → 0.5KB')
      );
    });

    it('should display failed result correctly', () => {
      const result = {
        success: false,
        inputPath: '/test/image.jpg',
        outputPath: '/output/image.jpg',
        inputSize: 0,
        outputSize: 0,
        reductionPercent: 0,
        processingTime: 100,
        error: 'Test error'
      };

      displayProcessResult(result);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ image.jpg')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });
  });

  describe('displaySummary', () => {
    it('should display summary with successful and failed results', () => {
      const results = [
        {
          success: true,
          inputPath: '/test/image1.jpg',
          outputPath: '/output/image1.jpg',
          inputSize: 2048,
          outputSize: 1024,
          reductionPercent: 50,
          processingTime: 100
        },
        {
          success: false,
          inputPath: '/test/image2.jpg',
          outputPath: '/output/image2.jpg',
          inputSize: 0,
          outputSize: 0,
          reductionPercent: 0,
          processingTime: 50,
          error: 'Test error'
        }
      ];

      displaySummary(results);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📊 Processing Summary')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successful: 1')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Failed: 1')
      );
    });
  });
});
