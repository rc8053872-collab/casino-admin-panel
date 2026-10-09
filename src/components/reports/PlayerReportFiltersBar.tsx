import React from 'react';
import { RotateCcw, Filter, Search } from 'lucide-react';
import type { PlayerReportFilters } from '../../types/playerReport';

interface PlayerReportFiltersBarProps {
  filters: PlayerReportFilters;
  onChange: (updated: Partial<PlayerReportFilters>) => void;
  onReset: () => void;
  onApply: () => void;
}

export const PlayerReportFiltersBar: React.FC<PlayerReportFiltersBarProps> = ({
  filters,
  onChange,
  onReset,
  onApply,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search players..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Segment:</span>
            <select
              value={filters.segment || 'all'}
              onChange={(e) => onChange({ segment: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Segments</option>
              <option value="vip">VIP</option>
              <option value="high-value">High Value</option>
              <option value="regular">Regular</option>
              <option value="new">New Players</option>
              <option value="at-risk">At Risk</option>
              <option value="dormant">Dormant</option>
            </select>
          </div>

          {/* Activity Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Activity:</span>
            <select
              value={filters.activity || 'all'}
              onChange={(e) => onChange({ activity: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Activity</option>
              <option value="high">High Activity</option>
              <option value="medium">Medium Activity</option>
              <option value="low">Low Activity</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Risk:</span>
            <select
              value={filters.risk || 'all'}
              onChange={(e) => onChange({ risk: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Risk</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          {/* Channel */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Channel:</span>
            <select
              value={filters.channel || 'all'}
              onChange={(e) => onChange({ channel: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="organic">Organic</option>
              <option value="referral">Referral</option>
              <option value="campaign">Campaign</option>
              <option value="direct">Direct</option>
            </select>
          </div>

          {/* Apply & Reset Buttons */}
          <div className="flex items-center gap-1.5 pl-1">
            <button
              type="button"
              onClick={onApply}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              <span>Apply</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerReportFiltersBar;
