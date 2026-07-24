import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/fileService';
import { driveService } from '../services/driveService';
import { verifyPassword } from '../utils/crypto';
import { logger } from '../utils/logger';

/**
 * Gets file metadata for the download page preview.
 */
export async function getDownloadDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const file = await fileService.getFileByToken(token);

    if (!file) {
      return res.status(444).json({
        success: false,
        error: 'File not found',
        message: 'This link has expired or does not exist.',
      });
    }

    const now = new Date();
    const isExpired = new Date(file.expires_at) <= now || file.status !== 'active';

    if (isExpired) {
      // Trigger immediate auto-cleanup
      driveService.deleteFile(file.drive_file_id).catch(() => {});
      fileService.deleteFileRecord(file.id).catch(() => {});

      return res.status(410).json({
        success: false,
        isExpired: true,
        error: 'Link Expired',
        message: 'This link has expired.',
      });
    }

    const remainingMs = new Date(file.expires_at).getTime() - now.getTime();

    return res.json({
      success: true,
      data: {
        fileId: file.id,
        originalName: file.original_name,
        fileSize: file.file_size,
        mimeType: file.mime_type,
        downloadToken: file.download_token,
        downloadCount: file.download_count,
        uploadedAt: file.uploaded_at,
        expiresAt: file.expires_at,
        remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
        isPasswordProtected: !!file.password_hash,
        downloadOnce: file.download_once,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies password for protected download links.
 */
export async function verifyDownloadPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    const file = await fileService.getFileByToken(token);
    if (!file || file.status !== 'active' || new Date(file.expires_at) <= new Date()) {
      return res.status(410).json({ success: false, error: 'This link has expired.' });
    }

    if (!file.password_hash) {
      return res.json({ success: true, verified: true });
    }

    const isValid = await verifyPassword(password, file.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Incorrect password provided.' });
    }

    return res.json({ success: true, verified: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Streams the file directly from Google Drive API to client response.
 */
export async function streamFileContent(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const password = req.query.password as string | undefined;

    const file = await fileService.getFileByToken(token);

    if (!file) {
      return res.status(404).send('This link has expired.');
    }

    const now = new Date();
    if (new Date(file.expires_at) <= now || file.status !== 'active') {
      driveService.deleteFile(file.drive_file_id).catch(() => {});
      fileService.deleteFileRecord(file.id).catch(() => {});
      return res.status(410).send('This link has expired.');
    }

    // Password verification check if protected
    if (file.password_hash) {
      if (!password) {
        return res.status(401).send('Password required to download this file.');
      }
      const isValid = await verifyPassword(password, file.password_hash);
      if (!isValid) {
        return res.status(401).send('Invalid password.');
      }
    }

    logger.info(`Starting download stream for token ${token} (${file.original_name})`);

    // Increment download count
    await fileService.incrementDownloadCount(file.id);

    // Set headers for download streaming
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
    res.setHeader('Content-Length', file.file_size.toString());

    // Stream directly from Google Drive
    const driveStream = await driveService.getFileStream(file.drive_file_id);
    driveStream.pipe(res);

    // Handle "Download Once" flag
    if (file.download_once) {
      res.on('finish', async () => {
        logger.info(`Download once rule triggered for token ${token}. Deleting file.`);
        await driveService.deleteFile(file.drive_file_id);
        await fileService.deleteFileRecord(file.id);
      });
    }
  } catch (error) {
    logger.error('Error streaming file download: %s', (error as Error).message);
    if (!res.headersSent) {
      res.status(500).send('Error streaming download from Google Drive.');
    }
  }
}
