import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { taskListViewModel } from './TaskListViewModel';
import { taskService } from '../../../services/TaskService';
import type { Task } from '../models/Task';

// Mock the taskService
vi.mock('../../../services/TaskService', () => ({
  taskService: {
    list: vi.fn(),
    toggle: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('taskListViewModel', () => {
  const mockTasks: Task[] = [
    {
      id: 'T-001',
      title: 'First Task',
      status: false,
      dateCreated: new Date('2024-01-15T10:30:00.000Z'),
    },
    {
      id: 'T-002',
      title: 'Second Task',
      status: true,
      dateCreated: new Date('2024-01-16T10:30:00.000Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(taskService.list).mockResolvedValue(mockTasks);
  });

  describe('initialization', () => {
    it('should fetch tasks on mount', async () => {
      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(taskService.list).toHaveBeenCalled();
        expect(result.current.tasks).toEqual(mockTasks);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: Task[]) => void;
      const promise = new Promise<Task[]>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(taskService.list).mockReturnValue(promise);

      const { result } = renderHook(() => taskListViewModel());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockTasks);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set error when fetching fails', async () => {
      vi.mocked(taskService.list).mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('toggleTask', () => {
    it('should toggle task status and update the list', async () => {
      const toggledTask: Task = { ...mockTasks[0], status: true };
      vi.mocked(taskService.toggle).mockResolvedValue(toggledTask);

      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      await act(async () => {
        await result.current.toggleTask('T-001');
      });

      await waitFor(() => {
        expect(taskService.toggle).toHaveBeenCalledWith('T-001');
        expect(result.current.tasks[0].status).toBe(true);
      });
    });

    it('should set error when toggle fails', async () => {
      vi.mocked(taskService.toggle).mockRejectedValue(new Error('Toggle Error'));

      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      await act(async () => {
        await result.current.toggleTask('T-001');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Toggle Error');
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete task and remove from list', async () => {
      vi.mocked(taskService.delete).mockResolvedValue();

      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteTask('T-001');
      });

      await waitFor(() => {
        expect(taskService.delete).toHaveBeenCalledWith('T-001');
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].id).toBe('T-002');
      });
    });

    it('should set error when delete fails', async () => {
      vi.mocked(taskService.delete).mockRejectedValue(new Error('Delete Error'));

      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteTask('T-001');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Delete Error');
      });
    });
  });

  describe('modal states', () => {
    it('should open and close create modal', async () => {
      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreateModalOpen).toBe(false);

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.isCreateModalOpen).toBe(true);

      act(() => {
        result.current.closeCreateModal();
      });

      expect(result.current.isCreateModalOpen).toBe(false);
    });

    it('should open and close edit modal', async () => {
      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.selectedTask).toBeNull();

      act(() => {
        result.current.openEditModal(mockTasks[0]);
      });

      expect(result.current.isEditModalOpen).toBe(true);
      expect(result.current.selectedTask).toEqual(mockTasks[0]);

      act(() => {
        result.current.closeEditModal();
      });

      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.selectedTask).toBeNull();
    });
  });

  describe('onTaskCreated', () => {
    it('should add new task to the beginning of the list and close modal', async () => {
      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      act(() => {
        result.current.openCreateModal();
      });

      const newTask: Task = {
        id: 'T-003',
        title: 'New Task',
        status: false,
        dateCreated: new Date(),
      };

      act(() => {
        result.current.onTaskCreated(newTask);
      });

      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks[0]).toEqual(newTask);
      expect(result.current.isCreateModalOpen).toBe(false);
    });
  });

  describe('onTaskUpdated', () => {
    it('should update task in the list and close modal', async () => {
      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      act(() => {
        result.current.openEditModal(mockTasks[0]);
      });

      const updatedTask: Task = {
        ...mockTasks[0],
        title: 'Updated Title',
        status: true,
      };

      act(() => {
        result.current.onTaskUpdated(updatedTask);
      });

      expect(result.current.tasks[0]).toEqual(updatedTask);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.selectedTask).toBeNull();
    });
  });

  describe('fetchTasks', () => {
    it('should refetch tasks when called', async () => {
      const { result } = renderHook(() => taskListViewModel());

      await waitFor(() => {
        expect(taskService.list).toHaveBeenCalledTimes(1);
      });

      const newTasks: Task[] = [
        ...mockTasks,
        { id: 'T-003', title: 'Third Task', status: false, dateCreated: new Date() },
      ];
      vi.mocked(taskService.list).mockResolvedValue(newTasks);

      await act(async () => {
        await result.current.fetchTasks();
      });

      await waitFor(() => {
        expect(taskService.list).toHaveBeenCalledTimes(2);
        expect(result.current.tasks).toHaveLength(3);
      });
    });
  });
});

