import { describe, it, expect } from '@jest/globals';
import { TaskStatus } from '../../../../../domain/Task/ValueObjects/TaskStatus.js';

describe('TaskStatus Value Object', () => {
  describe('create', () => {
    it('should create a TaskStatus with value true', () => {
      const result = TaskStatus.create(true);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(true);
    });

    it('should create a TaskStatus with value false', () => {
      const result = TaskStatus.create(false);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(false);
    });

    it('should fail when value is null', () => {
      const result = TaskStatus.create(null as unknown as boolean);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when value is undefined', () => {
      const result = TaskStatus.create(undefined as unknown as boolean);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });
  });

  describe('value getter', () => {
    it('should return true when status is true', () => {
      const result = TaskStatus.create(true);
      const status = result.getValue();

      expect(status.value).toBe(true);
    });

    it('should return false when status is false', () => {
      const result = TaskStatus.create(false);
      const status = result.getValue();

      expect(status.value).toBe(false);
    });
  });
});

