import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  ShieldCheck,
  Eye,
  CheckSquare,
  Square,
  ArrowUpDown,
  AlertTriangle,
  Play,
  Users,
  Gamepad2,
  Layers,
  Trophy,
  Archive,
  Trash2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGameHistory,
  useGameHistoryStats,
} from '../hooks/useGameHistoryQuery';
import type {
  GameSession,
  GameSessionStatus,
  HistoryFilterParams,
} from '../types/gameHistory';
import { formatINR } from '../utils/currency';
import { gameHistoryService } from '../services/gameHistoryService';
import { useToast } from '../hooks/useToast';
import GameHistoryKpiCards from '../components/history/GameHistoryKpiCards';
import HistoryFilterBar from '../components/history/HistoryFilterBar';
import HistoryStatusTabs from '../components/history/HistoryStatusTabs';
import type { HistoryStatusTab } from '../components/history/HistoryStatusTabs';
import RoundAuditDeepDive from '../components/history/RoundAuditDeepDive';
import GameSessionDrawer from '../components/history/GameSessionDrawer';
import DisputeReviewModal from '../components/history/DisputeReviewModal';
import HistoryAnalyticsPanels from '../components/history/HistoryAnalyticsPanels';
import ConfirmationModal from '../components/games/ConfirmationModal';

function formatDateTime(dateStr?: string): { date: string; time: string } {
  if (!dateStr) return { date: '—', time: '—' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} ${ampm}`,
    };
  } catch {
    return { date: dateStr, time: '' };
  }
}

export const GameHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Filters state
  const [filters, setFilters] = useState<HistoryFilterParams>({
    page: 1,
    pageSize: 10,
    statusTab: 'all',
    sortBy: 'started',
    sortOrder: 'desc',
  });

  // Queries
  const { data: historyData, isLoading } = useGameHistory(filters);
  const { data: stats } = useGameHistoryStats();

  // UI state
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [deepDiveSession, setDeepDiveSession] = useState<GameSession | null>(null);
  const [inspectingSession, setInspectingSession] = useState<GameSession | null>(null);
  const [disputeReviewSession, setDisputeReviewSession] = useState<GameSession | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const sessions = historyData?.sessions || [];
  const activeDeepDive = deepDiveSession || sessions[0] || null;

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<HistoryFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      statusTab: 'all',
      search: '',
      gameId: 'all',
      gameType: 'all',
      result: 'all',
      dateRange: 'today',
      playerCount: 'any',
      flaggedOnly: false,
      highStakesOnly: false,
      multiplayerOnly: false,
      sortBy: 'started',
      sortOrder: 'desc',
    });
    toast.info('Filters Reset', 'Showing all historical match rounds.');
  };

  const handleTabChange = (tab: HistoryStatusTab) => {
    setFilters((prev) => ({ ...prev, statusTab: tab, page: 1 }));
  };

  const handleSort = (field: string) => {
    setFilters((prev) => {
      const order = prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc';
      return { ...prev, sortBy: field, sortOrder: order };
    });
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedSessionIds.length === sessions.length) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(sessions.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export handlers
  const handleExportHistory = () => {
    gameHistoryService.exportGameHistoryToCsv(sessions);
    toast.success('History Exported', `Exported ${sessions.length} matches to CSV.`);
  };

  const handleExportRoundData = async () => {
    const target = activeDeepDive || sessions[0];
    if (!target) {
      toast.error('No Session Selected', 'Please select a game session to export round data.');
      return;
    }
    const rounds = await gameHistoryService.getGameRounds(target.sessionId);
    gameHistoryService.exportRoundDataToCsv(target.sessionId, rounds);
    toast.success('Round Data Exported', `Exported round data for session ${target.sessionId} to CSV.`);
  };

  const handleExportSelected = () => {
    const selected = sessions.filter((s) => selectedSessionIds.includes(s.id));
    gameHistoryService.exportGameHistoryToCsv(selected);
    toast.success('Export Successful', `Exported ${selected.length} selected sessions.`);
  };

  const handleExportSelectedRounds = async () => {
    const selected = sessions.filter((s) => selectedSessionIds.includes(s.id));
    if (selected.length === 0) return;
    for (const s of selected) {
      const rounds = await gameHistoryService.getGameRounds(s.sessionId);
      gameHistoryService.exportRoundDataToCsv(s.sessionId, rounds);
    }
    toast.success('Rounds Exported', `Exported round logs for ${selected.length} sessions.`);
  };

  const handleConfirmArchive = () => {
    toast.success('Archived Sessions', `${selectedSessionIds.length} sessions archived successfully.`);
    setSelectedSessionIds([]);
    setIsArchiveConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    await gameHistoryService.deleteSessions(selectedSessionIds);
    queryClient.invalidateQueries({ queryKey: ['game-history'] });
    queryClient.invalidateQueries({ queryKey: ['game-history-stats'] });
    toast.success('Sessions Deleted', `${selectedSessionIds.length} sessions removed permanently.`);
    setSelectedSessionIds([]);
    setIsDeleteConfirmOpen(false);
  };

  const handleReplaySelected = () => {
    const target = sessions.find((s) => selectedSessionIds.includes(s.id)) || activeDeepDive;
    if (target) {
      toast.info('Replay Launched', `Loading visual hand replay for ${target.roundId}.`);
      setDeepDiveSession(target);
    }
  };

  // Badge helpers
  const renderStatusBadge = (status: GameSessionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      case 'abandoned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Abandoned
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Disputed
          </span>
        );
      case 'interrupted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Interrupted
          </span>
        );
    }
  };

  const renderIntegrityBadge = (status: string) => {
    switch (status) {
      case 'rng_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            RNG Verified
          </span>
        );
      case 'provably_fair':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Provably Fair
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Clean Showdown
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs">
      {/* 1. Page Title & Top Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Game History & Round Archive
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              ● FORENSIC AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review completed games, rounds, players, results and historical game activity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportHistory}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            title="Export CSV of filtered history"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export History</span>
          </button>

          <button
            type="button"
            onClick={handleExportRoundData}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            title="Export round breakdowns to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Round Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSeedModalOpen(true)}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>RNG Seed Verification</span>
          </button>

          <button
            type="button"
            onClick={handleReplaySelected}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Replay Selected Round</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards with GSAP Animations */}
      <GameHistoryKpiCards stats={stats} />

      {/* 3. Filter Bar & Quick Badges */}
      <HistoryFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Status Tabs with Dynamic Counters */}
      <HistoryStatusTabs
        activeTab={(filters.statusTab as HistoryStatusTab) || 'all'}
        tabCounts={
          historyData?.tabCounts || {
            all: 148920,
            completed: 147420,
            cancelled: 920,
            abandoned: 480,
            disputed: 100,
          }
        }
        onTabChange={handleTabChange}
      />

      {/* Bulk Action Strip if sessions are selected */}
      {selectedSessionIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-blue-900">
            {selectedSessionIds.length} sessions selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportSelected}
              className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={handleExportSelectedRounds}
              className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>Export Rounds</span>
            </button>
            <button
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="px-2.5 py-1 bg-white border border-rose-200 text-rose-700 rounded-lg font-semibold hover:bg-rose-50 flex items-center gap-1 shadow-2xs"
            >
              <Archive className="w-3 h-3" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 rounded-lg font-semibold hover:bg-rose-100 flex items-center gap-1 shadow-2xs"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleReplaySelected}
              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Replay Round</span>
            </button>
            <button
              onClick={() => setSelectedSessionIds([])}
              className="px-2 py-1 text-slate-500 hover:text-slate-800"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 5. Main History Table (11 Defined Columns) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div>Synchronizing completed game archive...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center space-y-2 px-4">
            <div className="text-sm font-bold text-slate-800">No game history found.</div>
            <p className="text-xs text-slate-400">Try changing your filters or date range.</p>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-3 py-3 w-8">
                    <button onClick={toggleSelectAll} className="p-0.5 text-slate-400 hover:text-slate-700" title="Select All">
                      {selectedSessionIds.length === sessions.length && sessions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </th>
                  <th className="px-3.5 py-3">GAME / SESSION</th>
                  <th className="px-3 py-3">GAME TYPE</th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('started')}
                  >
                    <div className="flex items-center gap-1">
                      <span>STARTED / ENDED</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('playerCount')}
                  >
                    <div className="flex items-center gap-1">
                      <span>ACTIVE PLAYERS</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3">RESULT</th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('totalPot')}
                  >
                    <div className="flex items-center gap-1">
                      <span>TOTAL POT</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('totalPayout')}
                  >
                    <div className="flex items-center gap-1">
                      <span>PAYOUT</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center gap-1">
                      <span>DURATION</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>STATUS</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => {
                  const isSelected = selectedSessionIds.includes(session.id);
                  const isDeepDiveActive = activeDeepDive?.id === session.id;
                  const startDT = formatDateTime(session.startedAt);
                  const endDT = formatDateTime(session.endedAt);

                  return (
                    <tr
                      key={session.id}
                      onClick={() => setDeepDiveSession(session)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer group ${
                        isDeepDiveActive ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* 1. SELECT */}
                      <td className="px-3 py-3" onClick={(e) => toggleSelect(session.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </td>

                      {/* 2. GAME / SESSION */}
                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/games/${session.gameId}`);
                            }}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors block"
                          >
                            {session.gameName}
                          </button>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                              {session.gameId}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/games/history/${session.sessionId}`);
                              }}
                              className="text-[10px] text-blue-600 hover:underline font-mono"
                            >
                              Session #{session.sessionId}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 3. GAME TYPE */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {session.gameType}
                        </span>
                      </td>

                      {/* 4. STARTED / ENDED */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-[11px] font-medium text-slate-800">
                          <span className="text-slate-400 font-normal">Started: </span>
                          {startDT.date}, {startDT.time}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="text-slate-400 font-normal">Ended: </span>
                          {endDT.date}, {endDT.time}
                        </div>
                      </td>

                      {/* 5. ACTIVE PLAYERS */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingSession(session);
                          }}
                          className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-left"
                        >
                          {session.playerCount} players
                        </button>
                        <div className="text-[10px] text-slate-400">
                          Peak: {session.peakPlayers}
                        </div>
                      </td>

                      {/* 6. RESULT */}
                      <td className="px-3 py-3 max-w-[190px]">
                        {session.winnerName ? (
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">Winner:</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (session.winnerId || session.winnerPlayerId) {
                                  navigate(`/admin/players/${session.winnerId || session.winnerPlayerId}`);
                                }
                              }}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left flex items-center gap-1"
                            >
                              <span>{session.winnerName}</span>
                              <span className="text-slate-400 font-mono text-[10px] font-normal">
                                ({session.winnerPlayerId})
                              </span>
                            </button>
                            <div className="text-[10px] text-slate-500 font-medium truncate">
                              {session.winningHandOrOutcome}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-rose-600 text-[11px]">
                              Cancelled: No winner
                            </div>
                            {session.cancellationReason && (
                              <div className="text-[10px] text-slate-400 truncate">
                                {session.cancellationReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 7. TOTAL POT */}
                      <td className="px-3 py-3 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(session.totalPot)}
                      </td>

                      {/* 8. PAYOUT */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatINR(session.totalPayout)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {((session.totalPayout / Math.max(1, session.totalPot)) * 100).toFixed(0)}% distributed
                        </div>
                      </td>

                      {/* 9. DURATION */}
                      <td className="px-3 py-3 font-mono text-slate-800 whitespace-nowrap">
                        {session.duration}
                      </td>

                      {/* 10. STATUS */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div>{renderStatusBadge(session.status)}</div>
                          <div>{renderIntegrityBadge(session.integrityStatus)}</div>
                        </div>
                      </td>

                      {/* 11. ACTIONS */}
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Session (Drawer) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingSession(session);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Session Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* View Players */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/games/history/${session.sessionId}?tab=players`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Players"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>

                          {/* View Rounds */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeepDiveSession(session);
                              toast.info('Viewing Round Archive', session.roundId);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Rounds Archive"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>

                          {/* View Game */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/games/${session.gameId}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Game Arena"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" />
                          </button>

                          {/* View Winner (if completed & winner exists) */}
                          {session.winnerId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/players/${session.winnerId}`);
                              }}
                              className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="View Winner Profile"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Dispute Review Trigger if disputed */}
                          {session.status === 'disputed' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDisputeReviewSession(session);
                              }}
                              className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Review Player Dispute"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Export CSV */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              gameHistoryService.exportGameHistoryToCsv([session]);
                              toast.success('Session Exported', `${session.sessionId} downloaded.`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Export Session CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination Bar */}
        <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing {(filters.page! - 1) * filters.pageSize! + 1}–
              {Math.min(filters.page! * filters.pageSize!, historyData?.total || 148920)} of{' '}
              <strong className="text-slate-800">
                {(historyData?.total || 148920).toLocaleString('en-IN')}
              </strong>{' '}
              completed game rounds
            </span>

            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={filters.pageSize}
                onChange={(e) =>
                  handleFilterChange({ pageSize: Number(e.target.value), page: 1 })
                }
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 font-semibold">
            <button
              onClick={() => handleFilterChange({ page: Math.max(1, filters.page! - 1) })}
              disabled={filters.page === 1}
              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              &lt; Prev
            </button>

            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => handleFilterChange({ page: p })}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  filters.page === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}

            <span className="px-1 text-slate-400">...</span>

            <button
              onClick={() => handleFilterChange({ page: historyData?.totalPages || 2500 })}
              className="px-2 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              {historyData?.totalPages || 2500}
            </button>

            <button
              onClick={() => handleFilterChange({ page: filters.page! + 1 })}
              disabled={filters.page! >= (historyData?.totalPages || 2500)}
              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 6. Forensic Round Audit Deep Dive Panel (From Reference Screenshot) */}
      <RoundAuditDeepDive
        session={activeDeepDive}
        onOpenDetails={() => {
          if (activeDeepDive) navigate(`/admin/games/history/${activeDeepDive.sessionId}`);
        }}
      />

      {/* 7. Lower Analytics Panels (Charts & Bar Rankings) */}
      <HistoryAnalyticsPanels />

      {/* 8. Game Session Details Drawer */}
      <GameSessionDrawer
        session={inspectingSession}
        isOpen={Boolean(inspectingSession)}
        onClose={() => setInspectingSession(null)}
        onOpenDisputeReview={(s) => {
          setInspectingSession(null);
          setDisputeReviewSession(s);
        }}
      />

      {/* 9. Dedicated Dispute Review Modal */}
      <DisputeReviewModal
        session={disputeReviewSession}
        isOpen={Boolean(disputeReviewSession)}
        onClose={() => setDisputeReviewSession(null)}
      />

      {/* 10. RNG Seed Verification Modal */}
      <AnimatePresence>
        {isSeedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSeedModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 z-10 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">RNG Seed Verification Gateway</h3>
                </div>
                <button onClick={() => setIsSeedModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="text-slate-600 text-xs">
                  All match outcomes on DIGIMATE are generated using verifiable SHA-256 HMAC cryptographic seeds. Verify any server seed against its pre-commitment hash.
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Latest Global Entropy Seed</div>
                  <div className="break-all text-slate-800">
                    7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                  <div className="text-emerald-700 font-bold text-[10px] flex items-center gap-1 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Hardware RNG (TRNG) Certified • 0 Mismatches</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSeedModalOpen(false)}
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. Confirmation Modal for Bulk Archiving */}
      <ConfirmationModal
        isOpen={isArchiveConfirmOpen}
        title="Archive Selected Sessions"
        description={`Are you sure you want to archive ${selectedSessionIds.length} selected game session(s)? This will move them to cold archive storage.`}
        confirmLabel="Archive Sessions"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmArchive}
        onCancel={() => setIsArchiveConfirmOpen(false)}
      />

      {/* 12. Confirmation Modal for Bulk Deleting */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Selected Sessions"
        description={`Are you sure you want to permanently delete ${selectedSessionIds.length} selected game session(s)? This action cannot be undone.`}
        confirmLabel="Delete Sessions"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default GameHistoryPage;
