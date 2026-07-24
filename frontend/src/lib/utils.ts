import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');
  return `${formattedMins}:${formattedSecs}`;
}

export function calculateEta(bytesUploaded: number, totalBytes: number, speedBytesPerSec: number): string {
  if (speedBytesPerSec <= 0 || bytesUploaded >= totalBytes) return '0s';
  const remainingBytes = totalBytes - bytesUploaded;
  const remainingSeconds = Math.ceil(remainingBytes / speedBytesPerSec);

  if (remainingSeconds < 60) return `${remainingSeconds}s`;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
