import React from 'react';
import { Search, RotateCcw, Shield, MapPin, AlertTriangle, ArrowUpDown } from 'lucide-react';

export interface BlockedFilters {
  search: string;
  cluster: string;
  trigger: string;
  riskTier: string;
  sortBy: 'risk_desc' | 'risk_asc' | 'balance_desc' | 'name_asc';
}

interface BlockedPlayerFilterBarProps {
  filters: BlockedFilters;
  availableClusters: string[];
  availableTriggers: string[];
  onFilterChange: (filters: Partial<BlockedFilters>) => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export const BlockedPlayerFilterBar: React.FC<BlockedPlayerFilterBarProps> = ({
  filters,
  availableClusters,
  availableTriggers,
  onFilterChange,
  onReset,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by username, player ID, email, IP, or trigger reason..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Cluster Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.cluster}
              onChange={(e) => onFilterChange({ cluster: e.target.value })}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-3"
            >
              <option value="all">All Clusters</option>
              {availableClusters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.trigger}
              onChange={(e) => onFilterChange({ trigger: e.target.value })}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-3"
            >
              <option value="all">All Violations</option>
              {availableTriggers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.riskTier}
              onChange={(e) => onFilterChange({ riskTier: e.target.value })}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-3"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">Critical (90+)</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
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
              <option value="risk_desc">Highest Risk Score</option>
              <option value="risk_asc">Lowest Risk Score</option>
              <option value="balance_desc">Highest Frozen Balance</option>
              <option value="name_asc">Player Name (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter status strip */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> isolated accounts
          </span>
          {(filters.search ||
            filters.cluster !== 'all' ||
            filters.trigger !== 'all' ||
            filters.riskTier !== 'all') && (
            <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
              Filters Active
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400">Real-time anti-fraud isolation ledger</span>
      </div>
    </div>
  );
};

export default BlockedPlayerFilterBar;
