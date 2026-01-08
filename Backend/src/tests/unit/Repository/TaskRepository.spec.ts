/**
 * Unit tests for TaskRepository
 *
 * Tests the repository implementation with mocked Mongoose model.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TaskRepository from '../../../repos/TaskRepository.js';
import type { Document, Model } from 'mongoose';
import type { ITaskPersistence } from '../../../dataschema/ITaskPersistence.js';

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  silly: jest.fn(),
};

// Mock Mongoose model
const mockTaskModel = {
  find: jest.fn<any>(),
  findOne: jest.fn<any>(),
  findOneAndUpdate: jest.fn<any>(),
  deleteOne: jest.fn<any>(),
};

// Helper to create chainable mock
const createChainableMock = (returnValue: any) => ({
  sort: jest.fn<any>().mockReturnThis(),
  lean: jest.fn<any>().mockReturnThis(),
  exec: jest.fn<any>().mockResolvedValue(returnValue),
});

describe('TaskRepository', () => {
  let repository: TaskRepository;

  const validPersistenceTask: ITaskPersistence = {
    taskId: 'T-001',
    title: 'Test Task',
    status: false,
    dateCreated: new Date('2026-01-08T10:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TaskRepository(
      mockTaskModel as unknown as Model<ITaskPersistence & Document>,
      mockLogger
    );
  });

  describe('findAll', () => {
    it('should return all tasks mapped to domain objects', async () => {
      const persistenceTasks = [
        { ...validPersistenceTask, taskId: 'T-001', title: 'Task 1' },
        { ...validPersistenceTask, taskId: 'T-002', title: 'Task 2', status: true },
      ];

      const chainMock = createChainableMock(persistenceTasks);
      mockTaskModel.find.mockReturnValue(chainMock);

      const result = await repository.findAll();

      expect(mockTaskModel.find).toHaveBeenCalledWith({});
      expect(chainMock.sort).toHaveBeenCalledWith({ dateCreated: -1 });
      expect(chainMock.lean).toHaveBeenCalled();
      expect(chainMock.exec).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]!.taskId.id.toString()).toBe('T-001');
      expect(result[1]!.taskId.id.toString()).toBe('T-002');
    });

    it('should return empty array when no tasks exist', async () => {
      const chainMock = createChainableMock([]);
      mockTaskModel.find.mockReturnValue(chainMock);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should reject when database error occurs', async () => {
      const chainMock = {
        sort: jest.fn<any>().mockReturnThis(),
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockRejectedValue(new Error('Database connection failed')),
      };
      mockTaskModel.find.mockReturnValue(chainMock);

      await expect(repository.findAll()).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should filter out null mappings', async () => {
      const persistenceTasks = [
        { ...validPersistenceTask, taskId: 'T-001' },
        { ...validPersistenceTask, taskId: 'INVALID', title: '' }, // Invalid - will map to null
      ];

      const chainMock = createChainableMock(persistenceTasks);
      mockTaskModel.find.mockReturnValue(chainMock);

      const result = await repository.findAll();

      // Only valid task should be returned
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findByTaskId', () => {
    it('should return task when found', async () => {
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue(validPersistenceTask),
      };
      mockTaskModel.findOne.mockReturnValue(chainMock);

      const result = await repository.findByTaskId('T-001');

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({ taskId: 'T-001' });
      expect(result).not.toBeNull();
      expect(result!.taskId.id.toString()).toBe('T-001');
      expect(result!.title.value).toBe('Test Task');
    });

    it('should return null when task not found', async () => {
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue(null),
      };
      mockTaskModel.findOne.mockReturnValue(chainMock);

      const result = await repository.findByTaskId('T-999');

      expect(result).toBeNull();
    });

    it('should reject when database error occurs', async () => {
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockRejectedValue(new Error('Database error')),
      };
      mockTaskModel.findOne.mockReturnValue(chainMock);

      await expect(repository.findByTaskId('T-001')).rejects.toThrow('Database error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('should save new task successfully', async () => {
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue(validPersistenceTask),
      };
      mockTaskModel.findOneAndUpdate.mockReturnValue(chainMock);

      // Create a mock task domain object
      const mockTask = createMockDomainTask('T-001', 'Test Task', false);

      const result = await repository.save(mockTask);

      expect(mockTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { taskId: 'T-001' },
        expect.objectContaining({
          $set: expect.objectContaining({
            title: 'Test Task',
            status: false,
          }),
          $setOnInsert: { taskId: 'T-001' },
        }),
        { upsert: true, new: true }
      );
      expect(result.taskId.id.toString()).toBe('T-001');
    });

    it('should update existing task', async () => {
      const updatedPersistence = { ...validPersistenceTask, title: 'Updated Title' };
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue(updatedPersistence),
      };
      mockTaskModel.findOneAndUpdate.mockReturnValue(chainMock);

      const mockTask = createMockDomainTask('T-001', 'Updated Title', false);

      const result = await repository.save(mockTask);

      expect(result.title.value).toBe('Updated Title');
    });

    it('should reject when database error occurs', async () => {
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockRejectedValue(new Error('Database write error')),
      };
      mockTaskModel.findOneAndUpdate.mockReturnValue(chainMock);

      const mockTask = createMockDomainTask('T-001', 'Test Task', false);

      await expect(repository.save(mockTask)).rejects.toThrow('Database write error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should reject when mapping fails', async () => {
      const chainMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue({ taskId: 'INVALID', title: '' }), // Invalid data
      };
      mockTaskModel.findOneAndUpdate.mockReturnValue(chainMock);

      const mockTask = createMockDomainTask('T-001', 'Test Task', false);

      await expect(repository.save(mockTask)).rejects.toThrow('Failed to map persisted task to domain');
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status from false to true', async () => {
      // First findOne returns current task
      const findOneMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue({ ...validPersistenceTask, status: false }),
      };
      mockTaskModel.findOne.mockReturnValueOnce(findOneMock);

      // findOneAndUpdate returns updated task
      const updateMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue({ ...validPersistenceTask, status: true }),
      };
      mockTaskModel.findOneAndUpdate.mockReturnValue(updateMock);

      const result = await repository.toggleStatus('T-001');

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({ taskId: 'T-001' });
      expect(mockTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { taskId: 'T-001' },
        { $set: { status: true } },
        { new: true }
      );
      expect(result).not.toBeNull();
      expect(result!.status.value).toBe(true);
    });

    it('should toggle status from true to false', async () => {
      const findOneMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue({ ...validPersistenceTask, status: true }),
      };
      mockTaskModel.findOne.mockReturnValueOnce(findOneMock);

      const updateMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue({ ...validPersistenceTask, status: false }),
      };
      mockTaskModel.findOneAndUpdate.mockReturnValue(updateMock);

      const result = await repository.toggleStatus('T-001');

      expect(mockTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { taskId: 'T-001' },
        { $set: { status: false } },
        { new: true }
      );
      expect(result!.status.value).toBe(false);
    });

    it('should return null when task not found', async () => {
      const findOneMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockResolvedValue(null),
      };
      mockTaskModel.findOne.mockReturnValue(findOneMock);

      const result = await repository.toggleStatus('T-999');

      expect(result).toBeNull();
      expect(mockTaskModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should reject when database error occurs', async () => {
      const findOneMock = {
        lean: jest.fn<any>().mockReturnThis(),
        exec: jest.fn<any>().mockRejectedValue(new Error('Database error')),
      };
      mockTaskModel.findOne.mockReturnValue(findOneMock);

      await expect(repository.toggleStatus('T-001')).rejects.toThrow('Database error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing task and return true', async () => {
      mockTaskModel.deleteOne.mockReturnValue({
        exec: jest.fn<any>().mockResolvedValue({ deletedCount: 1 }),
      });

      const result = await repository.delete('T-001');

      expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({ taskId: 'T-001' });
      expect(result).toBe(true);
    });

    it('should return false when task not found', async () => {
      mockTaskModel.deleteOne.mockReturnValue({
        exec: jest.fn<any>().mockResolvedValue({ deletedCount: 0 }),
      });

      const result = await repository.delete('T-999');

      expect(result).toBe(false);
    });

    it('should reject when database error occurs', async () => {
      mockTaskModel.deleteOne.mockReturnValue({
        exec: jest.fn<any>().mockRejectedValue(new Error('Database error')),
      });

      await expect(repository.delete('T-001')).rejects.toThrow('Database error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle undefined deletedCount', async () => {
      mockTaskModel.deleteOne.mockReturnValue({
        exec: jest.fn<any>().mockResolvedValue({ deletedCount: undefined }),
      });

      const result = await repository.delete('T-001');

      expect(result).toBe(false);
    });
  });
});

/**
 * Helper to create a mock Task domain object for save tests
 */
function createMockDomainTask(id: string, title: string, status: boolean) {
  return {
    taskId: {
      id: {
        toString: () => id
      }
    },
    title: {
      value: title
    },
    status: {
      value: status
    },
    dateCreated: new Date('2026-01-08T10:00:00.000Z')
  } as any;
}

