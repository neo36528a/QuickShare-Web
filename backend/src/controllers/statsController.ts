import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/fileService';
import { driveService } from '../services/driveService';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const fileStats = await fileService.getStats();
    const storageQuota = await driveService.getStorageStats();

    return res.json({
      success: true,
      data: {
        totalUploads: fileStats.totalUploads,
        totalDownloads: fileStats.totalDownloads,
        activeLinks: fileStats.activeLinks,
        expiredLinks: fileStats.expiredLinks,
        storageUsedBytes: fileStats.totalBytesStored,
        driveStorage: {
          totalBytes: storageQuota.totalBytes,
          usedBytes: storageQuota.usedBytes,
          remainingBytes: storageQuota.remainingBytes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHealth(req: Request, res: Response) {
  return res.json({
    status: 'healthy',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'QuickShare Backend API',
  });
}
