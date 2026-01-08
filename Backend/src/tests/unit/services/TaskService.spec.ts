import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TaskService from '../../../services/TaskService.js';
import type { ITaskRepository } from '../../../services/IRepos/ITaskRepository.js';
import { Task } from '../../../domain/Task/Entities/Task.js';
import { TaskID } from '../../../domain/Task/ValueObjects/TaskID.js';
import { TaskTitle } from '../../../domain/Task/ValueObjects/TaskTitle.js';
import { TaskStatus } from '../../../domain/Task/ValueObjects/TaskStatus.js';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepo: jest.Mocked<ITaskRepository>;
  let mockLogger: { silly: jest.Mock; error: jest.Mock };

  const validDate = new Date('2026-01-08T10:00:00Z');

  const createValidTask = (taskId: string, title: string, status = false): Task => {
    return Task.create({
      taskId: TaskID.create(taskId).getValue(),
      title: TaskTitle.create(title).getValue(),
      status: TaskStatus.create(status).getValue(),
      DateCreated: validDate,
    }).getValue();
  };

  beforeEach(() => {
    mockTaskRepo = {
      findAll: jest.fn(),
      findByTaskId: jest.fn(),
      save: jest.fn(),
      toggleStatus: jest.fn(),
      delete: jest.fn(),
    };

    mockLogger = {
      silly: jest.fn(),
      error: jest.fn(),
    };

    taskService = new TaskService(mockTaskRepo, mockLogger);
  });

  describe('listTasks', () => {
    it('should return all tasks as DTOs', async () => {
      const task1 = createValidTask('T-001', 'Task 1');
      const task2 = createValidTask('T-002', 'Task 2', true);
      mockTaskRepo.findAll.mockResolvedValue([task1, task2]);

      const result = await taskService.listTasks();

      expect(result.isSuccess).toBe(true);
      const tasks = result.getValue();
      expect(tasks).toHaveLength(2);
      expect(tasks[0]!.id).toBe('T-001');
      expect(tasks[0]!.title).toBe('Task 1');
      expect(tasks[0]!.status).toBe(false);
      expect(tasks[1]!.id).toBe('T-002');
      expect(tasks[1]!.title).toBe('Task 2');
      expect(tasks[1]!.status).toBe(true);
    });

    it('should return empty array when no tasks exist', async () => {
      mockTaskRepo.findAll.mockResolvedValue([]);

      const result = await taskService.listTasks();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should return failure when repository throws', async () => {
      mockTaskRepo.findAll.mockRejectedValue(new Error('Database error'));

      const result = await taskService.listTasks();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Database error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log when listing tasks', async () => {
      mockTaskRepo.findAll.mockResolvedValue([]);

      await taskService.listTasks();

      expect(mockLogger.silly).toHaveBeenCalledWith('Listing tasks');
    });
  });

  describe('createTask', () => {
    it('should create a task with valid title', async () => {
      mockTaskRepo.findAll.mockResolvedValue([]);
      const savedTask = createValidTask('T-001', 'New Task');
      mockTaskRepo.save.mockResolvedValue(savedTask);

      const result = await taskService.createTask('New Task');

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.id).toBe('T-001');
      expect(dto.title).toBe('New Task');
      expect(dto.status).toBe(false);
    });

    it('should generate T-001 for first task', async () => {
      mockTaskRepo.findAll.mockResolvedValue([]);
      mockTaskRepo.save.mockImplementation(async (task) => task);

      await taskService.createTask('First Task');

      expect(mockTaskRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            taskId: expect.objectContaining({
              _id: expect.objectContaining({ value: 'T-001' }),
            }),
          }),
        })
      );
    });

    it('should generate T-002 when T-001 exists', async () => {
      const existingTask = createValidTask('T-001', 'Existing Task');
      mockTaskRepo.findAll.mockResolvedValue([existingTask]);
      mockTaskRepo.save.mockImplementation(async (task) => task);

      await taskService.createTask('New Task');

      expect(mockTaskRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            taskId: expect.objectContaining({
              _id: expect.objectContaining({ value: 'T-002' }),
            }),
          }),
        })
      );
    });

    it('should fail when title is null', async () => {
      const result = await taskService.createTask(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title');
    });

    it('should fail when title is undefined', async () => {
      const result = await taskService.createTask(undefined as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title');
    });

    it('should fail when title is empty string', async () => {
      const result = await taskService.createTask('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title is required');
    });

    it('should fail when title is only whitespace', async () => {
      const result = await taskService.createTask('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title is required');
    });

    it('should fail when title is not a string', async () => {
      const result = await taskService.createTask(123 as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title must be a string');
    });

    it('should return failure when repository save throws', async () => {
      mockTaskRepo.findAll.mockResolvedValue([]);
      mockTaskRepo.save.mockRejectedValue(new Error('Save failed'));

      const result = await taskService.createTask('New Task');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Save failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log when creating task', async () => {
      mockTaskRepo.findAll.mockResolvedValue([]);
      const savedTask = createValidTask('T-001', 'New Task');
      mockTaskRepo.save.mockResolvedValue(savedTask);

      await taskService.createTask('New Task');

      expect(mockLogger.silly).toHaveBeenCalledWith('Creating task');
    });
  });

  describe('toggleTaskStatus', () => {
    it('should toggle task status successfully', async () => {
      const updatedTask = createValidTask('T-001', 'Task', true);
      mockTaskRepo.toggleStatus.mockResolvedValue(updatedTask);

      const result = await taskService.toggleTaskStatus('T-001');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status).toBe(true);
    });

    it('should call repository with correct taskId', async () => {
      const updatedTask = createValidTask('T-001', 'Task', true);
      mockTaskRepo.toggleStatus.mockResolvedValue(updatedTask);

      await taskService.toggleTaskStatus('T-001');

      expect(mockTaskRepo.toggleStatus).toHaveBeenCalledWith('T-001');
    });

    it('should fail when task is not found', async () => {
      mockTaskRepo.toggleStatus.mockResolvedValue(null);

      const result = await taskService.toggleTaskStatus('T-999');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Task not found');
    });

    it('should fail when taskId is null', async () => {
      const result = await taskService.toggleTaskStatus(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('taskId');
    });

    it('should fail when taskId is empty', async () => {
      const result = await taskService.toggleTaskStatus('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('taskId is required');
    });

    it('should fail when taskId has invalid format', async () => {
      const result = await taskService.toggleTaskStatus('INVALID');

      expect(result.isFailure).toBe(true);
    });

    it('should return failure when repository throws', async () => {
      mockTaskRepo.toggleStatus.mockRejectedValue(new Error('Toggle failed'));

      const result = await taskService.toggleTaskStatus('T-001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Toggle failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log when toggling task status', async () => {
      const updatedTask = createValidTask('T-001', 'Task', true);
      mockTaskRepo.toggleStatus.mockResolvedValue(updatedTask);

      await taskService.toggleTaskStatus('T-001');

      expect(mockLogger.silly).toHaveBeenCalledWith('Toggling task status: %s', 'T-001');
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      mockTaskRepo.delete.mockResolvedValue(true);

      const result = await taskService.deleteTask('T-001');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('should call repository with correct taskId', async () => {
      mockTaskRepo.delete.mockResolvedValue(true);

      await taskService.deleteTask('T-001');

      expect(mockTaskRepo.delete).toHaveBeenCalledWith('T-001');
    });

    it('should fail when task is not found', async () => {
      mockTaskRepo.delete.mockResolvedValue(false);

      const result = await taskService.deleteTask('T-999');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Task not found');
    });

    it('should fail when taskId is null', async () => {
      const result = await taskService.deleteTask(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('taskId');
    });

    it('should fail when taskId is empty', async () => {
      const result = await taskService.deleteTask('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('taskId is required');
    });

    it('should fail when taskId has invalid format', async () => {
      const result = await taskService.deleteTask('INVALID');

      expect(result.isFailure).toBe(true);
    });

    it('should return failure when repository throws', async () => {
      mockTaskRepo.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await taskService.deleteTask('T-001');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Delete failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log when deleting task', async () => {
      mockTaskRepo.delete.mockResolvedValue(true);

      await taskService.deleteTask('T-001');

      expect(mockLogger.silly).toHaveBeenCalledWith('Deleting task: %s', 'T-001');
    });
  });
});

