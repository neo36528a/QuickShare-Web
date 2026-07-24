'use client';

import Link from 'next/link';
import { Share2, Shield, HardDrive, LayoutDashboard, HelpCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-bg/80 border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-500">
                QuickShare
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1">
                <HardDrive className="w-2.5 h-2.5 text-brand-500" /> Google Drive Powered
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-4">
            <Link
              href="/upload"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-brand-500" />
              <span>Upload</span>
            </Link>

            <Link
              href="/how-it-works"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">How It Works</span>
            </Link>

            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            <div className="pl-2 border-l border-dark-border">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Auto-Purge Active
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
