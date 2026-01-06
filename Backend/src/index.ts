import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';

import Logger from './loaders/logger.js';
import config from './config/index.js';

async function startServer() {
  const app = express();

  const loaders = await import('./loaders/index.js');
  await loaders.default({ expressApp: app });

  app.listen(config.port, () => {
    Logger.info(`
      ################################################
      Server listening on port: ${config.port}
      ################################################
    `);
  }).on('error', (err) => {
    Logger.error(err);
    process.exit(1);
  });
}

startServer();
