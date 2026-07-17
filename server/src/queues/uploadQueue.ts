import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { UploadService } from '../services/upload.service';
import { logger } from '../config/logger';

export const uploadQueueName = 'uploadQueue';

let uploadQueue: Queue | null = null;
let uploadWorker: Worker | null = null;

export const initUploadQueue = () => {
  if (!process.env.REDIS_URL) {
    logger.warn('[BullMQ] REDIS_URL is not set. UploadQueue will not be initialized.');
    return;
  }

  try {
    const queueConnection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    const workerConnection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

    uploadQueue = new Queue(uploadQueueName, { connection: queueConnection });

    uploadWorker = new Worker(uploadQueueName, async (job) => {
      if (job.name === 'processExceptionImages') {
        const { exceptionId } = job.data;
        logger.info(`[BullMQ] Worker processing exception upload job ${job.id} for exception ${exceptionId}`);
        if (exceptionId) {
          await UploadService.processExceptionImages(exceptionId);
        }
      } else {
        const { sessionId } = job.data;
        logger.info(`[BullMQ] Worker processing job ${job.id} for session ${sessionId}`);
        if (sessionId) {
          await UploadService.processCompletedSessionImages(sessionId);
        }
      }
    }, { connection: workerConnection });

    uploadWorker.on('completed', (job) => {
      logger.info(`[BullMQ] UploadJob ${job.id} completed (${job.name})`);
    });

    uploadWorker.on('failed', (job, err) => {
      logger.error(`[BullMQ] UploadJob ${job?.id} failed (${job?.name})`, err);
    });
    
    logger.info('[BullMQ] UploadQueue initialized');
  } catch (err) {
    logger.error('[BullMQ] Failed to initialize UploadQueue', err);
  }
};

export const addUploadJob = async (sessionId: string) => {
  if (uploadQueue) {
    try {
      await uploadQueue.add('processImages', { sessionId }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });
      logger.info(`[BullMQ] Upload job queued for session ${sessionId}`);
    } catch (err) {
      logger.error(`[BullMQ] Failed to queue upload job, running directly`, err);
      UploadService.processCompletedSessionImages(sessionId).catch(console.error);
    }
  } else {
    logger.warn(`[BullMQ] Queue not initialized, running upload directly for session ${sessionId}`);
    UploadService.processCompletedSessionImages(sessionId).catch(console.error);
  }
};

export const addExceptionUploadJob = async (exceptionId: string) => {
  if (uploadQueue) {
    try {
      await uploadQueue.add('processExceptionImages', { exceptionId }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });
      logger.info(`[BullMQ] Exception upload job queued for exception ${exceptionId}`);
    } catch (err) {
      logger.error(`[BullMQ] Failed to queue exception upload job, running directly`, err);
      UploadService.processExceptionImages(exceptionId).catch(console.error);
    }
  } else {
    logger.warn(`[BullMQ] Queue not initialized, running exception upload directly for ${exceptionId}`);
    UploadService.processExceptionImages(exceptionId).catch(console.error);
  }
};
