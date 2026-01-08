import { useState, useCallback, useEffect } from 'react';
import type { Task } from '../models/Task';
import { taskService } from '../../../services/TaskService';

interface UseTaskEditViewModelProps {
  task: Task | null;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

/**
 * Task Edit ViewModel
 * Manages the state and logic for editing a task
 */
export function taskEditViewModel({ task, onSuccess, onCancel }: UseTaskEditViewModelProps) {
  const [status, setStatus] = useState(task?.status ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sync state when task changes
   */
  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setError(null);
    }
  }, [task]);

  /**
   * Toggle status
   */
  const handleToggleStatus = useCallback(async () => {
    if (!task) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedTask = await taskService.toggle(task.id);
      setStatus(updatedTask.status);
      onSuccess(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  }, [task, onSuccess]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    if (task) {
      setStatus(task.status);
    }
    setError(null);
    onCancel();
  }, [task, onCancel]);

  return {
    // State
    status,
    isSubmitting,
    error,

    // Actions
    handleToggleStatus,
    handleCancel,
  };
}

