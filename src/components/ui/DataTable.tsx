import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  className = ''
}: DataTableProps<T>) {
  return (
    <div className={`w-full bg-white rounded-xl border border-[#E5E9F0] shadow-2xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] border-b border-[#E5E9F0] text-[#718096] uppercase font-semibold tracking-wider text-[11px]">
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const alignClass =
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={`px-4 py-3 font-semibold ${alignClass} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-[#182338]' : ''
                    }`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[#A0AEC0]">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[#5269D9]" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-[#5269D9]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E9F0] text-[#182338]">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={`loading-cell-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#718096]">
                  {emptyState || (
                    <div className="py-6 text-center space-y-1">
                      <p className="text-sm font-semibold text-[#182338]">No records found</p>
                      <p className="text-xs text-[#718096]">Try adjusting your search query or filter parameters.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F8FAFC]' : 'hover:bg-[#FAFBFD]'
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                    return (
                      <td key={col.key} className={`px-4 py-3 text-xs ${alignClass}`}>
                        {col.render ? col.render(item, index) : (item as any)[col.key]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
