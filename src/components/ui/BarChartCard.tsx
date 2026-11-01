import React, { useState, useRef } from 'react';
import { ChartLegend, type LegendItem } from './ChartLegend';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { EmptyChartState } from './EmptyChartState';

export interface BarDataPoint {
  label: string;
  primary: number;
  secondary: number;
  primaryLabel?: string;
  secondaryLabel?: string;
}

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: BarDataPoint[];
  primaryColor?: string;
  secondaryColor?: string;
  headerAction?: React.ReactNode;
  height?: number;
  loading?: boolean;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  subtitle,
  data,
  primaryColor = '#5269D9',
  secondaryColor = '#16A36A',
  headerAction,
  height = 160,
  loading = false
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs animate-pulse" style={{ height }}>
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
        <div className="h-28 bg-slate-50 rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs">
        <EmptyChartState height={height} />
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.primary, d.secondary, 1)), 10);
  const chartHeight = 110;
  const chartWidth = 500;
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.min(18, barGroupWidth * 0.32);

  const legendItems: LegendItem[] = [
    { label: data[0]?.primaryLabel || 'Primary', color: primaryColor },
    { label: data[0]?.secondaryLabel || 'Secondary', color: secondaryColor }
  ];

  const handleMouseMove = (e: React.MouseEvent, idx: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setHoverIndex(idx);
    }
  };

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;
  const tooltipRows: TooltipRow[] = activePoint ? [
    { label: activePoint.primaryLabel || 'Primary', value: activePoint.primary.toLocaleString(), color: primaryColor },
    { label: activePoint.secondaryLabel || 'Secondary', value: activePoint.secondary.toLocaleString(), color: secondaryColor }
  ] : [];

  return (
    <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 sm:p-4 shadow-2xs flex flex-col justify-between relative overflow-hidden" ref={containerRef}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#20283A] leading-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#737D90] leading-tight mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <ChartLegend items={legendItems} size="sm" />
          {headerAction}
        </div>
      </div>

      <div className="w-full relative pt-1">
        <svg
          className="w-full overflow-visible"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          style={{ height: `${height}px` }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Gridlines */}
          {[0, 35, 70, 105].map((y, i) => (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#F1F4F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Bar Groups */}
          {data.map((d, i) => {
            const groupX = i * barGroupWidth;
            const centerX = groupX + barGroupWidth / 2;
            const primaryHeight = (d.primary / maxVal) * (chartHeight - 15);
            const secondaryHeight = (d.secondary / maxVal) * (chartHeight - 15);

            return (
              <g
                key={i}
                className="cursor-pointer transition-opacity"
                opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
                onMouseMove={(e) => handleMouseMove(e, i)}
              >
                {/* Primary Bar */}
                <rect
                  x={centerX - barWidth - 1.5}
                  y={chartHeight - primaryHeight}
                  width={barWidth}
                  height={Math.max(2, primaryHeight)}
                  rx={3}
                  fill={primaryColor}
                />
                {/* Secondary Bar */}
                <rect
                  x={centerX + 1.5}
                  y={chartHeight - secondaryHeight}
                  width={barWidth}
                  height={Math.max(2, secondaryHeight)}
                  rx={3}
                  fill={secondaryColor}
                />
              </g>
            );
          })}
        </svg>

        {/* X labels */}
        <div className="flex justify-between text-[10px] font-medium text-[#737D90] px-1 mt-1">
          {data.map((d, i) => (
            <span key={i} className={`truncate ${hoverIndex === i ? 'text-[#5269D9] font-bold' : ''}`}>
              {d.label}
            </span>
          ))}
        </div>

        {activePoint && (
          <ChartTooltip
            x={tooltipPos.x}
            y={tooltipPos.y}
            title={activePoint.label}
            rows={tooltipRows}
            visible={hoverIndex !== null}
          />
        )}
      </div>
    </div>
  );
};

