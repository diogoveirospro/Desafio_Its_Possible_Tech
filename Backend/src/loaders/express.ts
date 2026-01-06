import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import routes from '../api/index.js';
import config from '../config/index.js';

export default ({ app }: { app: express.Application }) => {
  /**
   * @openapi
   * /status:
   *  get:
   *    tags:
   *    - System
   *    description: Responds if the app is up and running
   *  responses:
   *    200:
   *      description: App is up
   */
  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  app.enable('trust proxy');

  // ============================================================
  // 🟢 SWAGGER CONFIGURATION
  // ============================================================

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ToDo API (Mini Project)',
        version: '0.1.0',
        description: `Mini ToDo API for managing simple tasks.

Supported endpoints:
- POST /tasks → Create a new task
- GET /tasks → List all tasks
- PATCH /tasks/:id → Mark a task as completed (partial update)
- DELETE /tasks/:id → Remove a task

`,
      },
      servers: [
        {
          url: process.env.API_URL || `http://localhost:${config.port}${config.api.prefix}`,
          description: 'Local development server',
        },
      ],
      components: {
        schemas: {
          Error: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      // Removed security requirements for this minimal project
    },

    apis: ['./src/api/**/*.ts', './src/loaders/express.ts'],
  } as const;

  const specs = swaggerJsdoc(options);

  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
  // ============================================================

  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err: any = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });

  /// error handlers
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end();
    }
    return next(err);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
};
