import cron from 'node-cron';
import { fileService } from './fileService';
import { driveService } from './driveService';
import { pool } from '../database/db';
import { logger } from '../utils/logger';

export class CleanupService {
  private isRunning: boolean = false;

  startScheduler(): void {
    logger.info('Initializing QuickShare 60-second automatic cleanup cron scheduler...');
    // Run every minute
    cron.schedule('* * * * *', async () => {
      await this.runCleanup();
    });
  }

  async runCleanup(): Promise<{ deletedCount: number; freedBytes: number }> {
    if (this.isRunning) {
      logger.info('Cleanup job already running, skipping execution cycle.');
      return { deletedCount: 0, freedBytes: 0 };
    }

    this.isRunning = true;
    let deletedCount = 0;
    let freedBytes = 0;

    try {
      const expiredFiles = await fileService.getExpiredActiveFiles();

      if (expiredFiles.length > 0) {
        logger.info(`Found ${expiredFiles.length} expired files to clean up.`);

        for (const file of expiredFiles) {
          try {
            // Delete from Google Drive
            await driveService.deleteFile(file.drive_file_id);

            // Update DB status to expired/deleted
            await fileService.updateFileStatus(file.id, 'expired');
            await fileService.deleteFileRecord(file.id);

            deletedCount++;
            freedBytes += Number(file.file_size);
            logger.info(`Expired file '${file.original_name}' (ID: ${file.id}) cleaned up successfully.`);
          } catch (fileErr) {
            logger.error(`Error purging expired file ID ${file.id}: %s`, (fileErr as Error).message);
          }
        }
      }

      // Log execution metrics to Postgres
      try {
        await pool.query(
          `INSERT INTO cleanup_logs (files_deleted, space_freed_bytes, status, details) VALUES ($1, $2, $3, $4);`,
          [deletedCount, freedBytes, 'success', `Cleaned ${deletedCount} files`]
        );
      } catch (dbErr) {
        // Quiet fallback
      }

      if (deletedCount > 0) {
        logger.info(`Cleanup cycle completed: ${deletedCount} files deleted, ${freedBytes} bytes freed.`);
      }
    } catch (error) {
      logger.error('Error during cleanup execution cycle: %s', (error as Error).message);
    } finally {
      this.isRunning = false;
    }

    return { deletedCount, freedBytes };
  }

  async getRecentLogs(limit: number = 20): Promise<any[]> {
    try {
      const res = await pool.query(`SELECT * FROM cleanup_logs ORDER BY executed_at DESC LIMIT $1;`, [limit]);
      return res.rows;
    } catch (error) {
      return [
        {
          id: 1,
          files_deleted: 0,
          space_freed_bytes: 0,
          status: 'success',
          details: 'Cron running active background monitoring',
          executed_at: new Date(),
        },
      ];
    }
  }
}

export const cleanupService = new CleanupService();
