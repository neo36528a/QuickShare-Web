'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
}

export default function Toast({ message, type = 'success' }: ToastProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${
          type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
