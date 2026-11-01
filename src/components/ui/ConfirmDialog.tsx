import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#E8EAF0] overflow-hidden">
        <div className="p-5 flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              confirmVariant === 'danger' ? 'bg-[#FDF0F1] text-[#D94D59]' : 'bg-[#EEF1FC] text-[#5269D9]'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#20283A]">{title}</h3>
            <p className="text-xs text-[#737D90] leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#F7F8FC] border-t border-[#E8EAF0] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg border border-[#E8EAF0] bg-white text-xs font-semibold text-[#20283A] hover:bg-[#F1F4F9] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
              confirmVariant === 'danger'
                ? 'bg-[#D94D59] hover:bg-[#C23C48]'
                : 'bg-[#5269D9] hover:bg-[#4056C4]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

