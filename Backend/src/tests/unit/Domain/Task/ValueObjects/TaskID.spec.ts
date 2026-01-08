import { describe, it, expect } from '@jest/globals';
import { TaskID } from '../../../../../domain/Task/ValueObjects/TaskID.js';

describe('TaskID Value Object', () => {
  describe('create', () => {
    it('should create a valid TaskID with correct format T-001', () => {
      const result = TaskID.create('T-001');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id.toString()).toBe('T-001');
    });

    it('should create a valid TaskID with format T-999', () => {
      const result = TaskID.create('T-999');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id.toString()).toBe('T-999');
    });

    it('should create a valid TaskID with format T-123', () => {
      const result = TaskID.create('T-123');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id.toString()).toBe('T-123');
    });

    it('should fail when taskId is null', () => {
      const result = TaskID.create(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when taskId is undefined', () => {
      const result = TaskID.create(undefined as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when taskId has invalid format (no prefix)', () => {
      const result = TaskID.create('001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('must match pattern');
    });

    it('should fail when taskId has invalid format (wrong prefix)', () => {
      const result = TaskID.create('X-001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('must match pattern');
    });

    it('should fail when taskId has invalid format (too few digits)', () => {
      const result = TaskID.create('T-01');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('must match pattern');
    });

    it('should fail when taskId has invalid format (too many digits)', () => {
      const result = TaskID.create('T-0001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('must match pattern');
    });

    it('should fail when taskId has invalid format (no hyphen)', () => {
      const result = TaskID.create('T001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('must match pattern');
    });

    it('should fail when taskId has invalid format (letters instead of digits)', () => {
      const result = TaskID.create('T-ABC');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('must match pattern');
    });

    it('should trim whitespace from taskId', () => {
      const result = TaskID.create('  T-001  ');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id.toString()).toBe('T-001');
    });
  });
});

