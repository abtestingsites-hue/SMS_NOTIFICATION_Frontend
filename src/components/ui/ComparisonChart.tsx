import React from 'react';

export interface ComparisonMetric {
  title: string;
  leftLabel: string;
  leftValue: number | string;
  leftRate?: number;
  rightLabel: string;
  rightValue: number | string;
  rightRate?: number;
  leftColor?: string;
  rightColor?: string;
}

interface ComparisonChartProps {
  metrics: ComparisonMetric[];
  className?: string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  metrics,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {metrics.map((m, idx) => {
        const leftRate = m.leftRate !== undefined ? m.leftRate : 50;
        const rightRate = m.rightRate !== undefined ? m.rightRate : 50;
        const leftColor = m.leftColor || '#5269D9';
        const rightColor = m.rightColor || '#16A36A';

        return (
          <div key={idx} className="bg-[#F7F8FC] p-2.5 rounded-lg border border-[#E8EAF0] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#20283A]">
              <span>{m.title}</span>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span style={{ color: leftColor }}>{m.leftValue}</span>
                <span className="text-[#A4ADBD]">vs</span>
                <span style={{ color: rightColor }}>{m.rightValue}</span>
              </div>
            </div>

            <div className="flex h-2 rounded-full overflow-hidden bg-slate-200">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${leftRate}%`, backgroundColor: leftColor }}
                title={`${m.leftLabel}: ${m.leftRate}%`}
              />
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${rightRate}%`, backgroundColor: rightColor }}
                title={`${m.rightLabel}: ${m.rightRate}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#737D90]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: leftColor }} />
                {m.leftLabel} ({m.leftRate}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rightColor }} />
                {m.rightLabel} ({m.rightRate}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

