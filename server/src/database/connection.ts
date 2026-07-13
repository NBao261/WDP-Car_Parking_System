import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`📦 MongoDB connected: ${env.MONGODB_URI}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};
