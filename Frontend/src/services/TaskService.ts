import axios from 'axios';
import type { TaskDTO } from '../features/tasks/dtos/TaskDTO';
import type { Task } from '../features/tasks/models/Task';
import { TaskMapper } from '../features/tasks/mappers/TaskMapper';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Task API Service
 * Handles all HTTP requests to the backend task endpoints
 */
export const taskService = {
  /**
   * Fetch all tasks
   * @returns Array of Task domain models
   */
  async list(): Promise<Task[]> {
    const response = await api.get<TaskDTO[]>('/tasks');
    return TaskMapper.toDomainList(response.data);
  },

  /**
   * Create a new task
   * @param title - The task title
   * @returns Created Task domain model
   */
  async create(title: string): Promise<Task> {
    const request = TaskMapper.toCreateRequest(title);
    const response = await api.post<TaskDTO>('/tasks', request);
    return TaskMapper.toDomain(response.data);
  },

  /**
   * Toggle task status
   * @param id - The task ID
   * @returns Updated Task domain model
   */
  async toggle(id: string): Promise<Task> {
    const response = await api.patch<TaskDTO>(`/tasks/${id}`);
    return TaskMapper.toDomain(response.data);
  },

  /**
   * Delete a task
   * @param id - The task ID
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};

