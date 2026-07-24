-- QuickShare PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    drive_file_id VARCHAR(255) NOT NULL,
    original_name VARCHAR(512) NOT NULL,
    stored_name VARCHAR(512) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream',
    download_token VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    download_once BOOLEAN NOT NULL DEFAULT FALSE,
    download_count INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- active, expired, deleted
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_download_token ON files(download_token);
CREATE INDEX IF NOT EXISTS idx_files_status_expires ON files(status, expires_at);

CREATE TABLE IF NOT EXISTS cleanup_logs (
    id SERIAL PRIMARY KEY,
    files_deleted INT NOT NULL DEFAULT 0,
    space_freed_bytes BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL,
    details TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(128) NOT NULL,
    file_id VARCHAR(36),
    ip_address VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
