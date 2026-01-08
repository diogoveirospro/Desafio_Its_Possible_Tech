/**
 * Task DTO - Data Transfer Object
 * Mirrors the backend ITaskDTO interface
 */
export interface TaskDTO {
  /** Domain ID (e.g., T-001) */
  id: string;
  /** Title of the Task */
  title: string;
  /** Status of the Task */
  status: boolean;
  /** ISO string representing the task creation date */
  dateCreated: string;
}

/**
 * Create Task Request
 */
export interface CreateTaskRequest {
  title: string;
}

/**
 * Update Task Request
 */
export interface UpdateTaskRequest {
  title?: string;
  status?: boolean;
}

