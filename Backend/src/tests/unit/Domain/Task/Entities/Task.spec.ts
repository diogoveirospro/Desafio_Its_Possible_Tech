import { describe, it, expect, beforeEach } from '@jest/globals';
import { Task } from '../../../../../domain/Task/Entities/Task.js';
import { TaskID } from '../../../../../domain/Task/ValueObjects/TaskID.js';
import { TaskTitle } from '../../../../../domain/Task/ValueObjects/TaskTitle.js';
import { TaskStatus } from '../../../../../domain/Task/ValueObjects/TaskStatus.js';

describe('Task Entity', () => {
  const validTaskId = TaskID.create('T-001').getValue();
  const validTitle = TaskTitle.create('Test Task').getValue();
  const validStatus = TaskStatus.create(false).getValue();
  const validDate = new Date('2026-01-08T10:00:00Z');

  describe('create', () => {
    it('should create a valid Task with all properties', () => {
      const result = Task.create({
        taskId: validTaskId,
        title: validTitle,
        status: validStatus,
        DateCreated: validDate,
      });

      expect(result.isSuccess).toBe(true);
      const task = result.getValue();
      expect(task.taskId.id.toString()).toBe('T-001');
      expect(task.title.value).toBe('Test Task');
      expect(task.status.value).toBe(false);
      expect(task.dateCreated).toEqual(validDate);
    });

    it('should create a valid Task with string taskId', () => {
      const result = Task.create({
        taskId: 'T-002',
        title: validTitle,
        status: validStatus,
        DateCreated: validDate,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().taskId.id.toString()).toBe('T-002');
    });

    it('should create a valid Task with string title', () => {
      const result = Task.create({
        taskId: validTaskId,
        title: 'String Title',
        status: validStatus,
        DateCreated: validDate,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().title.value).toBe('String Title');
    });

    it('should create a valid Task without status (defaults to false)', () => {
      const result = Task.create({
        taskId: validTaskId,
        title: validTitle,
        DateCreated: validDate,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status.value).toBe(false);
    });

    it('should create a valid Task with status true', () => {
      const trueStatus = TaskStatus.create(true).getValue();
      const result = Task.create({
        taskId: validTaskId,
        title: validTitle,
        status: trueStatus,
        DateCreated: validDate,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status.value).toBe(true);
    });

    it('should fail when taskId is null', () => {
      const result = Task.create({
        taskId: null as unknown as TaskID,
        title: validTitle,
        DateCreated: validDate,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('taskId');
    });

    it('should fail when taskId is undefined', () => {
      const result = Task.create({
        taskId: undefined as unknown as TaskID,
        title: validTitle,
        DateCreated: validDate,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('taskId');
    });

    it('should fail when title is null', () => {
      const result = Task.create({
        taskId: validTaskId,
        title: null as unknown as TaskTitle,
        DateCreated: validDate,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title');
    });

    it('should fail when title is undefined', () => {
      const result = Task.create({
        taskId: validTaskId,
        title: undefined as unknown as TaskTitle,
        DateCreated: validDate,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title');
    });

    it('should fail when string taskId has invalid format', () => {
      const result = Task.create({
        taskId: 'INVALID',
        title: validTitle,
        DateCreated: validDate,
      });

      expect(result.isFailure).toBe(true);
    });

    it('should fail when string title is empty', () => {
      const result = Task.create({
        taskId: validTaskId,
        title: '',
        DateCreated: validDate,
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe('getters', () => {
    let task: Task;

    beforeEach(() => {
      const result = Task.create({
        taskId: validTaskId,
        title: validTitle,
        status: validStatus,
        DateCreated: validDate,
      });
      task = result.getValue();
    });

    it('should return the correct taskId', () => {
      expect(task.taskId).toBe(validTaskId);
    });

    it('should return the correct title', () => {
      expect(task.title).toBe(validTitle);
    });

    it('should return the correct status', () => {
      expect(task.status).toBe(validStatus);
    });

    it('should return the correct dateCreated', () => {
      expect(task.dateCreated).toEqual(validDate);
    });
  });
});

