import type { Document, Model } from 'mongoose';
import { Service, Inject } from 'typedi';
import type { ITaskPersistence } from '../dataschema/ITaskPersistence.js';
import type { ITaskRepository } from '../services/IRepos/ITaskRepository.js';
import { TaskMapper } from '../mappers/TaskMapper.js';
import type { Task } from '../domain/Task/Entities/Task.js';

/**
 * Repository implementation for Task aggregate.
 */
@Service()
export default class TaskRepository implements ITaskRepository {
  constructor(
    @Inject('taskModel')
    private readonly taskModel: Model<ITaskPersistence & Document>,

    @Inject('logger')
    private readonly logger: any
  ) {}

  /**
   * Fetch all tasks, sorted by creation date descending.
   */
  public async findAll(): Promise<Task[]> {
    try {
      const docs = await this.taskModel.find({}).sort({ dateCreated: -1 }).lean().exec();
      const mapped = await Promise.all(docs.map((d) => TaskMapper.toDomain(d)));
      return mapped.filter((t): t is Task => t !== null);
    } catch (err) {
      this.logger.error('Error fetching tasks: %o', err);
      return Promise.reject(err);
    }
  }

  /**
   * Find a task by its taskId.
   * @param taskId the unique identifier of the task
   */
  public async findByTaskId(taskId: string): Promise<Task | null> {
    try {
      const doc = await this.taskModel.findOne({ taskId }).lean().exec();
      return TaskMapper.toDomain(doc);
    } catch (err) {
      this.logger.error('Error fetching task %s: %o', taskId, err);
      return Promise.reject(err);
    }
  }

  /**
   * Save a task (insert or update).
   * @param task the task to save
   */
  public async save(task: Task): Promise<Task> {
    try {
      const raw = TaskMapper.toPersistence(task);

      const doc = await this.taskModel
        .findOneAndUpdate(
          { taskId: raw.taskId },
          {
            $set: {
              title: raw.title,
              status: raw.status,
              dateCreated: raw.dateCreated,
            },
            $setOnInsert: { taskId: raw.taskId },
          },
          { upsert: true, new: true }
        )
        .lean()
        .exec();

      const domain = await TaskMapper.toDomain(doc);
      if (!domain) return Promise.reject(new Error('Failed to map persisted task to domain'));
      return domain;
    } catch (err) {
      this.logger.error('Error saving task: %o', err);
      return Promise.reject(err);
    }
  }

  /**
   * Toggle the status of a task by its taskId.
   * @param taskId the unique identifier of the task
   */
  public async toggleStatus(taskId: string): Promise<Task | null> {
    try {
      const current = await this.taskModel.findOne({ taskId }).lean().exec();
      if (!current) return null;

      const updated = await this.taskModel
        .findOneAndUpdate(
          { taskId },
          { $set: { status: !Boolean(current.status) } },
          { new: true }
        )
        .lean()
        .exec();

      return TaskMapper.toDomain(updated);
    } catch (err) {
      this.logger.error('Error toggling status of task %s: %o', taskId, err);
      return Promise.reject(err);
    }
  }

  /**
   * Delete a task by its taskId.
   * @param taskId the unique identifier of the task
   */
  public async delete(taskId: string): Promise<boolean> {
    try {
      const result = await this.taskModel.deleteOne({ taskId }).exec();
      return (result.deletedCount ?? 0) > 0;
    } catch (err) {
      this.logger.error('Error deleting task %s: %o', taskId, err);
      return Promise.reject(err);
    }
  }
}
