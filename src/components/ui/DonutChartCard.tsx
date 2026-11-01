import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  footer?: React.ReactNode;
}

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  title,
  subtitle,
  segments,
  centerLabel = 'Total',
  centerValue,
  height = 140,
  footer
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // SVG Donut calculations
  const size = 110;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-xs sm:text-sm font-bold text-[#20283A] leading-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#737D90] leading-tight mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center justify-between gap-4 py-1" style={{ minHeight: `${height}px` }}>
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#F1F4F9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {total > 0 && segments.map((seg, i) => {
              const segPercent = seg.value / total;
              const strokeDasharray = `${segPercent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += segPercent;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-[#20283A] leading-tight">
              {centerValue !== undefined ? centerValue : total.toLocaleString()}
            </span>
            <span className="text-[9px] text-[#737D90] font-medium leading-tight">{centerLabel}</span>
          </div>
        </div>

        {/* Legend / Metrics list */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {segments.map((seg, i) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-[#20283A] font-medium text-[11px] truncate">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="font-semibold text-[#20283A]">{seg.value.toLocaleString()}</span>
                  <span className="text-[#737D90] text-[10px] w-7 text-right">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {footer && (
        <div className="pt-2 mt-2 border-t border-[#F1F4F9] text-xs text-[#737D90]">
          {footer}
        </div>
      )}
    </div>
  );
};

