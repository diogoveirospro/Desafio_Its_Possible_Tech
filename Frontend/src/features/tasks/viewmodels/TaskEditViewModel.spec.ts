import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { taskEditViewModel } from './TaskEditViewModel';
import { taskService } from '../../../services/TaskService';
import type { Task } from '../models/Task';

// Mock the taskService
vi.mock('../../../services/TaskService', () => ({
  taskService: {
    toggle: vi.fn(),
  },
}));

describe('taskEditViewModel', () => {
  const mockTask: Task = {
    id: 'T-001',
    title: 'Test Task',
    status: false,
    dateCreated: new Date('2024-01-15T10:30:00.000Z'),
  };

  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with task status', () => {
    const { result } = renderHook(() =>
      taskEditViewModel({ task: mockTask, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
    );

    expect(result.current.status).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should initialize with false status when task is null', () => {
    const { result } = renderHook(() =>
      taskEditViewModel({ task: null, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
    );

    expect(result.current.status).toBe(false);
  });

  it('should update status when task changes', () => {
    const { result, rerender } = renderHook(
      ({ task }) => taskEditViewModel({ task, onSuccess: mockOnSuccess, onCancel: mockOnCancel }),
      { initialProps: { task: mockTask } }
    );

    expect(result.current.status).toBe(false);

    const completedTask: Task = { ...mockTask, status: true };
    rerender({ task: completedTask });

    expect(result.current.status).toBe(true);
  });

  describe('handleToggleStatus', () => {
    it('should do nothing when task is null', async () => {
      const { result } = renderHook(() =>
        taskEditViewModel({ task: null, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      await act(async () => {
        await result.current.handleToggleStatus();
      });

      expect(taskService.toggle).not.toHaveBeenCalled();
    });

    it('should toggle status and call onSuccess', async () => {
      const toggledTask: Task = { ...mockTask, status: true };
      vi.mocked(taskService.toggle).mockResolvedValue(toggledTask);

      const { result } = renderHook(() =>
        taskEditViewModel({ task: mockTask, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      await act(async () => {
        await result.current.handleToggleStatus();
      });

      await waitFor(() => {
        expect(taskService.toggle).toHaveBeenCalledWith('T-001');
        expect(result.current.status).toBe(true);
        expect(mockOnSuccess).toHaveBeenCalledWith(toggledTask);
      });
    });

    it('should show error when toggle fails', async () => {
      vi.mocked(taskService.toggle).mockRejectedValue(new Error('Server Error'));

      const { result } = renderHook(() =>
        taskEditViewModel({ task: mockTask, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      await act(async () => {
        await result.current.handleToggleStatus();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Server Error');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should set isSubmitting during toggle', async () => {
      let resolvePromise: (value: Task) => void;
      const promise = new Promise<Task>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(taskService.toggle).mockReturnValue(promise);

      const { result } = renderHook(() =>
        taskEditViewModel({ task: mockTask, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleToggleStatus();
      });

      expect(result.current.isSubmitting).toBe(true);

      const toggledTask: Task = { ...mockTask, status: true };
      await act(async () => {
        resolvePromise!(toggledTask);
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('handleCancel', () => {
    it('should reset status to task status and call onCancel', () => {
      const { result } = renderHook(() =>
        taskEditViewModel({ task: mockTask, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.status).toBe(mockTask.status);
      expect(result.current.error).toBeNull();
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should handle cancel when task is null', () => {
      const { result } = renderHook(() =>
        taskEditViewModel({ task: null, onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleCancel();
      });

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});

