'use me';
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  ShieldCheck,
  Clock,
  HardDrive,
  QrCode,
  Lock,
  Zap,
  Smartphone,
  RefreshCw,
  FileCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const features = [
  {
    icon: UploadCloud,
    title: 'Upload Up to 5 GB',
    description: 'Support for massive files including videos, ISOs, ZIPs, and disk images.',
    color: 'text-brand-400 bg-brand-500/10',
  },
  {
    icon: HardDrive,
    title: 'Google Drive Storage',
    description: 'Files are safely stored in your isolated QuickShare Uploads Drive folder.',
    color: 'text-purple-400 bg-purple-500/10',
  },
  {
    icon: Clock,
    title: '30-Minute Auto Purge',
    description: 'Files and database records auto-delete completely after 30 minutes.',
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: Lock,
    title: 'Password Protection',
    description: 'Optional bcrypt password hash encryption for shared sensitive files.',
    color: 'text-indigo-400 bg-indigo-500/10',
  },
  {
    icon: QrCode,
    title: 'Instant QR Code Sharing',
    description: 'Generate dynamic QR codes for effortless scanning on mobile devices.',
    color: 'text-amber-400 bg-amber-500/10',
  },
  {
    icon: RefreshCw,
    title: 'Resumable Chunked Uploads',
    description: 'Pause, resume, or recover interrupted uploads without losing progress.',
    color: 'text-cyan-400 bg-cyan-500/10',
  },
  {
    icon: Zap,
    title: 'High-Speed Streaming',
    description: 'Direct stream piping from Google Drive API with zero disk buffering latency.',
    color: 'text-rose-400 bg-rose-500/10',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Beautiful glassmorphic UI engineered to look stunning on all screen sizes.',
    color: 'text-teal-400 bg-teal-500/10',
  },
  {
    icon: FileCheck,
    title: 'Download Once Option',
    description: 'Self-destruct link immediately after the first successful download.',
    color: 'text-sky-400 bg-sky-500/10',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6 shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Production-Ready Temporary File Storage</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          QuickShare
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-indigo-300">
            Share Files Securely With 30-Min Expiry
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Upload files up to <strong className="text-white font-semibold">5 GB</strong> stored directly in your connected{' '}
          <strong className="text-brand-400 font-semibold">Google Drive</strong>. Secure links auto-expire and shred files from storage after 30 minutes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-button text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl group"
          >
            <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Upload Files Now</span>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-base flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
          >
            <span>How It Works</span>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Built for High Performance & Complete Privacy</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to share large documents, videos, and archives with automated cloud cleanup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <GlassCard key={idx}>
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Security Callout Banner */}
      <GlassCard hoverEffect={false} className="border-brand-500/30 bg-gradient-to-r from-brand-950/40 to-purple-950/40 p-8 sm:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Automated 60-Second Background Shredder</h3>
              <p className="text-slate-300 text-sm max-w-xl">
                Every minute, our automated Node-Cron task scans Google Drive and deletes expired files, database records, and temporary streams permanently.
              </p>
            </div>
          </div>
          <Link
            href="/upload"
            className="px-6 py-3 rounded-xl bg-white text-dark-bg font-bold text-sm hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Start Sharing Files
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
