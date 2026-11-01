import React from 'react';

export type Granularity = 'daily' | 'weekly' | 'monthly';

interface AnalyticsFilterProps {
  granularity?: Granularity;
  onGranularityChange?: (g: Granularity) => void;
  channel?: 'all' | 'sms' | 'whatsapp';
  onChannelChange?: (ch: 'all' | 'sms' | 'whatsapp') => void;
  size?: 'xs' | 'sm';
}

export const AnalyticsFilter: React.FC<AnalyticsFilterProps> = ({
  granularity,
  onGranularityChange,
  channel,
  onChannelChange,
  size = 'xs'
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {onGranularityChange && granularity && (
        <div className="inline-flex items-center bg-[#F7F8FC] p-0.5 rounded-lg border border-[#E8EAF0]">
          {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => onGranularityChange(g)}
              className={`px-2 py-0.5 rounded-md font-medium capitalize transition-all cursor-pointer ${
                size === 'xs' ? 'text-[10px]' : 'text-xs'
              } ${
                granularity === g
                  ? 'bg-white text-[#5269D9] font-bold shadow-2xs'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {onChannelChange && channel && (
        <div className="inline-flex items-center bg-[#F7F8FC] p-0.5 rounded-lg border border-[#E8EAF0]">
          {(['all', 'sms', 'whatsapp'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => onChannelChange(ch)}
              className={`px-2 py-0.5 rounded-md font-medium uppercase transition-all cursor-pointer ${
                size === 'xs' ? 'text-[10px]' : 'text-xs'
              } ${
                channel === ch
                  ? 'bg-white text-[#5269D9] font-bold shadow-2xs'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

