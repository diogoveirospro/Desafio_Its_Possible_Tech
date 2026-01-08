import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { taskService } from './TaskService';
import type { TaskDTO } from '../features/tasks/dtos/TaskDTO';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('TaskService', () => {
  const mockTaskDTO: TaskDTO = {
    id: 'T-001',
    title: 'Test Task',
    status: false,
    dateCreated: '2024-01-15T10:30:00.000Z',
  };

  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = axios.create() as unknown as typeof mockApi;
  });

  describe('list', () => {
    it('should fetch all tasks and return domain models', async () => {
      const mockDTOs: TaskDTO[] = [
        mockTaskDTO,
        { ...mockTaskDTO, id: 'T-002', title: 'Second Task' },
      ];
      mockApi.get.mockResolvedValue({ data: mockDTOs });

      const result = await taskService.list();

      expect(mockApi.get).toHaveBeenCalledWith('/tasks');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('T-001');
      expect(result[0].dateCreated).toBeInstanceOf(Date);
    });

    it('should return an empty array when no tasks exist', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await taskService.list();

      expect(result).toHaveLength(0);
    });

    it('should throw an error when the request fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Network Error'));

      await expect(taskService.list()).rejects.toThrow('Network Error');
    });
  });

  describe('create', () => {
    it('should create a task and return the domain model', async () => {
      const newTaskDTO: TaskDTO = {
        ...mockTaskDTO,
        title: 'New Task',
      };
      mockApi.post.mockResolvedValue({ data: newTaskDTO });

      const result = await taskService.create('New Task');

      expect(mockApi.post).toHaveBeenCalledWith('/tasks', { title: 'New Task' });
      expect(result.title).toBe('New Task');
      expect(result.dateCreated).toBeInstanceOf(Date);
    });

    it('should trim the title before sending', async () => {
      mockApi.post.mockResolvedValue({ data: mockTaskDTO });

      await taskService.create('  Trimmed Title  ');

      expect(mockApi.post).toHaveBeenCalledWith('/tasks', { title: 'Trimmed Title' });
    });

    it('should throw an error when creation fails', async () => {
      mockApi.post.mockRejectedValue(new Error('Validation Error'));

      await expect(taskService.create('Test')).rejects.toThrow('Validation Error');
    });
  });

  describe('toggle', () => {
    it('should toggle task status and return the updated domain model', async () => {
      const toggledDTO: TaskDTO = { ...mockTaskDTO, status: true };
      mockApi.patch.mockResolvedValue({ data: toggledDTO });

      const result = await taskService.toggle('T-001');

      expect(mockApi.patch).toHaveBeenCalledWith('/tasks/T-001');
      expect(result.status).toBe(true);
    });

    it('should throw an error when toggle fails', async () => {
      mockApi.patch.mockRejectedValue(new Error('Not Found'));

      await expect(taskService.toggle('T-999')).rejects.toThrow('Not Found');
    });
  });

  describe('delete', () => {
    it('should delete a task successfully', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(taskService.delete('T-001')).resolves.toBeUndefined();
      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/T-001');
    });

    it('should throw an error when deletion fails', async () => {
      mockApi.delete.mockRejectedValue(new Error('Not Found'));

      await expect(taskService.delete('T-999')).rejects.toThrow('Not Found');
    });
  });
});

