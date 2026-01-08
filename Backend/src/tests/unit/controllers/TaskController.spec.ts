import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TaskController from '../../../controllers/TaskController.js';
import type { ITaskService } from '../../../services/IServices/ITaskService.js';
import type { ITaskDTO } from '../../../dto/ITaskDTO.js';
import { Result } from '../../../core/logic/Result.js';
import type { Request, Response, NextFunction } from 'express';

describe('TaskController', () => {
  let taskController: TaskController;
  let mockTaskService: jest.Mocked<ITaskService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  const validTaskDTO: ITaskDTO = {
    id: 'T-001',
    title: 'Test Task',
    status: false,
    dateCreated: '2026-01-08T10:00:00.000Z',
  };

  beforeEach(() => {
    mockTaskService = {
      listTasks: jest.fn(),
      createTask: jest.fn(),
      toggleTaskStatus: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as jest.Mocked<ITaskService>;

    mockRequest = {
      body: {},
      params: {},
    } as Partial<Request>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    } as unknown as Partial<Response>;

    mockNext = jest.fn() as unknown as jest.Mock;

    taskController = new TaskController(mockTaskService);
  });

  describe('list', () => {
    it('should return 200 with tasks array on success', async () => {
      const tasks = [validTaskDTO];
      mockTaskService.listTasks.mockResolvedValue(Result.ok(tasks));

      await taskController.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(tasks);
    });

    it('should return 200 with empty array when no tasks exist', async () => {
      mockTaskService.listTasks.mockResolvedValue(Result.ok([]));

      await taskController.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 with error when service fails', async () => {
      mockTaskService.listTasks.mockResolvedValue(Result.fail('Database error'));

      await taskController.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should call next with error when exception is thrown', async () => {
      const error = new Error('Unexpected error');
      mockTaskService.listTasks.mockRejectedValue(error);

      await taskController.list(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created task on success', async () => {
      mockRequest.body = { title: 'New Task' };
      mockTaskService.createTask.mockResolvedValue(Result.ok(validTaskDTO));

      await taskController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.createTask).toHaveBeenCalledWith('New Task');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(validTaskDTO);
    });

    it('should return 400 when service returns failure', async () => {
      mockRequest.body = { title: '' };
      mockTaskService.createTask.mockResolvedValue(Result.fail('title is required'));

      await taskController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'title is required' });
    });

    it('should handle missing body gracefully', async () => {
      mockRequest.body = undefined;
      mockTaskService.createTask.mockResolvedValue(Result.fail('title must be a string'));

      await taskController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.createTask).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should call next with error when exception is thrown', async () => {
      mockRequest.body = { title: 'New Task' };
      const error = new Error('Unexpected error');
      mockTaskService.createTask.mockRejectedValue(error);

      await taskController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggle', () => {
    it('should return 200 with updated task on success', async () => {
      mockRequest.params = { id: 'T-001' };
      const toggledTask = { ...validTaskDTO, status: true };
      mockTaskService.toggleTaskStatus.mockResolvedValue(Result.ok(toggledTask));

      await taskController.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.toggleTaskStatus).toHaveBeenCalledWith('T-001');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(toggledTask);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await taskController.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'ID is required' });
      expect(mockTaskService.toggleTaskStatus).not.toHaveBeenCalled();
    });

    it('should return 404 when task is not found', async () => {
      mockRequest.params = { id: 'T-999' };
      mockTaskService.toggleTaskStatus.mockResolvedValue(Result.fail('Task not found'));

      await taskController.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.params = { id: 'INVALID' };
      mockTaskService.toggleTaskStatus.mockResolvedValue(Result.fail('Invalid taskId format'));

      await taskController.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid taskId format' });
    });

    it('should call next with error when exception is thrown', async () => {
      mockRequest.params = { id: 'T-001' };
      const error = new Error('Unexpected error');
      mockTaskService.toggleTaskStatus.mockRejectedValue(error);

      await taskController.toggle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 204 on successful deletion', async () => {
      mockRequest.params = { id: 'T-001' };
      mockTaskService.deleteTask.mockResolvedValue(Result.ok(true));

      await taskController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('T-001');
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await taskController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'ID is required' });
      expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
    });

    it('should return 404 when task is not found', async () => {
      mockRequest.params = { id: 'T-999' };
      mockTaskService.deleteTask.mockResolvedValue(Result.fail('Task not found'));

      await taskController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.params = { id: 'INVALID' };
      mockTaskService.deleteTask.mockResolvedValue(Result.fail('Invalid taskId format'));

      await taskController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid taskId format' });
    });

    it('should call next with error when exception is thrown', async () => {
      mockRequest.params = { id: 'T-001' };
      const error = new Error('Unexpected error');
      mockTaskService.deleteTask.mockRejectedValue(error);

      await taskController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

