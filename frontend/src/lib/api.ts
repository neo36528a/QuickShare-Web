const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface UploadResponse {
  fileId: string;
  originalName: string;
  fileSize: number;
  downloadToken: string;
  downloadUrl: string;
  uploadedAt: string;
  expiresAt: string;
  expirationMinutes: number;
  isPasswordProtected: boolean;
  downloadOnce: boolean;
}

export interface FileDetails {
  fileId: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  downloadToken: string;
  downloadCount: number;
  uploadedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  isPasswordProtected: boolean;
  downloadOnce: boolean;
}

export async function fetchFileDetails(token: string): Promise<FileDetails> {
  const res = await fetch(`${API_BASE}/download/${token}`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || 'Link has expired or file does not exist.');
  }

  return data.data;
}

export async function verifyFilePassword(token: string, password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/download/${token}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  return data.success && data.verified;
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch stats');
  return data.data;
}

export async function fetchAdminData() {
  const res = await fetch(`${API_BASE}/admin/overview`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch admin overview');
  return data.data;
}

export async function deleteAdminFile(id: string) {
  const res = await fetch(`${API_BASE}/admin/files/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete file');
  return data;
}

export async function triggerCleanup() {
  const res = await fetch(`${API_BASE}/cleanup`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to trigger cleanup');
  return data;
}
