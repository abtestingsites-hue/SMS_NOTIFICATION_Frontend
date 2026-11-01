import React from 'react';

export interface TooltipRow {
  label: string;
  value: string | number;
  color?: string;
  unit?: string;
}

interface ChartTooltipProps {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
  visible: boolean;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  x,
  y,
  title,
  rows,
  visible
}) => {
  if (!visible) return null;

  return (
    <div
      className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#20283A] text-white px-2.5 py-2 rounded-lg shadow-xl text-[11px] min-w-[120px] transition-all duration-75"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="font-semibold text-slate-300 border-b border-slate-700/80 pb-1 mb-1">
        {title}
      </div>
      <div className="space-y-1 font-mono">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-slate-300 font-sans">
              {row.color && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.color }} />
              )}
              {row.label}:
            </span>
            <span className="font-bold text-white">
              {row.value}{row.unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

