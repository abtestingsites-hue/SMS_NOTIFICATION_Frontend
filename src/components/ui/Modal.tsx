import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
  }[size];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${sizeClasses} bg-white rounded-xl shadow-xl border border-[#E5E9F0] flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#E5E9F0] shrink-0 bg-[#FAFBFD]">
          <div>
            <h3 className="text-base font-bold text-[#182338] tracking-tight">{title}</h3>
            {description && <p className="text-xs text-[#718096] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#718096] hover:text-[#182338] hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs text-[#182338] space-y-4">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-[#FAFBFD] border-t border-[#E5E9F0] flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

