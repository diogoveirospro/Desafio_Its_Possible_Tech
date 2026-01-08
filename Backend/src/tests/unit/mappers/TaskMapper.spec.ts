import { describe, it, expect, beforeEach } from '@jest/globals';
import { TaskMapper } from '../../../mappers/TaskMapper.js';
import { Task } from '../../../domain/Task/Entities/Task.js';
import { TaskID } from '../../../domain/Task/ValueObjects/TaskID.js';
import { TaskTitle } from '../../../domain/Task/ValueObjects/TaskTitle.js';
import { TaskStatus } from '../../../domain/Task/ValueObjects/TaskStatus.js';
import type { ITaskDTO } from '../../../dto/ITaskDTO.js';
import type { ITaskPersistence } from '../../../dataschema/ITaskPersistence.js';

describe('TaskMapper', () => {
  const validDate = new Date('2026-01-08T10:00:00Z');

  describe('toDomain', () => {
    it('should map a valid persistence object to a Task domain object', async () => {
      const raw: ITaskPersistence = {
        taskId: 'T-001',
        title: 'Test Task',
        status: false,
        dateCreated: validDate,
      };

      const task = await TaskMapper.toDomain(raw);

      expect(task).not.toBeNull();
      expect(task!.taskId.id.toString()).toBe('T-001');
      expect(task!.title.value).toBe('Test Task');
      expect(task!.status.value).toBe(false);
      expect(task!.dateCreated).toEqual(validDate);
    });

    it('should map persistence object with status true', async () => {
      const raw: ITaskPersistence = {
        taskId: 'T-002',
        title: 'Completed Task',
        status: true,
        dateCreated: validDate,
      };

      const task = await TaskMapper.toDomain(raw);

      expect(task).not.toBeNull();
      expect(task!.status.value).toBe(true);
    });

    it('should return null when raw is null', async () => {
      const task = await TaskMapper.toDomain(null);

      expect(task).toBeNull();
    });

    it('should return null when raw is undefined', async () => {
      const task = await TaskMapper.toDomain(undefined);

      expect(task).toBeNull();
    });

    it('should return null when taskId is invalid', async () => {
      const raw = {
        taskId: 'INVALID',
        title: 'Test Task',
        status: false,
        dateCreated: validDate,
      };

      const task = await TaskMapper.toDomain(raw);

      expect(task).toBeNull();
    });

    it('should return null when title is empty', async () => {
      const raw = {
        taskId: 'T-001',
        title: '',
        status: false,
        dateCreated: validDate,
      };

      const task = await TaskMapper.toDomain(raw);

      expect(task).toBeNull();
    });

    it('should handle dateCreated as DateCreated property name', async () => {
      const raw = {
        taskId: 'T-001',
        title: 'Test Task',
        status: false,
        DateCreated: validDate,
      };

      const task = await TaskMapper.toDomain(raw);

      expect(task).not.toBeNull();
      expect(task!.dateCreated).toEqual(validDate);
    });

    it('should use current date when dateCreated is missing', async () => {
      const raw = {
        taskId: 'T-001',
        title: 'Test Task',
        status: false,
      };

      const before = new Date();
      const task = await TaskMapper.toDomain(raw);
      const after = new Date();

      expect(task).not.toBeNull();
      expect(task!.dateCreated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(task!.dateCreated.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should convert status to boolean', async () => {
      const raw = {
        taskId: 'T-001',
        title: 'Test Task',
        status: 1, // truthy value
        dateCreated: validDate,
      };

      const task = await TaskMapper.toDomain(raw);

      expect(task).not.toBeNull();
      expect(task!.status.value).toBe(true);
    });
  });

  describe('toPersistence', () => {
    it('should map a Task domain object to persistence format', () => {
      const taskResult = Task.create({
        taskId: TaskID.create('T-001').getValue(),
        title: TaskTitle.create('Test Task').getValue(),
        status: TaskStatus.create(false).getValue(),
        DateCreated: validDate,
      });
      const task = taskResult.getValue();

      const persistence = TaskMapper.toPersistence(task);

      expect(persistence.taskId).toBe('T-001');
      expect(persistence.title).toBe('Test Task');
      expect(persistence.status).toBe(false);
      expect(persistence.dateCreated).toEqual(validDate);
    });

    it('should map a Task with status true to persistence', () => {
      const taskResult = Task.create({
        taskId: TaskID.create('T-002').getValue(),
        title: TaskTitle.create('Completed Task').getValue(),
        status: TaskStatus.create(true).getValue(),
        DateCreated: validDate,
      });
      const task = taskResult.getValue();

      const persistence = TaskMapper.toPersistence(task);

      expect(persistence.status).toBe(true);
    });
  });

  describe('toDTO', () => {
    it('should map a Task domain object to a DTO', () => {
      const taskResult = Task.create({
        taskId: TaskID.create('T-001').getValue(),
        title: TaskTitle.create('Test Task').getValue(),
        status: TaskStatus.create(false).getValue(),
        DateCreated: validDate,
      });
      const task = taskResult.getValue();

      const dto = TaskMapper.toDTO(task);

      expect(dto.id).toBe('T-001');
      expect(dto.title).toBe('Test Task');
      expect(dto.status).toBe(false);
      expect(dto.dateCreated).toBe(validDate.toISOString());
    });

    it('should map a Task with status true to DTO', () => {
      const taskResult = Task.create({
        taskId: TaskID.create('T-002').getValue(),
        title: TaskTitle.create('Completed Task').getValue(),
        status: TaskStatus.create(true).getValue(),
        DateCreated: validDate,
      });
      const task = taskResult.getValue();

      const dto = TaskMapper.toDTO(task);

      expect(dto.status).toBe(true);
    });

    it('should return dateCreated as ISO string', () => {
      const taskResult = Task.create({
        taskId: TaskID.create('T-001').getValue(),
        title: TaskTitle.create('Test Task').getValue(),
        status: TaskStatus.create(false).getValue(),
        DateCreated: new Date('2026-01-08T15:30:00Z'),
      });
      const task = taskResult.getValue();

      const dto = TaskMapper.toDTO(task);

      expect(dto.dateCreated).toBe('2026-01-08T15:30:00.000Z');
    });
  });

  describe('toDomainFromDTO', () => {
    const mapper = new TaskMapper();

    it('should map a valid DTO to a Task domain object', () => {
      const dto: ITaskDTO = {
        id: 'T-001',
        title: 'Test Task',
        status: false,
        dateCreated: validDate.toISOString(),
      };

      const task = mapper.toDomainFromDTO(dto);

      expect(task).not.toBeNull();
      expect(task!.taskId.id.toString()).toBe('T-001');
      expect(task!.title.value).toBe('Test Task');
      expect(task!.status.value).toBe(false);
    });

    it('should return null when DTO is null', () => {
      const task = mapper.toDomainFromDTO(null as unknown as ITaskDTO);

      expect(task).toBeNull();
    });

    it('should return null when DTO has invalid id', () => {
      const dto: ITaskDTO = {
        id: 'INVALID',
        title: 'Test Task',
        status: false,
        dateCreated: validDate.toISOString(),
      };

      const task = mapper.toDomainFromDTO(dto);

      expect(task).toBeNull();
    });

    it('should return null when DTO has empty title', () => {
      const dto: ITaskDTO = {
        id: 'T-001',
        title: '',
        status: false,
        dateCreated: validDate.toISOString(),
      };

      const task = mapper.toDomainFromDTO(dto);

      expect(task).toBeNull();
    });

    it('should use current date when dateCreated is not provided', () => {
      const dto = {
        id: 'T-001',
        title: 'Test Task',
        status: false,
        dateCreated: undefined,
      } as unknown as ITaskDTO;

      const before = new Date();
      const task = mapper.toDomainFromDTO(dto);
      const after = new Date();

      expect(task).not.toBeNull();
      expect(task!.dateCreated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(task!.dateCreated.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});

