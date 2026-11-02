import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  activeCount?: number;
  onClearAll?: () => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  activeCount = 0,
  onClearAll,
  resultCount,
  totalCount,
  className = ''
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E9F0] p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}
    >
      {/* Left side: Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
        {onSearchChange !== undefined && (
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#718096] pointer-events-none" />
            <input
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#FAFBFD] border border-[#E5E9F0] rounded-lg pl-8 pr-8 py-1.5 text-xs text-[#182338] placeholder-[#718096] focus:outline-none focus:border-[#5269D9] focus:bg-white transition-all shadow-2xs"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#182338]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {filters && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters}
          </div>
        )}

        {activeCount > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[#D94D59] hover:bg-[#FDF0F1] transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>

      {/* Right side: Result counts & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {resultCount !== undefined && (
          <div className="text-[11px] font-medium text-[#718096] shrink-0">
            Showing <span className="font-bold text-[#182338]">{resultCount}</span>
            {totalCount !== undefined && totalCount !== resultCount ? ` of ${totalCount}` : ''} results
          </div>
        )}

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
