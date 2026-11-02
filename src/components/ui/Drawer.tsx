import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl'
  }[size];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${sizeClasses} bg-white shadow-2xl border-l border-[#E5E9F0] flex flex-col justify-between animate-in slide-in-from-right duration-200 ${className}`}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FAFBFD] shrink-0">
            <div>
              <h3 className="text-sm font-bold text-[#182338] tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-[#718096] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#718096] hover:text-[#182338] hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs text-[#182338] space-y-4">
            {children}
          </div>

          {/* Drawer Footer */}
          {footer && (
            <div className="p-4 border-t border-[#E5E9F0] bg-[#FAFBFD] flex items-center justify-end gap-2.5 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
