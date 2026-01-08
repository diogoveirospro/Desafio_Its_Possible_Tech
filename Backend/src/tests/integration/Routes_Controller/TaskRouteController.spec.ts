/**
 * Integration tests for Task Routes
 *
 * Tests the Task endpoints:
 * - GET /api/tasks (list all)
 * - POST /api/tasks (create)
 * - PATCH /api/tasks/:id (toggle status)
 * - DELETE /api/tasks/:id (delete)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as express from 'express';
import type { Application } from 'express';
import * as request from 'supertest';
import { Container } from 'typedi';

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  silly: jest.fn(),
};

jest.mock('../../../loaders/logger.js', () => ({
  default: mockLogger
}));

// Mock TaskService
const mockTaskService = {
  listTasks: jest.fn<any>(),
  createTask: jest.fn<any>(),
  toggleTaskStatus: jest.fn<any>(),
  deleteTask: jest.fn<any>(),
};

import taskRoute from '../../../api/routes/taskRoute.js';
import TaskController from '../../../controllers/TaskController.js';

describe('Task Routes Integration', () => {
  let app: Application;

  const validInputDTO = {
    title: 'Buy groceries'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset Container and register mock service
    Container.reset();
    Container.set('taskService', mockTaskService);
    Container.set('logger', mockLogger);

    // Create fresh controller with mocked service
    const controller = new TaskController(mockTaskService as any);
    Container.set(TaskController, controller);

    app = (express as any).default();
    app.use((express as any).default.json());

    const router = (express as any).default.Router();
    taskRoute(router);
    app.use('/api', router);
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const tasks = [
        {
          id: 'T-001',
          title: 'Task 1',
          status: false,
          dateCreated: '2026-01-08T10:00:00.000Z'
        },
        {
          id: 'T-002',
          title: 'Task 2',
          status: true,
          dateCreated: '2026-01-08T11:00:00.000Z'
        }
      ];

      mockTaskService.listTasks.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => tasks,
        error: ''
      });

      const response = await (request as any).default(app)
        .get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('T-001');
      expect(response.body[1].id).toBe('T-002');
    });

    it('should return empty array when no tasks exist', async () => {
      mockTaskService.listTasks.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => [],
        error: ''
      });

      const response = await (request as any).default(app)
        .get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 500 when service fails', async () => {
      mockTaskService.listTasks.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'Database connection failed',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/tasks', () => {
    it('should create task successfully', async () => {
      const created = {
        id: 'T-001',
        title: 'Buy groceries',
        status: false,
        dateCreated: '2026-01-08T10:00:00.000Z'
      };

      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => created,
        error: ''
      });

      const response = await (request as any).default(app)
        .post('/api/tasks')
        .send(validInputDTO);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(created);
      expect(mockTaskService.createTask).toHaveBeenCalledWith('Buy groceries');
    });

    it('should return 400 when title is missing', async () => {
      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'title must be a string',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .post('/api/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when title is empty', async () => {
      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'title is required',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .post('/api/tasks')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('title');
    });

    it('should return 400 when title is only whitespace', async () => {
      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'title is required',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .post('/api/tasks')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
    });

    it('should generate sequential task IDs', async () => {
      const created = {
        id: 'T-002',
        title: 'Second Task',
        status: false,
        dateCreated: '2026-01-08T10:00:00.000Z'
      };

      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => created,
        error: ''
      });

      const response = await (request as any).default(app)
        .post('/api/tasks')
        .send({ title: 'Second Task' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('T-002');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should toggle task status from false to true', async () => {
      const toggled = {
        id: 'T-001',
        title: 'Task 1',
        status: true,
        dateCreated: '2026-01-08T10:00:00.000Z'
      };

      mockTaskService.toggleTaskStatus.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => toggled,
        error: ''
      });

      const response = await (request as any).default(app)
        .patch('/api/tasks/T-001');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('T-001');
      expect(response.body.status).toBe(true);
      expect(mockTaskService.toggleTaskStatus).toHaveBeenCalledWith('T-001');
    });

    it('should toggle task status from true to false', async () => {
      const toggled = {
        id: 'T-001',
        title: 'Task 1',
        status: false,
        dateCreated: '2026-01-08T10:00:00.000Z'
      };

      mockTaskService.toggleTaskStatus.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => toggled,
        error: ''
      });

      const response = await (request as any).default(app)
        .patch('/api/tasks/T-001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(false);
    });

    it('should return 404 when task not found', async () => {
      mockTaskService.toggleTaskStatus.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'Task not found',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .patch('/api/tasks/T-999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 when task ID format is invalid', async () => {
      mockTaskService.toggleTaskStatus.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'taskId must match pattern T-INC###',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .patch('/api/tasks/INVALID');

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task successfully', async () => {
      mockTaskService.deleteTask.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => true,
        error: ''
      });

      const response = await (request as any).default(app)
        .delete('/api/tasks/T-001');

      expect(response.status).toBe(204);
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('T-001');
    });

    it('should return 404 when task not found', async () => {
      mockTaskService.deleteTask.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'Task not found',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .delete('/api/tasks/T-999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 when task ID format is invalid', async () => {
      mockTaskService.deleteTask.mockResolvedValueOnce({
        isFailure: true,
        isSuccess: false,
        error: 'taskId must match pattern T-INC###',
        getValue: () => { throw new Error('No value'); }
      });

      const response = await (request as any).default(app)
        .delete('/api/tasks/INVALID');

      expect(response.status).toBe(400);
    });
  });

  describe('Complete Task Workflow', () => {
    it('should handle full task lifecycle via HTTP', async () => {
      // Step 1: List tasks (empty)
      mockTaskService.listTasks.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => [],
        error: ''
      });

      let response = await (request as any).default(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);

      // Step 2: Create first task
      const task1 = {
        id: 'T-001',
        title: 'Buy groceries',
        status: false,
        dateCreated: '2026-01-08T10:00:00.000Z'
      };

      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => task1,
        error: ''
      });

      response = await (request as any).default(app)
        .post('/api/tasks')
        .send({ title: 'Buy groceries' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('T-001');

      // Step 3: Create second task
      const task2 = {
        id: 'T-002',
        title: 'Clean house',
        status: false,
        dateCreated: '2026-01-08T11:00:00.000Z'
      };

      mockTaskService.createTask.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => task2,
        error: ''
      });

      response = await (request as any).default(app)
        .post('/api/tasks')
        .send({ title: 'Clean house' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('T-002');

      // Step 4: List tasks (should have 2)
      mockTaskService.listTasks.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => [task1, task2],
        error: ''
      });

      response = await (request as any).default(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      // Step 5: Toggle first task to completed
      const toggledTask1 = { ...task1, status: true };

      mockTaskService.toggleTaskStatus.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => toggledTask1,
        error: ''
      });

      response = await (request as any).default(app).patch('/api/tasks/T-001');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);

      // Step 6: Delete second task
      mockTaskService.deleteTask.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => true,
        error: ''
      });

      response = await (request as any).default(app).delete('/api/tasks/T-002');
      expect(response.status).toBe(204);

      // Step 7: List tasks (should have 1)
      mockTaskService.listTasks.mockResolvedValueOnce({
        isFailure: false,
        isSuccess: true,
        getValue: () => [toggledTask1],
        error: ''
      });

      response = await (request as any).default(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('T-001');
      expect(response.body[0].status).toBe(true);
    });
  });
});

