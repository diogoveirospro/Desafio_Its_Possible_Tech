import type { Task } from '../../domain/Task/Entities/Task.js';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findByTaskId(taskId: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  toggleStatus(taskId: string): Promise<Task | null>;
  delete(taskId: string): Promise<boolean>;
}
