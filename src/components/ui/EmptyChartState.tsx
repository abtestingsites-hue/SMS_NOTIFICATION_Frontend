import React from 'react';
import { BarChart3 } from 'lucide-react';

interface EmptyChartStateProps {
  title?: string;
  message?: string;
  height?: string | number;
  onAction?: () => void;
  actionLabel?: string;
}

export const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  title = 'No Analytics Data',
  message = 'No dispatch records found for the selected time horizon.',
  height = '100%',
  onAction,
  actionLabel
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-[#F7F8FC]/60 border border-dashed border-[#E8EAF0] w-full"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="w-8 h-8 rounded-lg bg-white border border-[#E8EAF0] flex items-center justify-center text-[#A4ADBD] mb-2 shadow-2xs">
        <BarChart3 className="w-4 h-4" />
      </div>
      <h4 className="text-xs font-semibold text-[#20283A]">{title}</h4>
      <p className="text-[11px] text-[#737D90] max-w-xs mt-0.5">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2.5 text-xs font-semibold text-[#5269D9] hover:underline cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

