'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UploadCloud,
  Download,
  Clock,
  HardDrive,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Toast from '@/components/Toast';
import { fetchAdminData, deleteAdminFile, triggerCleanup } from '@/lib/api';
import { formatBytes } from '@/lib/utils';

export default function AdminPage() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchAdminData()
      .then((data) => {
        setAdminData(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to immediately delete this file from Google Drive?')) return;
    try {
      await deleteAdminFile(id);
      setToastMessage('File deleted permanently.');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  const handleManualCleanup = async () => {
    try {
      const result = await triggerCleanup();
      setToastMessage(`Manual cleanup executed: ${result.data.filesDeleted} files purged.`);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err) {
      alert('Failed to execute manual cleanup.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-300">Loading admin dashboard metrics...</p>
      </div>
    );
  }

  const stats = adminData?.stats;
  const recentUploads = adminData?.recentUploads || [];
  const cleanupLogs = adminData?.cleanupLogs || [];

  const filteredUploads = recentUploads.filter((f: any) =>
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.downloadToken.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const driveQuota = stats?.driveQuota || { usedBytes: 0, totalBytes: 15 * 1024 * 1024 * 1024 };
  const storagePercentage = Math.min(100, Math.round((driveQuota.usedBytes / driveQuota.totalBytes) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Toast message={toastMessage} />

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-brand-400" /> Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live monitoring, storage stats & manual cleanup controls</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleManualCleanup}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trigger Cleanup</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <GlassCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Uploads</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalUploads || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <UploadCloud className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Downloads</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalDownloads || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Download className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Links</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats?.activeLinks || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expired Links</p>
              <h3 className="text-2xl font-bold text-slate-400 mt-1">{stats?.expiredLinks || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 text-slate-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Google Drive Storage Meter */}
      <GlassCard hoverEffect={false} className="mb-8 p-6 border-brand-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Google Drive Storage Quota</h3>
              <p className="text-xs text-slate-400">Active QuickShare storage consumption metrics</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-white">{formatBytes(driveQuota.usedBytes)}</span>
            <span className="text-xs text-slate-400"> / {formatBytes(driveQuota.totalBytes)} ({storagePercentage}%)</span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500"
            style={{ width: `${Math.max(2, storagePercentage)}%` }}
          />
        </div>
      </GlassCard>

      {/* File Explorer Table */}
      <GlassCard hoverEffect={false} className="p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-white">Uploaded File Records</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search file name or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUploads.length > 0 ? (
                filteredUploads.map((file: any) => (
                  <tr key={file.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">{file.originalName}</td>
                    <td className="py-3 px-4 text-slate-400">{formatBytes(file.fileSize)}</td>
                    <td className="py-3 px-4 font-mono text-brand-400">{file.downloadToken}</td>
                    <td className="py-3 px-4">{file.downloadCount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          file.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete file permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No files found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Cleanup Audit Logs */}
      <GlassCard hoverEffect={false} className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Background Cleanup Execution Logs</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {cleanupLogs.map((log: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">{log.details || 'Automated cleanup cycle'}</p>
                  <p className="text-[10px] text-slate-400">{new Date(log.executed_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-300 font-mono">{log.files_deleted} deleted</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
