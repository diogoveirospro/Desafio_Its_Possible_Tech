import * as dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("Couldn't find .env file!");
}

export default {
  port: parseInt(process.env.PORT || '3000', 10),

  // You can add your database URI, JWT secret, etc here
  databaseURL: process.env.MONGODB_URI,
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  api: {
    prefix: '/api',
  },

  repositories: {
    task: {
      name: 'taskRepository',
      path: '../repos/TaskRepository.js',
    },
  },

  services: {
    task: {
      name: 'taskService',
      path: '../services/TaskService.js',
    },
  },

  controllers: {
    task: {
      name: 'taskController',
      path: '../controllers/TaskController.js',
    },
  },
};
