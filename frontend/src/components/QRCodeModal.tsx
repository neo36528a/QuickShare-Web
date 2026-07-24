'use client';

import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
}

export default function QRCodeModal({ isOpen, onClose, url, fileName }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card max-w-sm w-full p-6 rounded-2xl flex flex-col items-center relative text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
            <QrCode className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">Scan QR Code</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-[240px] truncate">
            Scan with your mobile camera to open link for <span className="text-slate-200 font-semibold">{fileName}</span>
          </p>

          <div className="p-4 bg-white rounded-xl shadow-2xl mb-4 border border-slate-200">
            <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Share2 className="w-3 h-3 text-brand-400" /> Download link valid for 30 minutes
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
