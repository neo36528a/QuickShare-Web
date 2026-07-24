import { pool } from '../database/db';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export interface FileRecord {
  id: string;
  drive_file_id: string;
  original_name: string;
  stored_name: string;
  file_size: number;
  mime_type: string;
  download_token: string;
  password_hash: string | null;
  download_once: boolean;
  download_count: number;
  status: 'active' | 'expired' | 'deleted';
  uploaded_at: Date;
  expires_at: Date;
}

// In-memory fallback store when PostgreSQL server is not connected locally
const memoryStore = new Map<string, FileRecord>();
const memoryTokenIndex = new Map<string, string>(); // token -> file id

export class FileService {
  async createFileRecord(data: Omit<FileRecord, 'download_count' | 'status' | 'uploaded_at'>): Promise<FileRecord> {
    const record: FileRecord = {
      ...data,
      download_count: 0,
      status: 'active',
      uploaded_at: new Date(),
    };

    try {
      const query = `
        INSERT INTO files (
          id, drive_file_id, original_name, stored_name, file_size, mime_type,
          download_token, password_hash, download_once, download_count, status, uploaded_at, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      const values = [
        record.id,
        record.drive_file_id,
        record.original_name,
        record.stored_name,
        record.file_size,
        record.mime_type,
        record.download_token,
        record.password_hash,
        record.download_once,
        record.download_count,
        record.status,
        record.uploaded_at,
        record.expires_at,
      ];

      const res = await pool.query(query, values);
      logger.info(`File record created in Postgres for token ${record.download_token}`);
      return res.rows[0];
    } catch (error) {
      logger.warn(`Postgres write failed, using fallback memory store: ${(error as Error).message}`);
      memoryStore.set(record.id, record);
      memoryTokenIndex.set(record.download_token, record.id);
      return record;
    }
  }

  async getFileByToken(token: string): Promise<FileRecord | null> {
    try {
      const query = `SELECT * FROM files WHERE download_token = $1 LIMIT 1;`;
      const res = await pool.query(query, [token]);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (error) {
      logger.warn(`Postgres fetch by token failed, checking fallback memory store: ${(error as Error).message}`);
    }

    const fileId = memoryTokenIndex.get(token);
    if (fileId && memoryStore.has(fileId)) {
      return memoryStore.get(fileId)!;
    }
    return null;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    try {
      await pool.query(`UPDATE files SET download_count = download_count + 1 WHERE id = $1;`, [id]);
    } catch (error) {
      const record = memoryStore.get(id);
      if (record) {
        record.download_count += 1;
      }
    }
  }

  async updateFileStatus(id: string, status: 'active' | 'expired' | 'deleted'): Promise<void> {
    try {
      await pool.query(`UPDATE files SET status = $1 WHERE id = $2;`, [status, id]);
    } catch (error) {
      const record = memoryStore.get(id);
      if (record) {
        record.status = status;
      }
    }
  }

  async deleteFileRecord(id: string): Promise<void> {
    try {
      await pool.query(`DELETE FROM files WHERE id = $1;`, [id]);
    } catch (error) {
      const record = memoryStore.get(id);
      if (record) {
        memoryTokenIndex.delete(record.download_token);
        memoryStore.delete(id);
      }
    }
  }

  async getExpiredActiveFiles(): Promise<FileRecord[]> {
    const now = new Date();
    try {
      const query = `SELECT * FROM files WHERE expires_at <= NOW() AND status = 'active';`;
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      const expired: FileRecord[] = [];
      memoryStore.forEach((record) => {
        if (record.status === 'active' && new Date(record.expires_at) <= now) {
          expired.push(record);
        }
      });
      return expired;
    }
  }

  async getStats(): Promise<{
    totalUploads: number;
    totalDownloads: number;
    activeLinks: number;
    expiredLinks: number;
    totalBytesStored: number;
  }> {
    try {
      const res = await pool.query(`
        SELECT
          COUNT(*) as total_uploads,
          COALESCE(SUM(download_count), 0) as total_downloads,
          COUNT(*) FILTER (WHERE status = 'active' AND expires_at > NOW()) as active_links,
          COUNT(*) FILTER (WHERE status = 'expired' OR expires_at <= NOW()) as expired_links,
          COALESCE(SUM(file_size) FILTER (WHERE status = 'active' AND expires_at > NOW()), 0) as total_bytes_stored
        FROM files;
      `);
      const row = res.rows[0];
      return {
        totalUploads: parseInt(row.total_uploads || '0', 10),
        totalDownloads: parseInt(row.total_downloads || '0', 10),
        activeLinks: parseInt(row.active_links || '0', 10),
        expiredLinks: parseInt(row.expired_links || '0', 10),
        totalBytesStored: parseInt(row.total_bytes_stored || '0', 10),
      };
    } catch (error) {
      const now = new Date();
      let totalUploads = memoryStore.size;
      let totalDownloads = 0;
      let activeLinks = 0;
      let expiredLinks = 0;
      let totalBytesStored = 0;

      memoryStore.forEach((rec) => {
        totalDownloads += rec.download_count;
        if (rec.status === 'active' && new Date(rec.expires_at) > now) {
          activeLinks++;
          totalBytesStored += rec.file_size;
        } else {
          expiredLinks++;
        }
      });

      return { totalUploads, totalDownloads, activeLinks, expiredLinks, totalBytesStored };
    }
  }

  async getAllFiles(limit: number = 50): Promise<FileRecord[]> {
    try {
      const res = await pool.query(`SELECT * FROM files ORDER BY uploaded_at DESC LIMIT $1;`, [limit]);
      return res.rows;
    } catch (error) {
      return Array.from(memoryStore.values())
        .sort((a, b) => b.uploaded_at.getTime() - a.uploaded_at.getTime())
        .slice(0, limit);
    }
  }
}

export const fileService = new FileService();
