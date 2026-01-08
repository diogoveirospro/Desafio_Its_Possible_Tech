import { describe, it, expect } from 'vitest';
import { TaskMapper } from './TaskMapper';
import type { TaskDTO } from '../dtos/TaskDTO';
import type { Task } from '../models/Task';

describe('TaskMapper', () => {
  const mockTaskDTO: TaskDTO = {
    id: 'T-001',
    title: 'Test Task',
    status: false,
    dateCreated: '2024-01-15T10:30:00.000Z',
  };

  const mockTask: Task = {
    id: 'T-001',
    title: 'Test Task',
    status: false,
    dateCreated: new Date('2024-01-15T10:30:00.000Z'),
  };

  describe('toDomain', () => {
    it('should convert a TaskDTO to a Task domain model', () => {
      const result = TaskMapper.toDomain(mockTaskDTO);

      expect(result.id).toBe(mockTaskDTO.id);
      expect(result.title).toBe(mockTaskDTO.title);
      expect(result.status).toBe(mockTaskDTO.status);
      expect(result.dateCreated).toBeInstanceOf(Date);
      expect(result.dateCreated.toISOString()).toBe(mockTaskDTO.dateCreated);
    });

    it('should convert a completed TaskDTO correctly', () => {
      const completedDTO: TaskDTO = { ...mockTaskDTO, status: true };
      const result = TaskMapper.toDomain(completedDTO);

      expect(result.status).toBe(true);
    });
  });

  describe('toDomainList', () => {
    it('should convert an array of TaskDTOs to Task domain models', () => {
      const dtos: TaskDTO[] = [
        mockTaskDTO,
        { ...mockTaskDTO, id: 'T-002', title: 'Second Task' },
        { ...mockTaskDTO, id: 'T-003', title: 'Third Task', status: true },
      ];

      const result = TaskMapper.toDomainList(dtos);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('T-001');
      expect(result[1].id).toBe('T-002');
      expect(result[2].id).toBe('T-003');
      expect(result[2].status).toBe(true);
    });

    it('should return an empty array when given an empty array', () => {
      const result = TaskMapper.toDomainList([]);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('toDTO', () => {
    it('should convert a Task domain model to a TaskDTO', () => {
      const result = TaskMapper.toDTO(mockTask);

      expect(result.id).toBe(mockTask.id);
      expect(result.title).toBe(mockTask.title);
      expect(result.status).toBe(mockTask.status);
      expect(result.dateCreated).toBe(mockTask.dateCreated.toISOString());
    });

    it('should convert a completed Task correctly', () => {
      const completedTask: Task = { ...mockTask, status: true };
      const result = TaskMapper.toDTO(completedTask);

      expect(result.status).toBe(true);
    });
  });

  describe('toCreateRequest', () => {
    it('should create a CreateTaskRequest from a title', () => {
      const title = 'New Task Title';
      const result = TaskMapper.toCreateRequest(title);

      expect(result).toEqual({ title: 'New Task Title' });
    });

    it('should trim whitespace from the title', () => {
      const title = '  Trimmed Title  ';
      const result = TaskMapper.toCreateRequest(title);

      expect(result.title).toBe('Trimmed Title');
    });

    it('should handle empty string', () => {
      const result = TaskMapper.toCreateRequest('');

      expect(result.title).toBe('');
    });

    it('should handle whitespace-only string', () => {
      const result = TaskMapper.toCreateRequest('   ');

      expect(result.title).toBe('');
    });
  });
});

