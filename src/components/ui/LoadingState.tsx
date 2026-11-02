import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton-cards' | 'skeleton-table' | 'fullscreen';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  type = 'spinner',
  className = ''
}) => {
  if (type === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-2xs"
      >
        <Loader2 className="w-8 h-8 text-[#5269D9] animate-spin" />
        <p className="text-xs font-semibold text-[#182338] mt-3">{message}</p>
      </div>
    );
  }

  if (type === 'skeleton-cards') {
    return (
      <div role="status" aria-live="polite" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E9F0] p-4 space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-100 rounded w-1/2"></div>
              <div className="w-7 h-7 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-6 bg-slate-100 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (type === 'skeleton-table') {
    return (
      <div role="status" aria-live="polite" className={`bg-white rounded-xl border border-[#E5E9F0] p-4 space-y-3 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-slate-100 rounded flex-1"></div>
            <div className="h-4 bg-slate-100 rounded flex-1"></div>
            <div className="h-4 bg-slate-100 rounded flex-1"></div>
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center space-y-2 ${className}`}
    >
      <Loader2 className="w-6 h-6 text-[#5269D9] animate-spin" />
      <p className="text-xs font-medium text-[#718096]">{message}</p>
    </div>
  );
};
