import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/fileService';
import { driveService } from '../services/driveService';
import { cleanupService } from '../services/cleanupService';
import { logger } from '../utils/logger';

export async function getAdminOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const fileStats = await fileService.getStats();
    const storageQuota = await driveService.getStorageStats();
    const recentFiles = await fileService.getAllFiles(50);
    const cleanupLogs = await cleanupService.getRecentLogs(20);

    return res.json({
      success: true,
      data: {
        stats: {
          totalUploads: fileStats.totalUploads,
          totalDownloads: fileStats.totalDownloads,
          activeLinks: fileStats.activeLinks,
          expiredLinks: fileStats.expiredLinks,
          storageUsed: fileStats.totalBytesStored,
          driveQuota: storageQuota,
        },
        recentUploads: recentFiles.map((f) => ({
          id: f.id,
          originalName: f.original_name,
          fileSize: f.file_size,
          mimeType: f.mime_type,
          downloadToken: f.download_token,
          downloadCount: f.download_count,
          status: f.status,
          uploadedAt: f.uploaded_at,
          expiresAt: f.expires_at,
          isPasswordProtected: !!f.password_hash,
          downloadOnce: f.download_once,
        })),
        cleanupLogs,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFileAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const files = await fileService.getAllFiles(1000);
    const targetFile = files.find((f) => f.id === id);

    if (!targetFile) {
      return res.status(404).json({ success: false, error: 'File not found.' });
    }

    await driveService.deleteFile(targetFile.drive_file_id);
    await fileService.deleteFileRecord(targetFile.id);

    logger.info(`Admin deleted file ${id} (${targetFile.original_name})`);
    return res.json({ success: true, message: 'File deleted successfully by admin.' });
  } catch (error) {
    next(error);
  }
}
