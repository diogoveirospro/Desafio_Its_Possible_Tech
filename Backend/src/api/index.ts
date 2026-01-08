import { Router } from 'express';
import taskRoute from './routes/taskRoute.js';

export default () => {
  const app = Router();

  // Task routes
  taskRoute(app);

  return app;
};
