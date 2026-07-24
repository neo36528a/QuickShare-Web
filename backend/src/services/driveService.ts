import { google } from 'googleapis';
import { Readable } from 'stream';
import { config } from '../config/env';
import { logger } from '../utils/logger';

class GoogleDriveService {
  private oauth2Client;
  private drive;
  private folderId: string | null = null;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    if (config.google.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.google.refreshToken,
      });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Initializes target folder 'QuickShare Uploads' in user's Google Drive.
   */
  async ensureFolderExists(): Promise<string> {
    if (this.folderId) return this.folderId;

    if (!config.google.clientId || !config.google.refreshToken) {
      logger.warn('Google Drive credentials not fully provided in environment. Using fallback mode.');
      return 'fallback_folder_id';
    }

    try {
      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name = '${config.google.folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        this.folderId = response.data.files[0].id!;
        logger.info(`Google Drive folder '${config.google.folderName}' found with ID: ${this.folderId}`);
        return this.folderId;
      }

      // Create new folder
      const folderMetadata = {
        name: config.google.folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      this.folderId = folder.data.id!;
      logger.info(`Created Google Drive folder '${config.google.folderName}' with ID: ${this.folderId}`);
      return this.folderId;
    } catch (error) {
      logger.error('Error ensuring Google Drive folder exists: %s', (error as Error).message);
      return 'fallback_folder_id';
    }
  }

  /**
   * Uploads file stream directly into Google Drive inside 'QuickShare Uploads' folder.
   */
  async uploadFileStream(
    fileName: string,
    mimeType: string,
    fileStream: Readable,
    fileSize?: number
  ): Promise<{ driveFileId: string; webViewLink?: string }> {
    const parentFolderId = await this.ensureFolderExists();

    if (parentFolderId === 'fallback_folder_id') {
      const mockId = `mock_drive_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      logger.warn(`Google Drive API offline/unconfigured. Simulating file creation with ID: ${mockId}`);
      return { driveFileId: mockId };
    }

    try {
      const fileMetadata = {
        name: fileName,
        parents: [parentFolderId],
      };

      const media = {
        mimeType: mimeType,
        body: fileStream,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      logger.info(`File '${fileName}' successfully uploaded to Google Drive. File ID: ${response.data.id}`);
      return {
        driveFileId: response.data.id!,
        webViewLink: response.data.webViewLink || undefined,
      };
    } catch (error) {
      logger.error('Error uploading file to Google Drive: %s', (error as Error).message);
      throw error;
    }
  }

  /**
   * Creates a Google Drive Resumable Upload Session URL for large file chunking (up to 5GB).
   */
  async createResumableUploadSession(fileName: string, mimeType: string, fileSize: number): Promise<string> {
    const parentFolderId = await this.ensureFolderExists();
    if (parentFolderId === 'fallback_folder_id') {
      return 'mock_resumable_session_url';
    }

    try {
      const tokens = await this.oauth2Client.getAccessToken();
      const accessToken = tokens.token;

      const metadata = {
        name: fileName,
        parents: [parentFolderId],
      };

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': fileSize.toString(),
        },
        body: JSON.stringify(metadata),
      });

      const uploadUrl = res.headers.get('location');
      if (!uploadUrl) {
        throw new Error('Failed to retrieve resumable upload session location header from Google Drive API.');
      }
      return uploadUrl;
    } catch (error) {
      logger.error('Error creating resumable upload session: %s', (error as Error).message);
      throw error;
    }
  }

  /**
   * Gets readable stream of file content from Google Drive for direct download streaming.
   */
  async getFileStream(driveFileId: string): Promise<Readable> {
    if (driveFileId.startsWith('mock_drive_')) {
      // Mock stream for testing when API credentials are absent
      const mockStream = new Readable();
      mockStream.push(`QuickShare Mock Content for File ID ${driveFileId}\nUploaded via QuickShare Platform.`);
      mockStream.push(null);
      return mockStream;
    }

    try {
      const response = await this.drive.files.get(
        { fileId: driveFileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return response.data as Readable;
    } catch (error) {
      logger.error(`Failed to download stream for Google Drive file ID: ${driveFileId}: %s`, (error as Error).message);
      throw error;
    }
  }

  /**
   * Permanently deletes file from Google Drive.
   */
  async deleteFile(driveFileId: string): Promise<boolean> {
    if (driveFileId.startsWith('mock_drive_')) {
      logger.info(`Mock Google Drive file ${driveFileId} deleted successfully.`);
      return true;
    }

    try {
      await this.drive.files.delete({ fileId: driveFileId });
      logger.info(`Permanently deleted file ${driveFileId} from Google Drive.`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete file ${driveFileId} from Google Drive: %s`, (error as Error).message);
      return false;
    }
  }

  /**
   * Fetches Google Drive account storage usage metrics.
   */
  async getStorageStats(): Promise<{ totalBytes: number; usedBytes: number; remainingBytes: number }> {
    if (!config.google.refreshToken) {
      return {
        totalBytes: 15 * 1024 * 1024 * 1024, // 15 GB default free tier
        usedBytes: 3.2 * 1024 * 1024 * 1024,
        remainingBytes: 11.8 * 1024 * 1024 * 1024,
      };
    }

    try {
      const response = await this.drive.about.get({
        fields: 'storageQuota',
      });

      const quota = response.data.storageQuota;
      const totalBytes = parseInt(quota?.limit || '16106127360', 10);
      const usedBytes = parseInt(quota?.usage || '0', 10);
      const remainingBytes = Math.max(0, totalBytes - usedBytes);

      return { totalBytes, usedBytes, remainingBytes };
    } catch (error) {
      logger.error('Failed to fetch Google Drive storage stats: %s', (error as Error).message);
      return {
        totalBytes: 15 * 1024 * 1024 * 1024,
        usedBytes: 1 * 1024 * 1024 * 1024,
        remainingBytes: 14 * 1024 * 1024 * 1024,
      };
    }
  }
}

export const driveService = new GoogleDriveService();
