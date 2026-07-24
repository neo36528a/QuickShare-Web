import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'quickshare',
    password: process.env.DB_PASSWORD || 'quickshare_secret',
    name: process.env.DB_NAME || 'quickshare_db',
  },

  // Google Drive Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    folderName: process.env.GOOGLE_DRIVE_FOLDER_NAME || 'QuickShare Uploads',
  },

  // Expiration & Limits
  fileExpirationMinutes: parseInt(process.env.FILE_EXPIRATION_MINUTES || '30', 10),
  maxUploadSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '5368709120', 10), // 5 GB
  
  // Admin Key
  adminApiKey: process.env.ADMIN_API_KEY || 'quickshare_admin_secret_key_123',
};
