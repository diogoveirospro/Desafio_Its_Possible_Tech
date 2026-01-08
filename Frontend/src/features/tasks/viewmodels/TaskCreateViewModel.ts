import type { FormEvent } from 'react';
import { useState, useCallback } from 'react';
import type { Task } from '../models/Task';
import { taskService } from '../../../services/TaskService';

interface UseTaskCreateViewModelProps {
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

/**
 * Task Create ViewModel
 * Manages the state and logic for creating a new task
 */
export function useTaskCreateViewModel({ onSuccess, onCancel }: UseTaskCreateViewModelProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate the form
   */
  const validate = useCallback((): boolean => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return false;
    }
    if (title.trim().length > 100) {
      setError('Title must be less than 100 characters');
      return false;
    }
    setError(null);
    return true;
  }, [title]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const newTask = await taskService.create(title.trim());
        setTitle('');
        onSuccess(newTask);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task');
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, validate, onSuccess]
  );

  /**
   * Handle title change
   */
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    if (error) setError(null);
  }, [error]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    setTitle('');
    setError(null);
    onCancel();
  }, [onCancel]);

  /**
   * Check if form is valid
   */
  const isValid = title.trim().length >= 3 && title.trim().length <= 100;

  return {
    // State
    title,
    isSubmitting,
    error,
    isValid,

    // Actions
    handleTitleChange,
    handleSubmit,
    handleCancel,
  };
}

