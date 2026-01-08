import type { Request, Response, NextFunction } from 'express';
import { Service, Inject } from 'typedi';
import type { ITaskController } from './IControllers/ITaskController.js';
import type { ITaskService } from '../services/IServices/ITaskService.js';

/**
 * Controller for Task endpoints
 */
@Service()
export default class TaskController implements ITaskController {
  constructor(
    @Inject('taskService')
    private readonly taskService: ITaskService
  ) {}

  /**
   * GET /api/tasks
   */
  public async list(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await this.taskService.listTasks();
      if (result.isFailure) {
        return res.status(500).json({ error: result.error });
      }
      return res.status(200).json(result.getValue());
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/tasks
   */
  public async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { title } = req.body ?? {};
      const result = await this.taskService.createTask(title);

      if (result.isFailure) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json(result.getValue());
    } catch (e) {
      next(e);
    }
  }

  /**
   * PATCH /api/tasks/:id
   */
  public async toggle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const result = await this.taskService.toggleTaskStatus(id);
      if (result.isFailure) {
        const msg = String(result.error ?? 'Error');
        const status = msg.toLowerCase().includes('not found') ? 404 : 400;
        return res.status(status).json({ error: result.error });
      }

      return res.status(200).json(result.getValue());
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /api/tasks/:id
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const result = await this.taskService.deleteTask(id);
      if (result.isFailure) {
        const msg = String(result.error ?? 'Error');
        const status = msg.toLowerCase().includes('not found') ? 404 : 400;
        return res.status(status).json({ error: result.error });
      }

      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}
