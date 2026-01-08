import { Router } from 'express';
import { Container } from 'typedi';
import TaskController from '../../controllers/TaskController.js';

const route = Router();

export default (app: Router) => {
  app.use('/tasks', route);

  const ctrl = Container.get(TaskController);

  /**
   * @openapi
   * /tasks:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: List all tasks
   *     responses:
   *       200:
   *         description: Array of tasks
   */
  route.get('/', (req, res, next) => ctrl.list(req, res, next));

  /**
   * @openapi
   * /tasks:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Create a new task
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title]
   *             properties:
   *               title:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created task
   */
  route.post('/', (req, res, next) => ctrl.create(req, res, next));

  /**
   * @openapi
   * /tasks/{id}:
   *   patch:
   *     tags:
   *       - Tasks
   *     summary: Toggle a task status
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Updated task
   *       404:
   *         description: Task not found
   */
  route.patch('/:id', (req, res, next) => ctrl.toggle(req, res, next));

  /**
   * @openapi
   * /tasks/{id}:
   *   delete:
   *     tags:
   *       - Tasks
   *     summary: Delete a task
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Deleted
   *       404:
   *         description: Task not found
   */
  route.delete('/:id', (req, res, next) => ctrl.delete(req, res, next));
};
