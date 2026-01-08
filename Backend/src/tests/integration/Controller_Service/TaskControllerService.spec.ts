/**
 * Integration tests for TaskController -> TaskService layer.
 *
 * Tests the controller-service integration without mocking the service,
 * using a mock repository instead.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TaskController from '../../../controllers/TaskController.js';
import TaskService from '../../../services/TaskService.js';
import type { ITaskRepository } from '../../../services/IRepos/ITaskRepository.js';
import type { ITaskDTO } from '../../../dto/ITaskDTO.js';
import type { Request, Response, NextFunction } from 'express';
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

describe('Integration: TaskController -> TaskService', () => {
  let controller: TaskController;
  let service: TaskService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

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

  // Helper to get JSON response from mock
  const getJsonResponse = (): ITaskDTO | ITaskDTO[] | any => {
    const calls = (mockResponse.json as jest.Mock).mock.calls;
    return calls[0]?.[0];
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new TaskService(mockTaskRepo, mockLogger);
    controller = new TaskController(service);

    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      sendStatus: jest.fn().mockReturnThis() as any,
    };

    mockNext = jest.fn();
  });

  describe('list -> listTasks -> repository.findAll', () => {
    it('should return tasks from repository through controller-service chain', async () => {
      const mockTasks = [
        createValidDomainTask('T-001', 'Task 1', false),
        createValidDomainTask('T-002', 'Task 2', true),
      ];
      mockTaskRepo.findAll.mockResolvedValueOnce(mockTasks);

      mockRequest = {};

      await controller.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const response = getJsonResponse() as ITaskDTO[];
      expect(response).toHaveLength(2);
      expect(response[0]!.id).toBe('T-001');
      expect(response[1]!.id).toBe('T-002');
      expect(mockTaskRepo.findAll).toHaveBeenCalled();
    });

    it('should return empty array when repository is empty', async () => {
      mockTaskRepo.findAll.mockResolvedValueOnce([]);

      mockRequest = {};

      await controller.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const response = getJsonResponse() as ITaskDTO[];
      expect(response).toEqual([]);
    });

    it('should return 500 when repository throws error', async () => {
      mockTaskRepo.findAll.mockRejectedValueOnce(new Error('Database error'));

      mockRequest = {};

      await controller.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('create -> createTask -> repository.save', () => {
    it('should create task through controller-service-repository chain', async () => {
      mockTaskRepo.findAll.mockResolvedValueOnce([]); // No existing tasks
      const savedTask = createValidDomainTask('T-001', 'New Task', false);
      mockTaskRepo.save.mockResolvedValueOnce(savedTask);

      mockRequest = { body: { title: 'New Task' } };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      const response = getJsonResponse() as ITaskDTO;
      expect(response.id).toBe('T-001');
      expect(response.title).toBe('New Task');
      expect(response.status).toBe(false);
      expect(mockTaskRepo.save).toHaveBeenCalled();
    });

    it('should generate T-002 when T-001 exists', async () => {
      const existingTask = createValidDomainTask('T-001', 'Existing Task', false);
      mockTaskRepo.findAll.mockResolvedValueOnce([existingTask]);
      const savedTask = createValidDomainTask('T-002', 'Second Task', false);
      mockTaskRepo.save.mockResolvedValueOnce(savedTask);

      mockRequest = { body: { title: 'Second Task' } };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      const response = getJsonResponse() as ITaskDTO;
      expect(response.id).toBe('T-002');
    });

    it('should return 400 when title validation fails', async () => {
      mockRequest = { body: { title: '' } };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const response = getJsonResponse();
      expect(response.error).toBeDefined();
    });

    it('should return 400 when repository save fails', async () => {
      mockTaskRepo.findAll.mockResolvedValueOnce([]);
      mockTaskRepo.save.mockRejectedValueOnce(new Error('Database error'));

      mockRequest = { body: { title: 'New Task' } };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('toggle -> toggleTaskStatus -> repository.toggleStatus', () => {
    it('should toggle task through controller-service-repository chain', async () => {
      const toggledTask = createValidDomainTask('T-001', 'Task', true);
      mockTaskRepo.toggleStatus.mockResolvedValueOnce(toggledTask);

      mockRequest = { params: { id: 'T-001' } };

      await controller.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const response = getJsonResponse() as ITaskDTO;
      expect(response.id).toBe('T-001');
      expect(response.status).toBe(true);
      expect(mockTaskRepo.toggleStatus).toHaveBeenCalledWith('T-001');
    });

    it('should return 404 when task not found in repository', async () => {
      mockTaskRepo.toggleStatus.mockResolvedValueOnce(null);

      mockRequest = { params: { id: 'T-999' } };

      await controller.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest = { params: {} };

      await controller.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const response = getJsonResponse();
      expect(response.error).toBe('ID is required');
    });
  });

  describe('delete -> deleteTask -> repository.delete', () => {
    it('should delete task through controller-service-repository chain', async () => {
      mockTaskRepo.delete.mockResolvedValueOnce(true);

      mockRequest = { params: { id: 'T-001' } };

      await controller.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
      expect(mockTaskRepo.delete).toHaveBeenCalledWith('T-001');
    });

    it('should return 404 when task not found in repository', async () => {
      mockTaskRepo.delete.mockResolvedValueOnce(false);

      mockRequest = { params: { id: 'T-999' } };

      await controller.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest = { params: {} };

      await controller.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const response = getJsonResponse();
      expect(response.error).toBe('ID is required');
    });
  });
});

