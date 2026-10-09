import React from 'react';
import { Search, RotateCcw, ArrowUpDown, Filter, Edit3 } from 'lucide-react';

export interface LiveGamesFilters {
  search: string;
  category: string; // 'all' | GameCategory
  occupancy: 'all' | 'almost_full' | 'open_seats';
  sortBy: 'pot_desc' | 'players_desc' | 'ping_asc' | 'round_desc';
}

interface LiveGamesFilterBarProps {
  filters: LiveGamesFilters;
  categoryCounts: Record<string, number>;
  onFilterChange: (filters: Partial<LiveGamesFilters>) => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
  isInlineEditMode?: boolean;
  onToggleInlineEdit?: () => void;
}

export const LiveGamesFilterBar: React.FC<LiveGamesFilterBarProps> = ({
  filters,
  categoryCounts,
  onFilterChange,
  onReset,
  filteredCount,
  totalCount,
  isInlineEditMode = false,
  onToggleInlineEdit,
}) => {
  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Arenas' },
    { id: 'Card', label: 'Card' },
    { id: 'Board', label: 'Board' },
    { id: 'Wheel', label: 'Wheel' },
    { id: 'Crash', label: 'Crash' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = filters.category === cat.id;
          const count = cat.id === 'all' ? totalCount : categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFilterChange({ category: cat.id })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search arena name, ID (GAME-001), rules, or activity..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Occupancy Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.occupancy}
              onChange={(e) => onFilterChange({ occupancy: e.target.value as any })}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-3"
            >
              <option value="all">All Capacities</option>
              <option value="almost_full">Almost Full (80%+)</option>
              <option value="open_seats">Open Seats</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-3"
            >
              <option value="pot_desc">Highest Live Pot</option>
              <option value="players_desc">Most Players Seated</option>
              <option value="ping_asc">Lowest Latency (Ping)</option>
              <option value="round_desc">Highest Round</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Displaying <strong className="text-slate-800">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> active arenas
          </span>
          {(filters.search || filters.category !== 'all' || filters.occupancy !== 'all') && (
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Filter Active
            </span>
          )}

          {onToggleInlineEdit && (
            <button
              type="button"
              onClick={onToggleInlineEdit}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isInlineEditMode
                  ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300/60'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
              title="Toggle inline editing for arena names, pots, seating, and rounds"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isInlineEditMode ? 'Exit Quick Edit' : 'Quick Table Edit'}</span>
            </button>
          )}
        </div>

        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time node telemetry synchronized</span>
        </span>
      </div>
    </div>
  );
};

export default LiveGamesFilterBar;
