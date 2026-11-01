import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#E8EAF0] bg-[#F7F8FC]/50 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-[#EEF1FC] text-[#5269D9] flex items-center justify-center mx-auto mb-3 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-[#20283A] mb-1">{title}</h4>
      <p className="text-xs text-[#737D90] max-w-sm mx-auto mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
