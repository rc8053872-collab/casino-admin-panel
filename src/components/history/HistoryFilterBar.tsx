import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Sparkles, Users, RefreshCcw } from 'lucide-react';
import type { HistoryFilterParams } from '../../types/gameHistory';

interface HistoryFilterBarProps {
  filters: HistoryFilterParams;
  onFilterChange: (newFilters: Partial<HistoryFilterParams>) => void;
  onResetFilters: () => void;
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onFilterChange({ search: localSearch, page: 1 });
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customStart, setCustomStart] = useState(filters.customStartDate || '');
  const [customEnd, setCustomEnd] = useState(filters.customEndDate || '');

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.gameId && filters.gameId !== 'all') ||
    (filters.gameType && filters.gameType !== 'all') ||
    (filters.result && filters.result !== 'all') ||
    (filters.dateRange && filters.dateRange !== 'today') ||
    (filters.playerCount && filters.playerCount !== 'any') ||
    filters.flaggedOnly ||
    filters.highStakesOnly ||
    filters.multiplayerOnly
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
      {/* Top Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* 1. Search Box */}
        <div className="relative md:col-span-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Round ID, Table, or Player..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 2. All Games Dropdown */}
        <div>
          <select
            value={filters.gameId || 'all'}
            onChange={(e) => onFilterChange({ gameId: e.target.value, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          >
            <option value="all">All Games</option>
            <option value="GAME-001">Texas Hold'em Arena 01</option>
            <option value="GAME-005">Rapid Crash Rocket</option>
            <option value="GAME-002">Speed Ludo 4P</option>
            <option value="GAME-004">Mega Multiplier Wheel</option>
            <option value="GAME-003">Teen Patti Blitz</option>
            <option value="GAME-006">Carrom Clash Royale</option>
          </select>
        </div>

        {/* 3. Game Type Dropdown */}
        <div>
          <select
            value={filters.gameType || 'all'}
            onChange={(e) => onFilterChange({ gameType: e.target.value, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          >
            <option value="all">All Types</option>
            <option value="Card">Card</option>
            <option value="Crash">Crash</option>
            <option value="Board">Board</option>
            <option value="Wheel">Wheel</option>
            <option value="Strategy">Strategy</option>
            <option value="Arcade">Arcade</option>
          </select>
        </div>

        {/* 4. Date Range Dropdown */}
        <div className="relative">
          <select
            value={filters.dateRange || 'today'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'custom') {
                setIsCustomDateOpen(true);
              } else {
                onFilterChange({ dateRange: val, customStartDate: undefined, customEndDate: undefined, page: 1 });
              }
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          >
            <option value="today">Today (06 Oct 2026)</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>

        {/* 5. Result Filter Dropdown */}
        <div>
          <select
            value={filters.result || 'all'}
            onChange={(e) => onFilterChange({ result: e.target.value, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          >
            <option value="all">All Outcomes</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="abandoned">Abandoned</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Pill Badges matching reference screenshot */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            QUICK FILTERS:
          </span>

          {/* Show Flagged Only */}
          <button
            type="button"
            onClick={() => onFilterChange({ flaggedOnly: !filters.flaggedOnly, page: 1 })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filters.flaggedOnly
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Show Flagged Only (3)</span>
          </button>

          {/* High Stakes */}
          <button
            type="button"
            onClick={() => onFilterChange({ highStakesOnly: !filters.highStakesOnly, page: 1 })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filters.highStakesOnly
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>High Stakes (₹10k+)</span>
          </button>

          {/* Multiplayer Showdowns */}
          <button
            type="button"
            onClick={() => onFilterChange({ multiplayerOnly: !filters.multiplayerOnly, page: 1 })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filters.multiplayerOnly
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Users className="w-3 h-3 text-blue-500" />
            <span>Multiplayer Showdowns (&gt;4)</span>
          </button>

          {/* Seed Hash Mismatch Alerts */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-400 border border-slate-200/60 cursor-default"
            title="Cryptographic verification verified 0 mismatches"
          >
            <span>Seed Hash Mismatch Alerts (0)</span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-auto flex items-center gap-1"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Custom Date Range Modal Dialog */}
      {isCustomDateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">Custom Date Range</h4>
              <button
                onClick={() => setIsCustomDateOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCustomDateOpen(false)}
                className="px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onFilterChange({
                    dateRange: 'custom',
                    customStartDate: customStart,
                    customEndDate: customEnd,
                    page: 1,
                  });
                  setIsCustomDateOpen(false);
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white font-semibold rounded-lg"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryFilterBar;
