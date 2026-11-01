import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-[#20283A] tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-[#737D90] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};

