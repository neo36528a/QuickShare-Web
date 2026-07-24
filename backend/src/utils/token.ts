import crypto from 'crypto';

/**
 * Generates a random, secure, URL-friendly download token.
 * E.g., 'a8X9LmQ4Y'
 */
export function generateDownloadToken(length: number = 9): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Generates a random stored file name to avoid collisons in storage.
 */
export function generateStoredFileName(originalName: string): string {
  const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
  const randomHex = crypto.randomBytes(12).toString('hex');
  return `quickshare_${Date.now()}_${randomHex}${ext}`;
}
