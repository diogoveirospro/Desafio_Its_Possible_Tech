import type { Request, Response, NextFunction } from 'express';

export interface ITaskController {
  /**
   * Lists all tasks.
   * @param req the request
   * @param res the response
   * @param next the next function
   */
  list(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  /**
   * Creates a new task.
   * @param req the request
   * @param res the response
   * @param next the next function
   */
  create(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  /**
   * Toggles the completion status of a task.
   * @param req the request
   * @param res the response
   * @param next the next function
   */
  toggle(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  /**
   * Deletes a task.
   * @param req the request
   * @param res the response
   * @param next the next function
   */
  delete(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
