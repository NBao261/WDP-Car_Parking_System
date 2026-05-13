import app from './app';
import { connectDatabase } from './database/connection';
import { env } from './config/env';
import { logger } from './config/logger';
import { createSocketServer } from './config/socket';
import http from 'http';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✅ MongoDB connected');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    createSocketServer(server);
    logger.info('✅ Socket.IO initialized');

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📄 API Docs: http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
