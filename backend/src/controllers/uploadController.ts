import { Request, Response, NextFunction } from 'express';
import v4 from 'crypto';
import multer from 'multer';
import { Readable } from 'stream';
import { driveService } from '../services/driveService';
import { fileService } from '../services/fileService';
import { generateDownloadToken, generateStoredFileName } from '../utils/token';
import { hashPassword } from '../utils/crypto';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// Configure Multer for streaming in-memory buffers
const uploadMulter = multer({
  limits: { fileSize: config.maxUploadSizeBytes },
});

export const handleSingleUpload = [
  uploadMulter.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
      }

      const file = req.file;
      const password = req.body.password as string | undefined;
      const downloadOnce = req.body.downloadOnce === 'true' || req.body.downloadOnce === true;

      // Validate file size limit
      if (file.size > config.maxUploadSizeBytes) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds the maximum limit of ${config.maxUploadSizeBytes / (1024 * 1024 * 1024)} GB.`,
        });
      }

      const fileId = v4.randomUUID();
      const storedName = generateStoredFileName(file.originalname);
      const downloadToken = generateDownloadToken(9);

      // Create stream from file buffer
      const fileStream = new Readable();
      fileStream.push(file.buffer);
      fileStream.push(null);

      // Upload stream to Google Drive
      const driveResult = await driveService.uploadFileStream(
        storedName,
        file.mimetype || 'application/octet-stream',
        fileStream,
        file.size
      );

      // Calculate expiration time (30 minutes from now)
      const uploadedAt = new Date();
      const expiresAt = new Date(uploadedAt.getTime() + config.fileExpirationMinutes * 60 * 1000);

      // Hash password if provided
      let passwordHash: string | null = null;
      if (password && password.trim().length > 0) {
        passwordHash = await hashPassword(password.trim());
      }

      // Save file metadata to PostgreSQL
      const fileRecord = await fileService.createFileRecord({
        id: fileId,
        drive_file_id: driveResult.driveFileId,
        original_name: file.originalname,
        stored_name: storedName,
        file_size: file.size,
        mime_type: file.mimetype || 'application/octet-stream',
        download_token: downloadToken,
        password_hash: passwordHash,
        download_once: downloadOnce,
        expires_at: expiresAt,
      });

      logger.info(`File successfully uploaded and indexed. Token: ${downloadToken}`);

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileId: fileRecord.id,
          originalName: fileRecord.original_name,
          fileSize: fileRecord.file_size,
          downloadToken: fileRecord.download_token,
          downloadUrl: `/download/${fileRecord.download_token}`,
          uploadedAt: fileRecord.uploaded_at,
          expiresAt: fileRecord.expires_at,
          expirationMinutes: config.fileExpirationMinutes,
          isPasswordProtected: !!passwordHash,
          downloadOnce: fileRecord.download_once,
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * Initiates Resumable Upload Session directly with Google Drive API for large files (up to 5GB).
 */
export async function initResumableUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileName, mimeType, fileSize } = req.body;

    if (!fileName || !fileSize) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: fileName, fileSize.' });
    }

    const size = parseInt(fileSize, 10);
    if (size > config.maxUploadSizeBytes) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds max allowable limit of 5 GB.`,
      });
    }

    const storedName = generateStoredFileName(fileName);
    const resumableUrl = await driveService.createResumableUploadSession(
      storedName,
      mimeType || 'application/octet-stream',
      size
    );

    return res.json({
      success: true,
      data: {
        storedName,
        resumableUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}
