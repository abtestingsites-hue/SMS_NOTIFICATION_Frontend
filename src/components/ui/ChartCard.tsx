import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  footer,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#20283A] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#737D90] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
        <div>{children}</div>
      </div>
      {footer && <div className="mt-4 pt-3 border-t border-[#F1F4F9] text-xs text-[#737D90]">{footer}</div>}
    </div>
  );
};

