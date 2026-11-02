import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}) => {
  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalRecords === 0) return null;

  return (
    <div
      className={`bg-white px-4 py-3 rounded-xl border border-[#E5E9F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#718096] ${className}`}
    >
      {/* Left: Record Range & Page Size */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-[#182338]">{startRecord}</span> to{' '}
          <span className="font-semibold text-[#182338]">{endRecord}</span> of{' '}
          <span className="font-semibold text-[#182338]">{totalRecords}</span> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#E5E9F0]">
            <span className="text-[11px]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#FAFBFD] border border-[#E5E9F0] rounded px-1.5 py-0.5 text-xs text-[#182338] focus:outline-none focus:border-[#5269D9]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Prev / Numbers / Next */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#E5E9F0] bg-white text-[#182338] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-[#A0AEC0]">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-[#5269D9] text-white shadow-2xs'
                    : 'border border-[#E5E9F0] bg-white text-[#182338] hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#E5E9F0] bg-white text-[#182338] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
