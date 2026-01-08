import { describe, it, expect } from '@jest/globals';
import { TaskTitle } from '../../../../../domain/Task/ValueObjects/TaskTitle.js';

describe('TaskTitle Value Object', () => {
  describe('create', () => {
    it('should create a valid TaskTitle with a non-empty string', () => {
      const result = TaskTitle.create('Buy groceries');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Buy groceries');
    });

    it('should create a valid TaskTitle with a single character', () => {
      const result = TaskTitle.create('A');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('A');
    });

    it('should create a valid TaskTitle with special characters', () => {
      const result = TaskTitle.create('Task with @special #characters!');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Task with @special #characters!');
    });

    it('should trim whitespace from the title', () => {
      const result = TaskTitle.create('  Buy groceries  ');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Buy groceries');
    });

    it('should fail when title is null', () => {
      const result = TaskTitle.create(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when title is undefined', () => {
      const result = TaskTitle.create(undefined as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when title is empty string', () => {
      const result = TaskTitle.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('cannot be empty');
    });

    it('should fail when title is only whitespace', () => {
      const result = TaskTitle.create('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('cannot be empty');
    });

    it('should preserve internal whitespace', () => {
      const result = TaskTitle.create('Task with   multiple   spaces');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Task with   multiple   spaces');
    });

    it('should handle unicode characters', () => {
      const result = TaskTitle.create('タスク名 - Task 任务');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('タスク名 - Task 任务');
    });

    it('should handle emoji characters', () => {
      const result = TaskTitle.create('Complete task 🎯');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Complete task 🎯');
    });
  });
});

