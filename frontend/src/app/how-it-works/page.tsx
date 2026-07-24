'use me';
'use client';

import Link from 'next/link';
import {
  UploadCloud,
  HardDrive,
  Clock,
  ShieldCheck,
  FileCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const steps = [
  {
    step: '01',
    title: 'Select & Upload File',
    description: 'Choose any file up to 5 GB (Videos, Archives, Documents, Images). Upload streams chunked directly into Google Drive.',
    icon: UploadCloud,
  },
  {
    step: '02',
    title: 'Google Drive Storage',
    description: 'QuickShare stores the file inside your designated Google Drive folder ("QuickShare Uploads") using OAuth 2.0.',
    icon: HardDrive,
  },
  {
    step: '03',
    title: 'Secure Link Generation',
    description: 'A 9-character random secure token is generated along with optional password protection & single-download flags.',
    icon: Lock,
  },
  {
    step: '04',
    title: '30-Minute Self Destruct',
    description: 'Our background worker checks every 60 seconds. Once 30 minutes elapse, the file is deleted from Google Drive automatically.',
    icon: Clock,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">How QuickShare Works</h1>
        <p className="text-slate-400 text-sm">
          A seamless flow connecting Google Drive API storage with automated 30-minute self-destruct security.
        </p>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {steps.map((item, idx) => (
          <GlassCard key={idx} hoverEffect={false} className="p-8 relative">
            <span className="text-4xl font-extrabold text-brand-500/20 absolute top-4 right-6 font-mono">
              {item.step}
            </span>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
          </GlassCard>
        ))}
      </div>

      {/* CTA Box */}
      <div className="text-center">
        <Link
          href="/upload"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl glass-button text-white font-bold text-base shadow-xl"
        >
          <span>Try Uploading a File</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
