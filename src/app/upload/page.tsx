'use me';
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  File,
  X,
  Pause,
  Play,
  CheckCircle2,
  Copy,
  QrCode,
  Lock,
  EyeOff,
  Share2,
  HardDrive,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import CountdownTimer from '@/components/CountdownTimer';
import QRCodeModal from '@/components/QRCodeModal';
import Toast from '@/components/Toast';
import { formatBytes, calculateEta } from '@/lib/utils';
import { UploadResponse } from '@/lib/api';

const MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [downloadOnce, setDownloadOnce] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0); // Bytes / sec
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Result State
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`Selected file exceeds maximum allowable limit of 5 GB (${formatBytes(file.size)}).`);
      return;
    }
    setSelectedFile(file);
  };

  const startUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setIsPaused(false);
    setProgress(0);
    setUploadedBytes(0);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (password.trim()) {
      formData.append('password', password.trim());
    }
    if (downloadOnce) {
      formData.append('downloadOnce', 'true');
    }

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    let startTime = Date.now();
    let prevLoaded = 0;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const now = Date.now();
        const timeDiffSec = (now - startTime) / 1000;

        if (timeDiffSec > 0.5) {
          const loadedDiff = event.loaded - prevLoaded;
          const currentSpeed = loadedDiff / timeDiffSec;
          setUploadSpeed(currentSpeed);

          startTime = now;
          prevLoaded = event.loaded;
        }

        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
        setUploadedBytes(event.loaded);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            setUploadResult(response.data);
            setIsUploading(false);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } else {
            setErrorMessage(response.error || 'Upload failed');
            setIsUploading(false);
          }
        } catch (e) {
          setErrorMessage('Invalid server response during upload.');
          setIsUploading(false);
        }
      } else {
        setErrorMessage(`Upload failed with server status ${xhr.status}`);
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      setErrorMessage('Network error occurred during upload.');
      setIsUploading(false);
    };

    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  };

  const togglePauseUpload = () => {
    if (isPaused) {
      setIsPaused(false);
      startUpload();
    } else {
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
      setIsPaused(true);
    }
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setIsUploading(false);
    setIsPaused(false);
    setProgress(0);
    setUploadedBytes(0);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsUploading(false);
    setProgress(0);
    setPassword('');
    setDownloadOnce(false);
  };

  const fullDownloadUrl = uploadResult
    ? typeof window !== 'undefined'
      ? `${window.location.origin}${uploadResult.downloadUrl}`
      : uploadResult.downloadUrl
    : '';

  const copyToClipboard = () => {
    if (fullDownloadUrl) {
      navigator.clipboard.writeText(fullDownloadUrl);
      setToastMessage('Download link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Toast message={toastMessage} />

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Upload Files</h1>
        <p className="text-slate-400 text-sm">
          Select files up to <span className="text-brand-400 font-semibold">5 GB</span> to store securely in Google Drive.
        </p>
      </div>

      <GlassCard hoverEffect={false} className="p-8 sm:p-10 border-brand-500/20">
        <AnimatePresence mode="wait">
          {!uploadResult ? (
            <motion.div key="upload-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  selectedFile
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
                  <UploadCloud className="w-8 h-8 text-white animate-pulse-slow" />
                </div>

                {!selectedFile ? (
                  <>
                    <h3 className="text-lg font-bold text-white mb-1">Drag and drop your file here</h3>
                    <p className="text-xs text-slate-400 mb-4">Support for Images, Videos, Documents, PDF, ZIP, RAR, APK, ISO & more</p>
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-xl glass-button text-white text-xs font-bold shadow-lg"
                    >
                      Browse Files
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-700 max-w-full">
                      <File className="w-6 h-6 text-brand-400 flex-shrink-0" />
                      <div className="text-left truncate max-w-xs sm:max-w-md">
                        <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar Section */}
              {isUploading && selectedFile && (
                <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>
                      {isPaused ? 'Paused' : 'Uploading to Google Drive...'} ({progress}%)
                    </span>
                    <span>
                      {formatBytes(uploadedBytes)} / {formatBytes(selectedFile.size)}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Speed: {formatBytes(uploadSpeed)}/s</span>
                    <span>ETA: {calculateEta(uploadedBytes, selectedFile.size, uploadSpeed)}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={togglePauseUpload}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={cancelUpload}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Security Controls */}
              {!isUploading && selectedFile && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-brand-400" /> Password Protect Link (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Set access password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 self-end">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-purple-400" />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white">Download Once</p>
                        <p className="text-[10px] text-slate-400">Expire after 1st download</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={downloadOnce}
                      onChange={(e) => setDownloadOnce(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload Button */}
              {selectedFile && !isUploading && (
                <button
                  type="button"
                  onClick={startUpload}
                  className="w-full mt-6 py-4 rounded-xl glass-button text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload To Google Drive</span>
                </button>
              )}
            </motion.div>
          ) : (
            /* Upload Success Result Card */
            <motion.div
              key="upload-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Upload Complete!</h3>
                <p className="text-xs text-slate-400 mt-1">Your file is safely stored in Google Drive and ready for download.</p>
              </div>

              {/* Expiration Timer Card */}
              <div className="max-w-md mx-auto">
                <CountdownTimer initialSeconds={uploadResult.expirationMinutes * 60} />
              </div>

              {/* Download Link Input */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-400 text-left">Secure Download Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullDownloadUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-brand-300"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-md"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <span>QR Code</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'QuickShare File Download',
                          url: fullDownloadUrl,
                        });
                      } else {
                        copyToClipboard();
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4 text-brand-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={resetAll}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Upload Another File
                </button>
              </div>

              <QRCodeModal
                isOpen={showQrModal}
                onClose={() => setShowQrModal(false)}
                url={fullDownloadUrl}
                fileName={uploadResult.originalName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
