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
      className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[var(--color-surface-elevated,#1E2028)] text-[var(--color-text-primary,#FFFFFF)] border border-[var(--color-border,#2E323D)] px-2.5 py-2 rounded-lg shadow-xl text-[11px] min-w-[120px] transition-all duration-75"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="font-semibold text-[var(--color-text-secondary,#C0C0C0)] border-b border-[var(--color-border,#2E323D)] pb-1 mb-1">
        {title}
      </div>
      <div className="space-y-1 font-mono">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--color-text-secondary,#C0C0C0)] font-sans">
              {row.color && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.color }} />
              )}
              {row.label}:
            </span>
            <span className="font-bold text-[var(--color-text-primary,#FFFFFF)]">
              {row.value}{row.unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

