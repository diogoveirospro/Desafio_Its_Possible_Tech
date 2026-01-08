import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../models/Task';
import { taskService } from '../../../services/TaskService';

/**
 * Task List ViewModel
 * Manages the state and logic for the task list feature
 */
export function taskListViewModel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  /**
   * Fetch all tasks
   */
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.list();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Toggle task status
   */
  const toggleTask = useCallback(async (id: string) => {
    try {
      const updatedTask = await taskService.toggle(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, []);

  /**
   * Delete task
   */
  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, []);

  /**
   * Open create modal
   */
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  /**
   * Close create modal
   */
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  /**
   * Open edit modal
   */
  const openEditModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Close edit modal
   */
  const closeEditModal = useCallback(() => {
    setSelectedTask(null);
    setIsEditModalOpen(false);
  }, []);

  /**
   * Handle task created
   */
  const onTaskCreated = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
    closeCreateModal();
  }, [closeCreateModal]);

  /**
   * Handle task updated
   */
  const onTaskUpdated = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    closeEditModal();
  }, [closeEditModal]);

  return {
    // State
    tasks,
    isLoading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    selectedTask,

    // Actions
    fetchTasks,
    toggleTask,
    deleteTask,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    onTaskCreated,
    onTaskUpdated,
  };
}

