import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'QuickShare - Secure Temporary File Sharing (Google Drive)',
  description: 'Upload files up to 5 GB securely stored in Google Drive. Generates 30-minute self-destructing download links with auto-cleanup.',
  keywords: ['file sharing', 'temporary files', 'google drive storage', 'secure upload', 'auto delete files'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-slate-100 min-h-screen flex flex-col relative overflow-x-hidden selection:bg-brand-500 selection:text-white">
        {/* Background Radial Lights */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-hero-radial pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none z-0" />
        
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
