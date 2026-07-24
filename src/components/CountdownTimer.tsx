'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  className?: string;
}

export default function CountdownTimer({ initialSeconds, onExpire, className = '' }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const percentage = Math.max(0, Math.min(100, (secondsLeft / 1800) * 100)); // 1800s = 30min
  const isUrgent = secondsLeft < 300; // less than 5 mins

  return (
    <div className={`flex items-center space-x-3 bg-dark-bg/60 border ${isUrgent ? 'border-amber-500/40 bg-amber-500/5' : 'border-brand-500/30'} px-4 py-2.5 rounded-xl ${className}`}>
      {isUrgent ? (
        <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
      ) : (
        <Clock className="w-5 h-5 text-brand-400 animate-pulse" />
      )}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Link Expiry Countdown
        </span>
        <span className={`text-xl font-mono font-bold ${isUrgent ? 'text-amber-400' : 'text-brand-400'}`}>
          {formatTimeRemaining(secondsLeft)}
        </span>
      </div>
      
      {/* Progress Indicator */}
      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-auto">
        <div
          className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-amber-400' : 'bg-gradient-to-r from-brand-500 to-purple-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
