import type { Task } from '../models/Task';
import type { TaskDTO, CreateTaskRequest } from '../dtos/TaskDTO';

/**
 * Task Mapper
 * Converts between TaskDTO (API) and Task (Domain Model)
 */
export const TaskMapper = {
  /**
   * Convert a TaskDTO to a Task domain model
   * @param dto - The TaskDTO from the API
   * @returns Task domain model
   */
  toDomain(dto: TaskDTO): Task {
    return {
      id: dto.id,
      title: dto.title,
      status: dto.status,
      dateCreated: new Date(dto.dateCreated),
    };
  },

  /**
   * Convert an array of TaskDTOs to Task domain models
   * @param dtos - Array of TaskDTOs from the API
   * @returns Array of Task domain models
   */
  toDomainList(dtos: TaskDTO[]): Task[] {
    return dtos.map((dto) => this.toDomain(dto));
  },

  /**
   * Convert a Task domain model to a TaskDTO
   * @param task - The Task domain model
   * @returns TaskDTO for API communication
   */
  toDTO(task: Task): TaskDTO {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      dateCreated: task.dateCreated.toISOString(),
    };
  },

  /**
   * Create a CreateTaskRequest from form data
   * @param title - The task title
   * @returns CreateTaskRequest for API
   */
  toCreateRequest(title: string): CreateTaskRequest {
    return {
      title: title.trim(),
    };
  },
};

