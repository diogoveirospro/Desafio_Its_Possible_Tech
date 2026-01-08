import { describe, it, expect } from '@jest/globals';
import {
  createIdPattern,
  createIdRegexString,
  generateFirstId,
  generateNextId,
  extractSequenceNumber,
} from '../../../utils/IdGenerator.js';

describe('IdGenerator', () => {
  describe('createIdPattern', () => {
    it('should create a pattern matching default prefix T-###', () => {
      const pattern = createIdPattern();

      expect(pattern.test('T-001')).toBe(true);
      expect(pattern.test('T-123')).toBe(true);
      expect(pattern.test('T-999')).toBe(true);
    });

    it('should create a pattern matching custom prefix', () => {
      const pattern = createIdPattern('INC');

      expect(pattern.test('INC-001')).toBe(true);
      expect(pattern.test('INC-999')).toBe(true);
    });

    it('should not match invalid formats', () => {
      const pattern = createIdPattern();

      expect(pattern.test('T-01')).toBe(false);
      expect(pattern.test('T-0001')).toBe(false);
      expect(pattern.test('T001')).toBe(false);
      expect(pattern.test('X-001')).toBe(false);
      expect(pattern.test('')).toBe(false);
    });

    it('should escape special regex characters in prefix', () => {
      const pattern = createIdPattern('T.INC');

      expect(pattern.test('T.INC-001')).toBe(true);
      expect(pattern.test('TXINC-001')).toBe(false);
    });

    it('should capture the sequence number', () => {
      const pattern = createIdPattern();
      const match = 'T-123'.match(pattern);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('123');
    });
  });

  describe('createIdRegexString', () => {
    it('should create a regex string for default prefix', () => {
      const regexStr = createIdRegexString();

      expect(regexStr).toBe('^T-\\d{3}$');
    });

    it('should create a regex string for custom prefix', () => {
      const regexStr = createIdRegexString('INC');

      expect(regexStr).toBe('^INC-\\d{3}$');
    });

    it('should escape special characters in prefix', () => {
      const regexStr = createIdRegexString('T.INC');

      expect(regexStr).toBe('^T\\.INC-\\d{3}$');
    });

    it('should work when used in RegExp constructor', () => {
      const regexStr = createIdRegexString();
      const pattern = new RegExp(regexStr);

      expect(pattern.test('T-001')).toBe(true);
      expect(pattern.test('T-999')).toBe(true);
      expect(pattern.test('X-001')).toBe(false);
    });
  });

  describe('generateFirstId', () => {
    it('should generate T-001 with default prefix', () => {
      const id = generateFirstId();

      expect(id).toBe('T-001');
    });

    it('should generate INC-001 with custom prefix', () => {
      const id = generateFirstId('INC');

      expect(id).toBe('INC-001');
    });

    it('should work with complex prefix', () => {
      const id = generateFirstId('TASK');

      expect(id).toBe('TASK-001');
    });
  });

  describe('generateNextId', () => {
    it('should generate T-002 when maxSequence is 1', () => {
      const id = generateNextId(1);

      expect(id).toBe('T-002');
    });

    it('should generate T-010 when maxSequence is 9', () => {
      const id = generateNextId(9);

      expect(id).toBe('T-010');
    });

    it('should generate T-100 when maxSequence is 99', () => {
      const id = generateNextId(99);

      expect(id).toBe('T-100');
    });

    it('should generate T-999 when maxSequence is 998', () => {
      const id = generateNextId(998);

      expect(id).toBe('T-999');
    });

    it('should throw error when sequence exceeds 999', () => {
      expect(() => generateNextId(999)).toThrow('ID sequence overflow');
    });

    it('should generate T-001 when maxSequence is 0', () => {
      const id = generateNextId(0);

      expect(id).toBe('T-001');
    });

    it('should work with custom prefix', () => {
      const id = generateNextId(5, 'INC');

      expect(id).toBe('INC-006');
    });

    it('should pad numbers correctly', () => {
      expect(generateNextId(0)).toBe('T-001');
      expect(generateNextId(8)).toBe('T-009');
      expect(generateNextId(99)).toBe('T-100');
    });
  });

  describe('extractSequenceNumber', () => {
    it('should extract sequence number from valid ID', () => {
      const seq = extractSequenceNumber('T-001');

      expect(seq).toBe(1);
    });

    it('should extract sequence number 123 from T-123', () => {
      const seq = extractSequenceNumber('T-123');

      expect(seq).toBe(123);
    });

    it('should extract sequence number 999 from T-999', () => {
      const seq = extractSequenceNumber('T-999');

      expect(seq).toBe(999);
    });

    it('should return null for invalid format', () => {
      expect(extractSequenceNumber('T-01')).toBeNull();
      expect(extractSequenceNumber('T-0001')).toBeNull();
      expect(extractSequenceNumber('T001')).toBeNull();
      expect(extractSequenceNumber('')).toBeNull();
      expect(extractSequenceNumber('invalid')).toBeNull();
    });

    it('should return null when prefix does not match', () => {
      const seq = extractSequenceNumber('X-001', 'T');

      expect(seq).toBeNull();
    });

    it('should extract number with custom prefix', () => {
      const seq = extractSequenceNumber('INC-042', 'INC');

      expect(seq).toBe(42);
    });

    it('should handle leading zeros correctly', () => {
      expect(extractSequenceNumber('T-001')).toBe(1);
      expect(extractSequenceNumber('T-010')).toBe(10);
      expect(extractSequenceNumber('T-100')).toBe(100);
    });
  });
});

