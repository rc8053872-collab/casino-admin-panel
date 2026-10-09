import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { PlayerActivityReportRow } from '../../types/playerReport';

interface RecentPlayerActivityTableProps {
  rows: PlayerActivityReportRow[];
  isLoading?: boolean;
}

type SortField = 'lastActive' | 'sessions' | 'games' | 'wallet' | 'risk';

export const RecentPlayerActivityTable: React.FC<RecentPlayerActivityTableProps> = ({
  rows,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting and Filtering
  const filteredRows = useMemo(() => {
    return (rows || []).filter((r) => {
      if (!r || !r.player) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${r.player.firstName || ''} ${r.player.lastName || ''}`.toLowerCase();
        const username = (r.player.username || '').toLowerCase();
        const uid = (r.player.playerId || '').toLowerCase();
        if (!fullName.includes(q) && !username.includes(q) && !uid.includes(q)) {
          return false;
        }
      }

      if (segmentFilter !== 'all' && (r.segment || '').toLowerCase() !== segmentFilter.toLowerCase()) {
        return false;
      }

      if (activityFilter !== 'all' && (r.activityLevel || '').toLowerCase() !== activityFilter.toLowerCase()) {
        return false;
      }

      if (riskFilter !== 'all' && (r.riskLevel || '').toLowerCase() !== riskFilter.toLowerCase()) {
        return false;
      }

      if (statusFilter !== 'all' && (r.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [rows, searchQuery, segmentFilter, activityFilter, riskFilter, statusFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'sessions':
          comparison = (a.sessionsCount || 0) - (b.sessionsCount || 0);
          break;
        case 'games':
          comparison = (a.gamesCount || 0) - (b.gamesCount || 0);
          break;
        case 'wallet':
          comparison = (a.walletBalance || 0) - (b.walletBalance || 0);
          break;
        case 'risk': {
          const rank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          comparison = (rank[a.riskLevel] || 0) - (rank[b.riskLevel] || 0);
          break;
        }
        case 'lastActive':
        default: {
          const timeB = b?.player?.createdAt ? new Date(b.player.createdAt).getTime() : 0;
          const timeA = a?.player?.createdAt ? new Date(a.player.createdAt).getTime() : 0;
          comparison = timeB - timeA;
          break;
        }
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredRows, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-slate-100 rounded-md" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Title & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Player Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready telemetry log. Click any player row to inspect detailed profile & KYC state.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Segment */}
          <select
            value={segmentFilter}
            onChange={(e) => {
              setSegmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Segments</option>
            <option value="vip">VIP</option>
            <option value="high value">High Value</option>
            <option value="regular">Regular</option>
            <option value="new">New</option>
            <option value="at risk">At Risk</option>
          </select>

          {/* Activity */}
          <select
            value={activityFilter}
            onChange={(e) => {
              setActivityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Activity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Risk */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Risk</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="in match">In Match</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Show:</span>
          {[10, 25, 50].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                pageSize === sz
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 select-none">
              <th className="py-2.5 px-3">Player</th>
              <th className="py-2.5 px-3">Segment</th>
              <th
                onClick={() => handleSort('lastActive')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Last Active</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sessions')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Sessions</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('games')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Games</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('wallet')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Wallet</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Activity</th>
              <th
                onClick={() => handleSort('risk')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Risk</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No player activity found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => {
                const p = r.player;
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/admin/players/${p.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Player */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {p.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            <span>{p.username}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.playerId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Segment */}
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {r.segment}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {r.lastActive}
                    </td>

                    {/* Sessions */}
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      <AnimatedNumber value={r.sessionsCount} />
                    </td>

                    {/* Games */}
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      <AnimatedNumber value={r.gamesCount} />
                    </td>

                    {/* Wallet */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <AnimatedNumber value={r.walletBalance} format="currency" />
                    </td>

                    {/* Activity */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.activityLevel === 'High'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.activityLevel === 'Medium'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {r.activityLevel}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.riskLevel === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : r.riskLevel === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : r.riskLevel === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {r.riskLevel}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'In Match'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'In Match'
                              ? 'bg-emerald-500 animate-pulse'
                              : r.status === 'Active'
                              ? 'bg-blue-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>{r.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, sortedRows.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{sortedRows.length}</span> players
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentPlayerActivityTable;
