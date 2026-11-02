import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  icon: Icon,
  iconColor = '#5269D9',
  iconBg = '#EEF1FC',
  className = ''
}) => {
  return (
    <div className={`space-y-2 pb-1 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-[11px] font-medium text-[#718096]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {crumb.onClick && !isLast ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-[#5269D9] transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-[#182338] font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3 h-3 text-[#A0AEC0] shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#182338] tracking-tight leading-tight">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#718096] mt-0.5 leading-normal max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
