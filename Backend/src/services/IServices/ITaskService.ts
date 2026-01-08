import type { ITaskDTO } from '../../dto/ITaskDTO.js';
import type { Result } from '../../core/logic/Result.js';

/**
 * Service interface for Task operations.
 */
export interface ITaskService {
  /**
   * Lists all tasks.
   */
  listTasks(): Promise<Result<ITaskDTO[]>>;

  /**
   * Creates a new task with the given title.
   * @param title - The title of the task.
   */
  createTask(title: string): Promise<Result<ITaskDTO>>;
  /**
   * Toggles the completion status of a task by its ID.
   * @param taskId - The ID of the task to toggle.
   */
  toggleTaskStatus(taskId: string): Promise<Result<ITaskDTO>>;

  /**
   * Deletes a task by its ID.
   * @param taskId - The ID of the task to delete.
   */
  deleteTask(taskId: string): Promise<Result<boolean>>;
}
