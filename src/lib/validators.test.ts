import { describe, it, expect } from 'vitest';
import { onlyDigits, isValidCpf, isValidEmailStrict } from './validators';

describe('validators', () => {
  describe('onlyDigits', () => {
    it('should remove all non-numeric characters', () => {
      expect(onlyDigits('123.456.789-00')).toBe('12345678900');
      expect(onlyDigits('abc123def456')).toBe('123456');
      expect(onlyDigits('!@#$%^&*()')).toBe('');
      expect(onlyDigits('')).toBe('');
    });
  });

  describe('isValidCpf', () => {
    it('should return true for valid CPFs', () => {
      // These are valid CPFs for testing
      expect(isValidCpf('52998224725')).toBe(true);
      expect(isValidCpf('12345678909')).toBe(true);
    });

    it('should return true for valid CPFs with punctuation', () => {
      expect(isValidCpf('529.982.247-25')).toBe(true);
      expect(isValidCpf('123.456.789-09')).toBe(true);
    });

    it('should return false for CPFs with invalid lengths', () => {
      expect(isValidCpf('123')).toBe(false);
      expect(isValidCpf('1234567890')).toBe(false);
      expect(isValidCpf('123456789012')).toBe(false);
    });

    it('should return false for repeated-digit CPFs', () => {
      expect(isValidCpf('00000000000')).toBe(false);
      expect(isValidCpf('11111111111')).toBe(false);
      expect(isValidCpf('222.222.222-22')).toBe(false);
      expect(isValidCpf('99999999999')).toBe(false);
    });

    it('should return false for CPFs with invalid check digits', () => {
      expect(isValidCpf('52998224720')).toBe(false);
      expect(isValidCpf('04490581531')).toBe(false);
      expect(isValidCpf('123.456.789-10')).toBe(false);
    });
  });

  describe('isValidEmailStrict', () => {
    it('should return true for valid strict emails', () => {
      expect(isValidEmailStrict('user@example.com')).toBe(true);
      expect(isValidEmailStrict('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmailStrict('admin@domain.io')).toBe(true);
    });

    it('should return false for emails without a TLD', () => {
      expect(isValidEmailStrict('user@localhost')).toBe(false);
      expect(isValidEmailStrict('user@example')).toBe(false);
    });

    it('should return false for malformed emails', () => {
      expect(isValidEmailStrict('user@')).toBe(false);
      expect(isValidEmailStrict('@example.com')).toBe(false);
      expect(isValidEmailStrict('user example.com')).toBe(false);
    });

    it('should handle leading/trailing whitespace correctly by trimming', () => {
      expect(isValidEmailStrict('  user@example.com  ')).toBe(true);
    });
  });
});
