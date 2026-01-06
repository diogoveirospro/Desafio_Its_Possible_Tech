import mongoose from 'mongoose';
import config from '../config/index.js';

export default async (): Promise<any> => {
  if (!config.databaseURL) {
    throw new Error('Database URL is not configured');
  }
  const connection = await mongoose.connect(config.databaseURL);
  return connection.connection.db;
};
