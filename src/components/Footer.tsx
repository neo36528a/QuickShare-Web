'use client';

import { ShieldCheck, HardDrive, Clock, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-dark-border bg-dark-bg/60 backdrop-blur-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-sm text-slate-400">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Google Drive API Storage</h4>
              <p className="text-xs text-slate-400 mt-1">Files up to 5 GB stored directly in a dedicated Google Drive folder.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">30-Minute Expiration</h4>
              <p className="text-xs text-slate-400 mt-1">Automatic cron task purges Google Drive & DB records every 60 seconds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Encrypted Links</h4>
              <p className="text-xs text-slate-400 mt-1">Optional bcrypt password protection & single-download auto expiry.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Zero Retention</h4>
              <p className="text-xs text-slate-400 mt-1">Files are permanently shredded with no trace left behind after expiration.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-dark-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QuickShare. All rights reserved. Built with Next.js, Express & Google Drive API.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-300 transition-colors">Privacy First</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Max File 5GB</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Node.js Stream Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
