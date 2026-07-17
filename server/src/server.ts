import app from './app';
import { connectDatabase } from './database/connection';
import { env } from './config/env';
import { logger } from './config/logger';
import { createSocketServer } from './config/socket';
import { getRedis } from './config/redis';
import { initUploadQueue } from './queues/uploadQueue';
import http from 'http';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✅ MongoDB connected');

    // Connect to Redis (non-blocking — app works without Redis)
    getRedis();
    logger.info('✅ Redis client initialized');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    createSocketServer(server);
    logger.info('✅ Socket.IO initialized');

    // Initialize Background Queues
    initUploadQueue();

    // Start listening
    server.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📄 API Docs: http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
