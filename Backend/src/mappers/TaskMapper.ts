import {Task} from "../domain/Task/Entities/Task.js";
import {TaskID} from "../domain/Task/ValueObjects/TaskID.js";
import {TaskTitle} from "../domain/Task/ValueObjects/TaskTitle.js";
import {TaskStatus} from "../domain/Task/ValueObjects/TaskStatus.js";
import {UniqueEntityID} from "../core/domain/UniqueEntityID.js";
import type {ITaskDTO} from "../dto/ITaskDTO.js";
import type {ITaskPersistence} from "../dataschema/ITaskPersistence.js";

/**
 * Mapper for Task aggregate.
 * Converts between domain model, persistence model, and DTO.
 */
export class TaskMapper {
  /**
   * Maps a persistence document to a Task domain object.
   * @param raw - The persistence document from the database.
   * @returns The Task domain object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async toDomain(raw: any): Promise<Task | null> {
    if (!raw) return null;

    const taskIdResult = TaskID.create(raw.taskId);
    if (taskIdResult.isFailure) return null;

    const titleResult = TaskTitle.create(raw.title);
    if (titleResult.isFailure) return null;

    const statusResult = TaskStatus.create(raw.status);
    if (statusResult.isFailure) return null;

    const task = Task.create(
      {
        taskId: taskIdResult.getValue(),
        title: titleResult.getValue(),
        status: statusResult.getValue(),
        DateCreated: raw.DateCreated ? new Date(raw.DateCreated) : new Date(),
      },
      raw._id ? new UniqueEntityID(raw._id) : undefined
    );

    if (task.isFailure) {
      console.error('[TaskMapper] Failed to create Task:', task.error);
      return null;
    }

    return task.getValue();
  }

  /**
   * Converts a Task domain object to a persistence format.
   * @param task - The Task domain object.
   * @returns The persistence representation of the Task.
   */
  public static toPersistence(task: Task): ITaskPersistence {
    return {
      domainId : task.id.toString(),
      title: task.title.toString(),
      status: task.status.value,
      dateCreated: task.dateCreated,
    } as ITaskPersistence;
  }

  /**
   * Converts a Task domain object to a Task DTO.
   * @param task - The Task domain object.
   */
  public static toDTO(task: Task): ITaskDTO {
    return {
      id: task.taskId.toString(),
      title: task.title.toString(),
      status: task.status.value,
      dateCreated: task.dateCreated.toISOString(),
    };
  }

  /**
   * Converts a Task DTO to a Task domain object.
   * @param dto - The Task DTO.
   * @param id - Optional unique identifier.
   */
  public toDomainFromDTO(dto: ITaskDTO, id?: string): Task | null {
    if (!dto) return null;

    const taskIdResult = TaskID.create(dto.id);
    if (taskIdResult.isFailure) return null;

    const titleResult = TaskTitle.create(dto.title);
    if (titleResult.isFailure) return null;

    const statusResult = TaskStatus.create(dto.status);
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
      console.error('[TaskMapper] Failed to create Task from DTO:', task.error);
      return null;
    }

    return task.getValue();
  }
}
