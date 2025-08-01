import { findImageFiles, parseResizeOption, getOutputPath, validateQuality, validateFormat } from '../src/utils';
import * as fs from 'fs';
import * as path from 'path';

describe('Utils', () => {
  describe('parseResizeOption', () => {
    it('should parse valid resize string', () => {
      const result = parseResizeOption('800x600');
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should return null for invalid resize string', () => {
      expect(parseResizeOption('invalid')).toBe(null);
      expect(parseResizeOption('800')).toBe(null);
      expect(parseResizeOption('800x')).toBe(null);
      expect(parseResizeOption('x600')).toBe(null);
    });
  });

  describe('validateQuality', () => {
    it('should validate correct quality values', () => {
      expect(validateQuality('80')).toBe(80);
      expect(validateQuality('0')).toBe(0);
      expect(validateQuality('100')).toBe(100);
    });

    it('should throw error for invalid quality values', () => {
      expect(() => validateQuality('-1')).toThrow('Quality must be a number between 0 and 100');
      expect(() => validateQuality('101')).toThrow('Quality must be a number between 0 and 100');
      expect(() => validateQuality('invalid')).toThrow('Quality must be a number between 0 and 100');
    });
  });

  describe('validateFormat', () => {
    it('should validate correct formats', () => {
      expect(validateFormat('jpeg')).toBe('jpeg');
      expect(validateFormat('JPEG')).toBe('jpeg');
      expect(validateFormat('png')).toBe('png');
      expect(validateFormat('webp')).toBe('webp');
    });

    it('should throw error for invalid formats', () => {
      expect(() => validateFormat('gif')).toThrow('Unsupported image format: gif');
      expect(() => validateFormat('invalid')).toThrow('Unsupported image format: invalid');
    });
  });

  describe('getOutputPath', () => {
    it('should generate correct output path without format change', () => {
      const result = getOutputPath(
        '/input/subdir/image.jpg',
        '/input',
        '/output'
      );
      expect(result).toBe(path.join('/output', 'subdir', 'image.jpg'));
    });

    it('should generate correct output path with format change', () => {
      const result = getOutputPath(
        '/input/subdir/image.jpg',
        '/input',
        '/output',
        'webp'
      );
      expect(result).toBe(path.join('/output', 'subdir', 'image.webp'));
    });
  });
});
