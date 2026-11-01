import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRangePreset = 'today' | '7days' | '30days' | 'thisMonth' | 'all';

interface DateRangeFilterProps {
  selected: DateRangePreset;
  onSelect: (preset: DateRangePreset) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ selected, onSelect }) => {
  const options: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'all', label: 'All Time' }
  ];

  return (
    <div className="inline-flex items-center bg-[#F6F7FB] border border-[#E8EAF0] p-1 rounded-lg">
      <div className="pl-2 pr-1.5 text-[#737D90]">
        <Calendar className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-0.5">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#5269D9] font-semibold shadow-xs border border-[#E8EAF0]'
                  : 'text-[#737D90] hover:text-[#20283A] hover:bg-white/50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

