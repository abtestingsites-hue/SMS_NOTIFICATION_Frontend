import React from 'react';

export interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
  dashed?: boolean;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
  size?: 'sm' | 'md';
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  className = '',
  size = 'sm'
}) => {
  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5 text-xs text-[#737D90]">
          {item.dashed ? (
            <span
              className="w-3 h-0.5 border-t-2"
              style={{ borderColor: item.color, borderStyle: 'dashed' }}
            />
          ) : (
            <span
              className={`rounded-full shrink-0 ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="font-medium text-[#20283A]">{item.label}</span>
          {item.value !== undefined && (
            <span className="font-semibold text-[#20283A] font-mono">({item.value})</span>
          )}
        </div>
      ))}
    </div>
  );
};

