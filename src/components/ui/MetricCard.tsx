import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  previousValue?: string;
  change?: number; // e.g. +12.5 or -3.2
  trendText?: string;
  periodComparison?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  actionLabel?: string;
  onAction?: () => void;
  subtitle?: string;
  tooltip?: string;
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trendText = 'vs last period',
  periodComparison,
  icon: Icon,
  iconColor = '#5269D9',
  iconBg = '#EEF1FC',
  actionLabel,
  onAction,
  subtitle,
  tooltip,
  compact = false
}) => {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined;

  if (compact) {
    return (
      <div
        className="bg-white rounded-xl border border-[#E8EAF0] p-2.5 sm:p-3 shadow-2xs transition-all hover:border-[#D6DAE5] flex flex-col justify-between relative group"
        title={tooltip}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] font-medium text-[#737D90] truncate leading-tight">{label}</span>
            {tooltip && (
              <span className="text-[#A4ADBD] group-hover:text-[#737D90] transition-colors cursor-help">
                <HelpCircle className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-1">
          <div className="text-lg xl:text-xl font-bold text-[#20283A] tracking-tight leading-none truncate">
            {value}
          </div>
          {hasChange ? (
            <span
              className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                isPositive ? 'bg-[#E8F7F0] text-[#16A36A]' : 'bg-[#FDF0F1] text-[#D94D59]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          ) : (
            <span className="text-[10px] text-[#A4ADBD] font-mono shrink-0">
              {periodComparison || 'steady'}
            </span>
          )}
        </div>

        {(subtitle || periodComparison) && (
          <div className="text-[10px] text-[#737D90] truncate mt-0.5">
            {subtitle || periodComparison}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 sm:p-5 shadow-xs transition-all hover:border-[#D6DAE5] hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#737D90] tracking-tight">{label}</span>
            {tooltip && (
              <span className="text-[#A4ADBD] hover:text-[#737D90] transition-colors cursor-help" title={tooltip}>
                <HelpCircle className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-[#20283A] tracking-tight">{value}</div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#F1F4F9] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasChange && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-semibold text-[11px] ${
                isPositive ? 'bg-[#E8F7F0] text-[#16A36A]' : 'bg-[#FDF0F1] text-[#D94D59]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          )}
          <span className="text-[11px] text-[#737D90]">{subtitle || periodComparison || trendText}</span>
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="font-semibold text-[#5269D9] hover:text-[#4056C4] cursor-pointer transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
