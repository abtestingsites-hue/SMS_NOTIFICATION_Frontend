import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  helperText,
  error,
  tooltip,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-1.5">
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold text-[#182338] flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && <span className="text-[#D94D59] font-bold">*</span>}
          {tooltip && (
            <span className="text-[#A0AEC0] hover:text-[#718096] transition-colors cursor-help" title={tooltip}>
              <HelpCircle className="w-3 h-3" />
            </span>
          )}
        </label>
      </div>

      <div>{children}</div>

      {error ? (
        <p className="text-[11px] font-medium text-[#D94D59] flex items-center gap-1 animate-in fade-in">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#718096]">{helperText}</p>
      ) : null}
    </div>
  );
};

