import { Service, Inject } from 'typedi';
import type { ITaskService } from './IServices/ITaskService.js';
import type { ITaskRepository } from './IRepos/ITaskRepository.js';
import { Task } from '../domain/Task/Entities/Task.js';
import { TaskTitle } from '../domain/Task/ValueObjects/TaskTitle.js';
import { TaskID } from '../domain/Task/ValueObjects/TaskID.js';
import { TaskMapper } from '../mappers/TaskMapper.js';
import { generateFirstId, generateNextId, extractSequenceNumber } from '../utils/IdGenerator.js';
import { Result } from '../core/logic/Result.js';
import type { ITaskDTO } from '../dto/ITaskDTO.js';

function toMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Service implementation for Task operations.
 */
@Service()
export default class TaskService implements ITaskService {
  constructor(
    @Inject('taskRepository')
    private readonly taskRepo: ITaskRepository,
    @Inject('logger')
    private readonly logger: any
  ) {}

  /**
   * Validates the task title.
   * @param title - The title to validate.
   * @private
   */
  private validateTitle(title: unknown): Result<void> {
    if (typeof title !== 'string') return Result.fail<void>('title must be a string');
    if (title.trim().length === 0) return Result.fail<void>('title is required');

    const titleOrError = TaskTitle.create(title);
    if (titleOrError.isFailure) {
      return Result.fail<void>(toMessage(titleOrError.errorValue()));
    }

    return Result.ok<void>();
  }

  /**
   * Validates the task ID.
   * @param taskId - The task ID to validate.
   * @private
   */
  private validateTaskId(taskId: unknown): Result<void> {
    if (typeof taskId !== 'string') return Result.fail<void>('taskId must be a string');
    if (taskId.trim().length === 0) return Result.fail<void>('taskId is required');

    const idCheck = TaskID.create(taskId);
    if (idCheck.isFailure) return Result.fail<void>(toMessage(idCheck.errorValue()));

    return Result.ok<void>();
  }

  /**
   * Generates a new unique task ID.
   * @private
   */
  private async generateTaskId(): Promise<string> {
    const all = await this.taskRepo.findAll();
    const maxSeq = all
      .map((t) => extractSequenceNumber(t.taskId.id.toString()))
      .filter((n): n is number => n !== null)
      .reduce((acc, n) => Math.max(acc, n), 0);

    if (maxSeq === 0) return generateFirstId();
    return generateNextId(maxSeq);
  }

  /**
   * Lists all tasks.
   */
  async listTasks(): Promise<Result<ITaskDTO[]>> {
    try {
      this.logger.silly('Listing tasks');
      const tasks = await this.taskRepo.findAll();
      return Result.ok(tasks.map((t) => TaskMapper.toDTO(t)));
    } catch (e) {
      this.logger.error('Error listing tasks: %o', e);
      return Result.fail<ITaskDTO[]>(e instanceof Error ? e.message : 'Error listing tasks');
    }
  }

  /**
   * Creates a new task with the given title.
   * @param title - The title of the task.
   */
  async createTask(title: string): Promise<Result<ITaskDTO>> {
    try {
      this.logger.silly('Creating task');

      const validation = this.validateTitle(title);
      if (validation.isFailure) return Result.fail<ITaskDTO>(validation.error);

      const titleOrError = TaskTitle.create(title);
      if (titleOrError.isFailure) {
        return Result.fail<ITaskDTO>(toMessage(titleOrError.errorValue()));
      }

      const newId = await this.generateTaskId();
      const taskIdOrError = TaskID.create(newId);
      if (taskIdOrError.isFailure) {
        return Result.fail<ITaskDTO>(toMessage(taskIdOrError.errorValue()));
      }

      const taskOrError = Task.create({
        taskId: taskIdOrError.getValue(),
        title: titleOrError.getValue(),
        DateCreated: new Date(),
      });

      if (taskOrError.isFailure) {
        return Result.fail<ITaskDTO>(toMessage(taskOrError.errorValue()));
      }

      const saved = await this.taskRepo.save(taskOrError.getValue());
      this.logger.silly('Task created successfully: %s', saved.taskId.id.toString());
      return Result.ok(TaskMapper.toDTO(saved));
    } catch (e) {
      this.logger.error('Error creating task: %o', e);
      return Result.fail<ITaskDTO>(e instanceof Error ? e.message : 'Error creating task');
    }
  }

  /**
   * Toggles the completion status of a task by its ID.
   * @param taskId - The ID of the task to toggle.
   */
  async toggleTaskStatus(taskId: string): Promise<Result<ITaskDTO>> {
    try {
      this.logger.silly('Toggling task status: %s', taskId);

      const validation = this.validateTaskId(taskId);
      if (validation.isFailure) return Result.fail<ITaskDTO>(validation.error);

      const updated = await this.taskRepo.toggleStatus(taskId);
      if (!updated) return Result.fail<ITaskDTO>('Task not found');

      return Result.ok(TaskMapper.toDTO(updated));
    } catch (e) {
      this.logger.error('Error toggling task status %s: %o', taskId, e);
      return Result.fail<ITaskDTO>(e instanceof Error ? e.message : 'Error toggling task status');
    }
  }

  /**
   * Deletes a task by its ID.
   * @param taskId - The ID of the task to delete.
   */
  async deleteTask(taskId: string): Promise<Result<boolean>> {
    try {
      this.logger.silly('Deleting task: %s', taskId);

      const validation = this.validateTaskId(taskId);
      if (validation.isFailure) return Result.fail<boolean>(validation.error);

      const deleted = await this.taskRepo.delete(taskId);
      if (!deleted) return Result.fail<boolean>('Task not found');

      return Result.ok(true);
    } catch (e) {
      this.logger.error('Error deleting task %s: %o', taskId, e);
      return Result.fail<boolean>(e instanceof Error ? e.message : 'Error deleting task');
    }
  }
}
