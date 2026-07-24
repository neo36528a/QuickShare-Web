'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Download,
  File,
  Lock,
  Clock,
  AlertTriangle,
  HardDrive,
  Share2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import CountdownTimer from '@/components/CountdownTimer';
import Toast from '@/components/Toast';
import { fetchFileDetails, verifyFilePassword, FileDetails } from '@/lib/api';
import { formatBytes } from '@/lib/utils';

export default function DownloadPage() {
  const params = useParams();
  const token = params?.token as string;

  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isPasswordVerified, setIsPasswordVerified] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetchFileDetails(token)
      .then((data) => {
        setFileDetails(data);
        if (!data.isPasswordProtected) {
          setIsPasswordVerified(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        setIsExpired(true);
        setLoading(false);
      });
  }, [token]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    try {
      const verified = await verifyFilePassword(token, password);
      if (verified) {
        setIsPasswordVerified(true);
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setPasswordError('Failed to verify password.');
    }
  };

  const triggerDownload = () => {
    if (!fileDetails) return;

    let downloadUrl = `/api/download/${token}/file`;
    if (fileDetails.isPasswordProtected && password) {
      downloadUrl += `?password=${encodeURIComponent(password)}`;
    }

    window.location.href = downloadUrl;
    setToastMessage('Download initiated from Google Drive!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <GlassCard hoverEffect={false} className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Retrieving download link metrics...</p>
        </GlassCard>
      </div>
    );
  }

  if (isExpired || !fileDetails) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <GlassCard hoverEffect={false} className="p-8 space-y-6 border-rose-500/30 bg-rose-950/10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">This link has expired.</h1>
            <p className="text-xs text-slate-400">
              The 30-minute download duration has elapsed. The file and associated records have been permanently purged from Google Drive.
            </p>
          </div>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl glass-button text-white text-xs font-bold shadow-lg"
          >
            Go to Homepage
          </a>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Toast message={toastMessage} />

      <GlassCard hoverEffect={false} className="p-8 border-brand-500/30">
        {/* File Header Details */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/20">
            <File className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white max-w-md mx-auto break-words">
            {fileDetails.originalName}
          </h1>

          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-medium">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
              {formatBytes(fileDetails.fileSize)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-brand-400" /> Google Drive Stream
            </span>
          </div>
        </div>

        {/* Live Expiration Countdown */}
        <div className="mb-8">
          <CountdownTimer
            initialSeconds={fileDetails.remainingSeconds}
            onExpire={() => setIsExpired(true)}
          />
        </div>

        {/* Password Protection Check */}
        {fileDetails.isPasswordProtected && !isPasswordVerified ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Password Protected Link</h3>
              <p className="text-xs text-slate-400 mt-0.5">Please enter the password set by the uploader to unlock download.</p>

              <div className="mt-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl glass-button text-white text-xs font-bold"
                >
                  Unlock
                </button>
              </div>

              {passwordError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">{passwordError}</p>
              )}
            </div>
          </form>
        ) : (
          /* Download Trigger Button */
          <div className="space-y-4 text-center">
            <button
              onClick={triggerDownload}
              className="w-full py-4 rounded-xl glass-button text-white font-bold text-base shadow-xl flex items-center justify-center gap-3 group"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              <span>Download File Now</span>
            </button>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-4 pt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> High Speed Direct Stream
              </span>
              {fileDetails.downloadOnce && (
                <span className="text-amber-400 font-semibold">• Download Once Link</span>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
