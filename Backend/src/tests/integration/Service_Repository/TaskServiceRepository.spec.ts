/**
 * Integration tests for TaskService -> TaskRepository layer.
 *
 * Tests the service-repository integration using a mock repository
 * to verify the service correctly interacts with the repository.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TaskService from '../../../services/TaskService.js';
import type { ITaskRepository } from '../../../services/IRepos/ITaskRepository.js';
import { Task } from '../../../domain/Task/Entities/Task.js';
import { TaskID } from '../../../domain/Task/ValueObjects/TaskID.js';
import { TaskTitle } from '../../../domain/Task/ValueObjects/TaskTitle.js';
import { TaskStatus } from '../../../domain/Task/ValueObjects/TaskStatus.js';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID.js';

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  silly: jest.fn(),
};

// Mock repository
const mockTaskRepo: jest.Mocked<ITaskRepository> = {
  findAll: jest.fn<any>(),
  findByTaskId: jest.fn<any>(),
  save: jest.fn<any>(),
  toggleStatus: jest.fn<any>(),
  delete: jest.fn<any>(),
};

describe('Integration: TaskService -> TaskRepository', () => {
  let service: TaskService;

  // Helper to create a valid domain Task
  const createValidDomainTask = (
    id: string = 'T-001',
    title: string = 'Test Task',
    status: boolean = false
  ): Task => {
    const taskId = TaskID.create(id).getValue();
    const taskTitle = TaskTitle.create(title).getValue();
    const taskStatus = TaskStatus.create(status).getValue();

    return Task.create({
      taskId,
      title: taskTitle,
      status: taskStatus,
      DateCreated: new Date('2026-01-08T10:00:00.000Z')
    }, new UniqueEntityID(id)).getValue();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskService(mockTaskRepo, mockLogger);
  });

  describe('listTasks -> repository.findAll', () => {
    it('should call repository.findAll and return mapped DTOs', async () => {
      const tasks = [
        createValidDomainTask('T-001', 'Task 1', false),
        createValidDomainTask('T-002', 'Task 2', true),
      ];
      mockTaskRepo.findAll.mockResolvedValueOnce(tasks);

      const result = await service.listTasks();

      expect(result.isSuccess).toBe(true);
      expect(mockTaskRepo.findAll).toHaveBeenCalled();
      const dtos = result.getValue();
      expect(dtos).toHaveLength(2);
      expect(dtos[0]!.id).toBe('T-001');
      expect(dtos[0]!.title).toBe('Task 1');
      expect(dtos[0]!.status).toBe(false);
      expect(dtos[1]!.id).toBe('T-002');
      expect(dtos[1]!.title).toBe('Task 2');
      expect(dtos[1]!.status).toBe(true);
    });

    it('should return empty array when repository returns empty', async () => {
      mockTaskRepo.findAll.mockResolvedValueOnce([]);

      const result = await service.listTasks();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual([]);
    });

    it('should return failure when repository throws', async () => {
      mockTaskRepo.findAll.mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await service.listTasks();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('createTask -> repository.findAll + repository.save', () => {
    it('should generate T-001 when repository is empty', async () => {
      mockTaskRepo.findAll.mockResolvedValueOnce([]);
      const savedTask = createValidDomainTask('T-001', 'New Task', false);
      mockTaskRepo.save.mockResolvedValueOnce(savedTask);

      const result = await service.createTask('New Task');

      expect(result.isSuccess).toBe(true);
      expect(mockTaskRepo.findAll).toHaveBeenCalled(); // For ID generation
      expect(mockTaskRepo.save).toHaveBeenCalled();
      expect(result.getValue().id).toBe('T-001');
    });

    it('should generate T-002 when T-001 exists', async () => {
      const existingTask = createValidDomainTask('T-001', 'Existing Task', false);
      mockTaskRepo.findAll.mockResolvedValueOnce([existingTask]);
      const savedTask = createValidDomainTask('T-002', 'New Task', false);
      mockTaskRepo.save.mockResolvedValueOnce(savedTask);

      const result = await service.createTask('New Task');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('T-002');
    });

    it('should generate T-004 when T-001, T-002, T-003 exist', async () => {
      const existingTasks = [
        createValidDomainTask('T-001', 'Task 1', false),
        createValidDomainTask('T-002', 'Task 2', false),
        createValidDomainTask('T-003', 'Task 3', false),
      ];
      mockTaskRepo.findAll.mockResolvedValueOnce(existingTasks);
      const savedTask = createValidDomainTask('T-004', 'New Task', false);
      mockTaskRepo.save.mockResolvedValueOnce(savedTask);

      const result = await service.createTask('New Task');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('T-004');
    });

    it('should return failure when repository.save throws', async () => {
      mockTaskRepo.findAll.mockResolvedValueOnce([]);
      mockTaskRepo.save.mockRejectedValueOnce(new Error('Database write error'));

      const result = await service.createTask('New Task');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Database write error');
    });

    it('should validate title before calling repository', async () => {
      const result = await service.createTask('');

      expect(result.isFailure).toBe(true);
      expect(mockTaskRepo.findAll).not.toHaveBeenCalled();
      expect(mockTaskRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('toggleTaskStatus -> repository.toggleStatus', () => {
    it('should call repository.toggleStatus and return mapped DTO', async () => {
      const toggledTask = createValidDomainTask('T-001', 'Task', true);
      mockTaskRepo.toggleStatus.mockResolvedValueOnce(toggledTask);

      const result = await service.toggleTaskStatus('T-001');

      expect(result.isSuccess).toBe(true);
      expect(mockTaskRepo.toggleStatus).toHaveBeenCalledWith('T-001');
      expect(result.getValue().id).toBe('T-001');
      expect(result.getValue().status).toBe(true);
    });

    it('should return failure when task not found', async () => {
      mockTaskRepo.toggleStatus.mockResolvedValueOnce(null);

      const result = await service.toggleTaskStatus('T-999');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Task not found');
    });

    it('should return failure when repository throws', async () => {
      mockTaskRepo.toggleStatus.mockRejectedValueOnce(new Error('Database error'));

      const result = await service.toggleTaskStatus('T-001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Database error');
    });

    it('should validate taskId before calling repository', async () => {
      const result = await service.toggleTaskStatus('INVALID');

      expect(result.isFailure).toBe(true);
      expect(mockTaskRepo.toggleStatus).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask -> repository.delete', () => {
    it('should call repository.delete and return success', async () => {
      mockTaskRepo.delete.mockResolvedValueOnce(true);

      const result = await service.deleteTask('T-001');

      expect(result.isSuccess).toBe(true);
      expect(mockTaskRepo.delete).toHaveBeenCalledWith('T-001');
      expect(result.getValue()).toBe(true);
    });

    it('should return failure when task not found', async () => {
      mockTaskRepo.delete.mockResolvedValueOnce(false);

      const result = await service.deleteTask('T-999');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Task not found');
    });

    it('should return failure when repository throws', async () => {
      mockTaskRepo.delete.mockRejectedValueOnce(new Error('Database error'));

      const result = await service.deleteTask('T-001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Database error');
    });

    it('should validate taskId before calling repository', async () => {
      const result = await service.deleteTask('INVALID');

      expect(result.isFailure).toBe(true);
      expect(mockTaskRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('Complete workflow through service-repository', () => {
    it('should handle complete CRUD workflow', async () => {
      // Create first task
      mockTaskRepo.findAll.mockResolvedValueOnce([]);
      const task1 = createValidDomainTask('T-001', 'Task A', false);
      mockTaskRepo.save.mockResolvedValueOnce(task1);

      let result = await service.createTask('Task A');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('T-001');

      // Create second task
      mockTaskRepo.findAll.mockResolvedValueOnce([task1]);
      const task2 = createValidDomainTask('T-002', 'Task B', false);
      mockTaskRepo.save.mockResolvedValueOnce(task2);

      result = await service.createTask('Task B');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('T-002');

      // List tasks
      mockTaskRepo.findAll.mockResolvedValueOnce([task1, task2]);

      const listResult = await service.listTasks();
      expect(listResult.isSuccess).toBe(true);
      expect(listResult.getValue()).toHaveLength(2);

      // Toggle first task
      const toggledTask1 = createValidDomainTask('T-001', 'Task A', true);
      mockTaskRepo.toggleStatus.mockResolvedValueOnce(toggledTask1);

      const toggleResult = await service.toggleTaskStatus('T-001');
      expect(toggleResult.isSuccess).toBe(true);
      expect(toggleResult.getValue().status).toBe(true);

      // Delete second task
      mockTaskRepo.delete.mockResolvedValueOnce(true);

      const deleteResult = await service.deleteTask('T-002');
      expect(deleteResult.isSuccess).toBe(true);
    });
  });
});

