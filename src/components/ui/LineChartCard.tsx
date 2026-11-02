import React, { useState, useRef } from 'react';
import { ChartLegend, type LegendItem } from './ChartLegend';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { EmptyChartState } from './EmptyChartState';

export interface DataPoint {
  label: string;
  sent: number;
  delivered: number;
  failed?: number;
  rate?: number;
}

interface LineChartCardProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  headerAction?: React.ReactNode;
  height?: number;
  loading?: boolean;
}

export const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  subtitle,
  data,
  headerAction,
  height = 180,
  loading = false
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs flex flex-col justify-between" style={{ height }}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="h-32 bg-slate-50 rounded-lg animate-pulse" />
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

  const maxVal = Math.max(...data.map(d => Math.max(d.sent, d.delivered, 1)), 10);
  const chartWidth = 650;
  const chartHeight = 130;

  const legendItems: LegendItem[] = [
    { label: 'Sent', color: '#5269D9' },
    { label: 'Delivered', color: '#16A36A', dashed: true }
  ];

  const handleMouseMove = (e: React.MouseEvent<any>, idx: number) => {
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
    { label: 'Sent', value: activePoint.sent.toLocaleString(), color: '#5269D9' },
    { label: 'Delivered', value: activePoint.delivered.toLocaleString(), color: '#16A36A' },
    {
      label: 'Success Rate',
      value: activePoint.sent > 0 ? `${Math.round((activePoint.delivered / activePoint.sent) * 100)}%` : '0%',
      color: '#16A36A'
    }
  ] : [];

  return (
    <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 sm:p-4 shadow-2xs flex flex-col justify-between relative overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#20283A] leading-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#737D90] leading-tight mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <ChartLegend items={legendItems} size="sm" />
          {headerAction}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="w-full relative pt-1">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          style={{ height: `${height}px` }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5269D9" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#5269D9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 35, 70, 105].map((y, i) => (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="var(--color-chart-grid, #E5E7EB)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Filled Area */}
          <path
            d={`M 0,${chartHeight} ${data
              .map((d, i) => `L ${(i / (data.length - 1)) * chartWidth},${chartHeight - (d.sent / maxVal) * (chartHeight - 15)}`)
              .join(' ')} L ${chartWidth},${chartHeight} Z`}
            fill="url(#lineAreaGrad)"
          />

          {/* Sent Polyline */}
          <polyline
            fill="none"
            stroke="#5269D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data
              .map((d, i) => `${(i / (data.length - 1)) * chartWidth},${chartHeight - (d.sent / maxVal) * (chartHeight - 15)}`)
              .join(' ')}
          />

          {/* Delivered Polyline */}
          <polyline
            fill="none"
            stroke="#16A36A"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
            points={data
              .map((d, i) => `${(i / (data.length - 1)) * chartWidth},${chartHeight - (d.delivered / maxVal) * (chartHeight - 15)}`)
              .join(' ')}
          />

          {/* Interactive Data Nodes */}
          {data.map((d, i) => {
            const cx = (i / (data.length - 1)) * chartWidth;
            const cy = chartHeight - (d.sent / maxVal) * (chartHeight - 15);
            return (
              <g key={i}>
                {hoverIndex === i && (
                  <line
                    x1={cx}
                    y1={0}
                    x2={cx}
                    y2={chartHeight}
                    stroke="#D9E0F8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoverIndex === i ? 5.5 : 3.5}
                  fill={hoverIndex === i ? '#5269D9' : '#FFFFFF'}
                  stroke="#5269D9"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseMove={(e) => handleMouseMove(e, i)}
                />
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-[10px] font-medium text-[#737D90] px-1 mt-1">
          {data.map((d, i) => (
            <span key={i} className={`truncate ${hoverIndex === i ? 'text-[#5269D9] font-bold' : ''}`}>
              {d.label}
            </span>
          ))}
        </div>

        {/* Tooltip */}
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
