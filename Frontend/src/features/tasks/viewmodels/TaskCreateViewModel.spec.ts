import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskCreateViewModel } from './TaskCreateViewModel';
import { taskService } from '../../../services/TaskService';
import type { Task } from '../models/Task';

// Mock the taskService
vi.mock('../../../services/TaskService', () => ({
  taskService: {
    create: vi.fn(),
  },
}));

describe('useTaskCreateViewModel', () => {
  const mockTask: Task = {
    id: 'T-001',
    title: 'New Task',
    status: false,
    dateCreated: new Date('2024-01-15T10:30:00.000Z'),
  };

  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty title and no error', () => {
    const { result } = renderHook(() =>
      useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
    );

    expect(result.current.title).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  describe('handleTitleChange', () => {
    it('should update the title', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('New Title');
      });

      expect(result.current.title).toBe('New Title');
    });

    it('should clear error when title changes', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      // Trigger validation error by submitting empty form
      act(() => {
        result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.error).not.toBeNull();

      // Change title should clear error
      act(() => {
        result.current.handleTitleChange('New Title');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('isValid', () => {
    it('should be false when title is empty', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      expect(result.current.isValid).toBe(false);
    });

    it('should be false when title is less than 3 characters', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('ab');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should be true when title is 3 or more characters', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('abc');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should be false when title exceeds 100 characters', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('a'.repeat(101));
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    it('should show error when title is empty', async () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.error).toBe('Title is required');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should show error when title is too short', async () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('ab');
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.error).toBe('Title must be at least 3 characters');
    });

    it('should show error when title is too long', async () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('a'.repeat(101));
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.error).toBe('Title must be less than 100 characters');
    });

    it('should create task and call onSuccess when valid', async () => {
      vi.mocked(taskService.create).mockResolvedValue(mockTask);

      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('New Task');
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      await waitFor(() => {
        expect(taskService.create).toHaveBeenCalledWith('New Task');
        expect(mockOnSuccess).toHaveBeenCalledWith(mockTask);
        expect(result.current.title).toBe('');
      });
    });

    it('should show error when creation fails', async () => {
      vi.mocked(taskService.create).mockRejectedValue(new Error('Server Error'));

      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('New Task');
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Server Error');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should set isSubmitting during submission', async () => {
      let resolvePromise: (value: Task) => void;
      const promise = new Promise<Task>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(taskService.create).mockReturnValue(promise);

      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('New Task');
      });

      act(() => {
        result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolvePromise!(mockTask);
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('handleCancel', () => {
    it('should reset form and call onCancel', () => {
      const { result } = renderHook(() =>
        useTaskCreateViewModel({ onSuccess: mockOnSuccess, onCancel: mockOnCancel })
      );

      act(() => {
        result.current.handleTitleChange('Some Title');
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.title).toBe('');
      expect(result.current.error).toBeNull();
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});

