import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full divide-y divide-slate-100 animate-pulse" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="px-4.5 py-3 flex items-center justify-between gap-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-3.5 bg-slate-200/70 rounded ${
                cIdx === 0 ? 'w-28' : cIdx === 1 ? 'w-20' : 'w-16'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ heightClass?: string }> = ({
  heightClass = 'h-64 sm:h-72',
}) => {
  return (
    <div className={`w-full ${heightClass} p-4 flex items-end gap-3 animate-pulse`} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-slate-200/60 rounded-t"
          style={{ height: `${25 + (i * 11) % 65}%` }}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 animate-pulse" aria-hidden="true">
      <div className="h-3 bg-slate-200/70 rounded w-20" />
      <div className="h-6 bg-slate-200/80 rounded w-28" />
      <div className="h-2.5 bg-slate-200/60 rounded w-16" />
    </div>
  );
};

export default {
  TableSkeleton,
  ChartSkeleton,
  CardSkeleton,
};
