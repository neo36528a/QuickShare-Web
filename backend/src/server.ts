import express from 'express';
import { config } from './config/env';
import { helmetMiddleware, corsMiddleware } from './middlewares/security';
import { errorHandler } from './middlewares/errorHandler';
import apiRouter from './routes/api';
import { initDatabase } from './database/db';
import { driveService } from './services/driveService';
import { cleanupService } from './services/cleanupService';
import { logger } from './utils/logger';

const app = express();

// Security & Utility Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Initialize Server & Services
async function bootstrap() {
  logger.info('Starting QuickShare Backend Server...');

  // Initialize DB Connection
  await initDatabase();

  // Initialize Google Drive integration
  await driveService.ensureFolderExists();

  // Start 60-second Background Cleanup Scheduler
  cleanupService.startScheduler();

  app.listen(config.port, () => {
    logger.info(`🚀 QuickShare API is running on port ${config.port} [ENV: ${config.nodeEnv}]`);
    logger.info(`📍 Health endpoint: http://localhost:${config.port}/api/health`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server: %s', err.message);
  process.exit(1);
});
