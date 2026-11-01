import React from 'react';

export interface HorizontalBarItem {
  label: string;
  value: number;
  secondaryValue?: string | number;
  color?: string;
  pct?: number;
}

interface HorizontalBarChartProps {
  items: HorizontalBarItem[];
  maxVal?: number;
  className?: string;
  showPercent?: boolean;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  maxVal,
  className = '',
  showPercent = true
}) => {
  const calculatedMax = maxVal || Math.max(...items.map(i => i.value), 1);
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item, idx) => {
        const percent = Math.min(100, Math.round((item.value / calculatedMax) * 100));
        const shareOfTotal = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const color = item.color || '#5269D9';

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#20283A] text-[11px] truncate">{item.label}</span>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                <span className="font-bold text-[#20283A]">{item.value.toLocaleString()}</span>
                {showPercent && (
                  <span className="text-[#737D90] text-[10px]">({shareOfTotal}%)</span>
                )}
                {item.secondaryValue && (
                  <span className="text-[#737D90] text-[10px]">· {item.secondaryValue}</span>
                )}
              </div>
            </div>
            <div className="w-full bg-[#F1F4F9] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

