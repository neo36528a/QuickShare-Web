# QuickShare - Architecture & System Design Documentation

QuickShare is designed as a high-performance, modular temporary file sharing platform. It decouples high-capacity cloud storage (Google Drive API) from metadata management (PostgreSQL) and client streaming logic.

---

## 1. System Architecture Diagram

```
                                 ┌────────────────────────┐
                                 │     Client Browser     │
                                 └───────────┬────────────┘
                                             │
                                     (HTTP / HTTPS)
                                             │
                                             ▼
                                 ┌────────────────────────┐
                                 │  Nginx Reverse Proxy   │
                                 │ (client_max_body 5GB)  │
                                 └─────┬──────────────┬───┘
                                       │              │
                    ┌──────────────────┘              └──────────────────┐
                    │                                                    │
                    ▼                                                    ▼
    ┌───────────────────────────────┐                    ┌───────────────────────────────┐
    │     Next.js 14 Frontend       │                    │    Express TypeScript Backend │
    │ (React, Framer Motion, Tailwind)                   │  (Auth, Stream Pipe, Cron)   │
    └───────────────────────────────┘                    └──────────────┬────────────────┘
                                                                        │
                                              ┌─────────────────────────┼─────────────────────────┐
                                              ▼                         ▼                         ▼
                                    ┌──────────────────┐      ┌───────────────────┐     ┌───────────────────┐
                                    │ Google Drive API │      │ PostgreSQL DB     │     │ Cron Cleanup Job  │
                                    │ (OAuth 2.0 Pipe) │      │ (Files & Logs)    │     │ (Every 60s)       │
                                    └──────────────────┘      └───────────────────┘     └───────────────────┘
```

---

## 2. Database ERD & Schema Design

### `files` Table
- `id` (UUID, Primary Key)
- `drive_file_id` (VARCHAR): Google Drive file identifier
- `original_name` (VARCHAR): User file title
- `stored_name` (VARCHAR): Collision-free storage filename
- `file_size` (BIGINT): File size in bytes (up to 5GB)
- `mime_type` (VARCHAR): Multipurpose Internet Mail Extensions type
- `download_token` (VARCHAR, UNIQUE Index): Random 9-character access token
- `password_hash` (VARCHAR): Optional bcrypt hash for protected links
- `download_once` (BOOLEAN): Auto-delete flag after 1 download
- `download_count` (INT): Incremental download tracking counter
- `status` (VARCHAR): `active`, `expired`, `deleted`
- `uploaded_at` (TIMESTAMP): Upload timestamp
- `expires_at` (TIMESTAMP Index): Upload timestamp + 30 minutes

### `cleanup_logs` Table
- `id` (SERIAL Primary Key)
- `files_deleted` (INT): Number of files purged in cycle
- `space_freed_bytes` (BIGINT): Total space recovered
- `status` (VARCHAR): `success` or `failed`
- `executed_at` (TIMESTAMP)

---

## 3. Core Workflow Sequences

### A. Upload Sequence
1. User selects file (up to 5 GB).
2. Frontend creates stream request (`POST /api/upload`).
3. Express streams file buffer directly into Google Drive API (`drive.files.create`) inside `QuickShare Uploads` folder.
4. Server generates random 9-character token (e.g. `a8X9LmQ4Y`) and sets `expires_at = NOW() + 30 MIN`.
5. PostgreSQL stores file record and returns secure download URL.

### B. Download & Stream Sequence
1. Recipient opens `/download/a8X9LmQ4Y`.
2. Backend validates token and checks `expires_at > NOW()`.
3. If password protected, verifies password with bcrypt.
4. Express pipes stream directly from Google Drive (`drive.files.get alt=media`) to HTTP response headers.
5. If `download_once = true`, file is deleted immediately after stream completion.

### C. Automatic Cleanup Sequence
1. Background `node-cron` job runs every 60 seconds.
2. Queries PostgreSQL: `SELECT * FROM files WHERE expires_at <= NOW() AND status = 'active'`.
3. For each expired file:
   - Calls `drive.files.delete(driveFileId)`.
   - Deletes PostgreSQL record.
   - Saves entry in `cleanup_logs`.

---

## 4. Security Controls

- **Zero Memory Buffering**: Diskless stream piping for large files.
- **Helmet Headers**: Content Security Policy, XSS Protection, HSTS.
- **Rate Limiting**: IP-based rate limiting on upload and API endpoints.
- **Parametrized SQL Queries**: Built-in SQL injection protection via `pg.Pool`.
- **Random Tokens & File Names**: Hard-to-guess 9-character tokens and hex collision protection.
