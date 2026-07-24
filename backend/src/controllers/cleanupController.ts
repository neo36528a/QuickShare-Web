import { Request, Response, NextFunction } from 'express';
import { cleanupService } from '../services/cleanupService';

export async function triggerManualCleanup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await cleanupService.runCleanup();
    return res.json({
      success: true,
      message: 'Manual cleanup triggered successfully.',
      data: {
        filesDeleted: result.deletedCount,
        spaceFreedBytes: result.freedBytes,
      },
    });
  } catch (error) {
    next(error);
  }
}
