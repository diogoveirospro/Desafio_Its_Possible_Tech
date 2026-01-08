import { Task } from '../domain/Task/Entities/Task.js';
import { TaskID } from '../domain/Task/ValueObjects/TaskID.js';
import { TaskTitle } from '../domain/Task/ValueObjects/TaskTitle.js';
import { TaskStatus } from '../domain/Task/ValueObjects/TaskStatus.js';
import { UniqueEntityID } from '../core/domain/UniqueEntityID.js';
import type { ITaskDTO } from '../dto/ITaskDTO.js';
import type { ITaskPersistence } from '../dataschema/ITaskPersistence.js';

/**
 * Mapper for Task aggregate.
 * Converts between domain model, persistence model, and DTO.
 */
export class TaskMapper {
  /**
   * Maps a persistence document to a Task domain object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async toDomain(raw: any): Promise<Task | null> {
    if (!raw) return null;

    const taskIdResult = TaskID.create(raw.taskId);
    if (taskIdResult.isFailure) return null;

    const titleResult = TaskTitle.create(raw.title);
    if (titleResult.isFailure) return null;

    const statusResult = TaskStatus.create(Boolean(raw.status));
    if (statusResult.isFailure) return null;

    const dateCreatedRaw = raw.dateCreated ?? raw.DateCreated;
    const dateCreated = dateCreatedRaw ? new Date(dateCreatedRaw) : new Date();

    const task = Task.create(
      {
        taskId: taskIdResult.getValue(),
        title: titleResult.getValue(),
        status: statusResult.getValue(),
        DateCreated: dateCreated,
      },
      raw._id ? new UniqueEntityID(raw._id) : undefined
    );

    if (task.isFailure) {
      // keep mapper side-effect minimal
      return null;
    }

    return task.getValue();
  }

  /**
   * Converts a Task domain object to a persistence format.
   */
  public static toPersistence(task: Task): ITaskPersistence {
    return {
      taskId: task.taskId.id.toString(),
      title: task.title.value,
      status: task.status.value,
      dateCreated: task.dateCreated,
    };
  }

  /**
   * Converts a Task domain object to a Task DTO.
   */
  public static toDTO(task: Task): ITaskDTO {
    return {
      id: task.taskId.id.toString(),
      title: task.title.value,
      status: task.status.value,
      dateCreated: task.dateCreated.toISOString(),
    };
  }

  /**
   * Converts a Task DTO to a Task domain object.
   */
  public toDomainFromDTO(dto: ITaskDTO, id?: string): Task | null {
    if (!dto) return null;

    const taskIdResult = TaskID.create(dto.id);
    if (taskIdResult.isFailure) return null;

    const titleResult = TaskTitle.create(dto.title);
    if (titleResult.isFailure) return null;

    const statusResult = TaskStatus.create(Boolean(dto.status));
    if (statusResult.isFailure) return null;

    const task = Task.create(
      {
        taskId: taskIdResult.getValue(),
        title: titleResult.getValue(),
        status: statusResult.getValue(),
        DateCreated: dto.dateCreated ? new Date(dto.dateCreated) : new Date(),
      },
      id ? new UniqueEntityID(id) : undefined
    );

    if (task.isFailure) {
      return null;
    }

    return task.getValue();
  }
}
