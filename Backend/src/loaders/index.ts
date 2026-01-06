import expressLoader from './express.js';
import dependencyInjectorLoader from './dependencyInjector.js';
import mongooseLoader from './mongoose.js';
import Logger from './logger.js';
import type {Application} from 'express';

import config from '../config/index.js';

export default async ({expressApp}: { expressApp: Application }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info('✌️ DB loaded and connected!');

  /*
  const taskSchema = {
    name: 'taskSchema',
    schema: '../persistence/schemas/TaskSchema.js',
  };

  const taskController = {
    name: config.controllers.task.name,
    path: config.controllers.task.path
  };

  const taskRepositories = {
    name: config.repositories.task.name,
    path: config.repositories.task.path
  };

  const taskService = {
    name: config.services.task.name,
    path: config.services.task.path
  };
*/
  await dependencyInjectorLoader({
    mongoConnection

    ,
    schemas: [
      //taskSchema
    ],
    controllers: [
      //taskController
    ],
    repos: [
      //taskRepositories
    ],
    services: [
      //taskService
    ]
  });
  Logger.info('✌️ Schemas, Controllers, Repositories, Services, etc. loaded');

  await expressLoader({app: expressApp});
  Logger.info('✌️ Express loaded');
};
