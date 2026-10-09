import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Game } from '../types/game';
import {
  useGames,
  useGameMetrics,
  useGameActivity,
  useBulkEnableGames,
  useBulkDisableGames,
  useBulkDeleteGames,
  useDeleteGame,
  useStopGame,
  useEmergencyFreezeAll,
} from '../hooks/useGamesQuery';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { useToast } from '../hooks/useToast';
import GameCard from '../components/games/GameCard';
import ConfirmationModal from '../components/games/ConfirmationModal';
import EditPillModal from '../components/games/EditPillModal';
import type { ArenaCategoryPill } from '../components/games/EditPillModal';

const DEFAULT_ARENA_PILLS: ArenaCategoryPill[] = [
  { id: 'all', name: 'All Arenas', category: 'all', isDefault: true },
  { id: 'poker', name: 'Poker Rooms', category: 'Card', keyword: 'poker' },
  { id: 'ludo', name: 'Ludo Arenas', category: 'Board', keyword: 'ludo' },
  { id: 'wheel', name: 'Roulette & Wheel', category: 'Wheel' },
  { id: 'crash', name: 'Crash Arenas', category: 'Crash' },
];

const PILLS_STORAGE_KEY = 'game_admin_arena_pills_v1';

function MetricCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-3.5 shadow-xs transition-shadow hover:shadow-sm ${
        highlight ? 'border-blue-300 ring-1 ring-blue-500/10' : 'border-slate-200'
      }`}
    >
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
        <AnimatedNumber value={value} />
      </div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export const AllGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Queries
  const { data: games = [], isLoading, refetch, isFetching } = useGames();
  const { data: metrics } = useGameMetrics();
  const { data: platformEvents = [] } = useGameActivity();

  // Mutations
  const bulkEnable = useBulkEnableGames();
  const bulkDisable = useBulkDisableGames();
  const bulkDelete = useBulkDeleteGames();
  const deleteSingle = useDeleteGame();
  const stopSingle = useStopGame();
  const emergencyFreeze = useEmergencyFreezeAll();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [playerActivityFilter, setPlayerActivityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [arenaPill, setArenaPill] = useState<string>('all');
  const [arenaPills, setArenaPills] = useState<ArenaCategoryPill[]>([
    { id: 'all', name: 'All Arenas', category: 'all', isDefault: true }
  ]);

  useEffect(() => {
    if (games.length === 0) return;
    const uniqueCategories = Array.from(new Set(games.map(g => g.category || 'Other').filter(c => c.trim() !== '')));
    
    const dynamicPills: ArenaCategoryPill[] = [
      { id: 'all', name: 'All Arenas', category: 'all', isDefault: true },
      ...uniqueCategories.map(cat => ({
        id: cat.toLowerCase(),
        name: cat,
        category: cat,
      }))
    ];
    
    setArenaPills(dynamicPills);
  }, [games]);

  const [editingPill, setEditingPill] = useState<ArenaCategoryPill | null>(null);
  const [isNewPill, setIsNewPill] = useState(false);
  const [isPillModalOpen, setIsPillModalOpen] = useState(false);

  // Selection & modals state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [gameToStop, setGameToStop] = useState<Game | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

  // Sync timer countdown simulation (4s)
  const [syncCountdown, setSyncCountdown] = useState(4);
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncCountdown((prev) => (prev <= 1 ? 4 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic pill count calculator
  const getPillCount = (pill: ArenaCategoryPill) => {
    if (pill.id === 'all' || (pill.category === 'all' && !pill.keyword)) {
      return games.length;
    }
    return games.filter((g) => {
      let matchCat = true;
      if (pill.category && pill.category !== 'all') {
        matchCat = g.category === pill.category;
      }
      let matchKeyword = true;
      if (pill.keyword && pill.keyword.trim()) {
        const kw = pill.keyword.toLowerCase();
        matchKeyword =
          g.name.toLowerCase().includes(kw) ||
          (g.subtitle || '').toLowerCase().includes(kw) ||
          g.category.toLowerCase().includes(kw);
      }
      return matchCat && matchKeyword;
    }).length;
  };

  // Filter & Sort Logic
  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        // Dynamic Category Pill Filter
        const activePillConfig = arenaPills.find((p) => p.id === arenaPill);
        if (activePillConfig && activePillConfig.id !== 'all') {
          let matchCat = true;
          if (activePillConfig.category && activePillConfig.category !== 'all') {
            matchCat = g.category === activePillConfig.category;
          }
          let matchKeyword = true;
          if (activePillConfig.keyword && activePillConfig.keyword.trim()) {
            const kw = activePillConfig.keyword.toLowerCase();
            matchKeyword =
              g.name.toLowerCase().includes(kw) ||
              (g.subtitle || '').toLowerCase().includes(kw) ||
              g.category.toLowerCase().includes(kw);
          }
          if (!matchCat || !matchKeyword) return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = g.name.toLowerCase().includes(q);
          const matchId = g.id.toLowerCase().includes(q);
          const matchCat = g.category.toLowerCase().includes(q);
          const matchSub = (g.subtitle || '').toLowerCase().includes(q);
          if (!matchName && !matchId && !matchCat && !matchSub) return false;
        }

        // Status Filter
        if (statusFilter !== 'all' && g.status !== statusFilter) {
          return false;
        }

        // Category Filter
        if (categoryFilter !== 'all' && g.category !== categoryFilter) {
          return false;
        }

        // Player Activity Filter
        if (playerActivityFilter === 'no_players' && g.currentPlayers > 0) return false;
        if (playerActivityFilter === '1_10' && (g.currentPlayers < 1 || g.currentPlayers > 10)) return false;
        if (playerActivityFilter === '11_50' && (g.currentPlayers < 11 || g.currentPlayers > 50)) return false;
        if (playerActivityFilter === '50_plus' && g.currentPlayers <= 50) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'most_players') return b.currentPlayers - a.currentPlayers;
        if (sortBy === 'least_players') return a.currentPlayers - b.currentPlayers;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'recently_updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return 0;
      });
  }, [games, searchTerm, statusFilter, categoryFilter, playerActivityFilter, sortBy, arenaPill, arenaPills]);

  // Bulk actions toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGames.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGames.map((g) => g.id));
    }
  };

  const handleBulkEnable = () => {
    if (selectedIds.length === 0) return;
    bulkEnable.mutate(selectedIds, {
      onSuccess: () => {
        toast.success('Games Enabled', `${selectedIds.length} games enabled.`);
        setSelectedIds([]);
      },
    });
  };

  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;
    bulkDisable.mutate(selectedIds, {
      onSuccess: () => {
        toast.info('Games Disabled', `${selectedIds.length} games disabled.`);
        setSelectedIds([]);
      },
    });
  };

  const handleBulkDeleteConfirm = () => {
    bulkDelete.mutate(selectedIds, {
      onSuccess: () => {
        toast.success('Games Deleted', `${selectedIds.length} games removed.`);
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      },
    });
  };

  const handleDeleteSingleConfirm = () => {
    if (!gameToDelete) return;
    deleteSingle.mutate(gameToDelete.id, {
      onSuccess: () => {
        toast.success('Game Deleted', `${gameToDelete.name} has been deleted.`);
        setGameToDelete(null);
      },
    });
  };

  const handleStopSingleConfirm = () => {
    if (!gameToStop) return;
    stopSingle.mutate(gameToStop.id, {
      onSuccess: () => {
        toast.error('Game Stopped', `${gameToStop.name} session halted.`);
        setGameToStop(null);
      },
    });
  };

  const handleEmergencyFreezeConfirm = () => {
    emergencyFreeze.mutate(undefined, {
      onSuccess: () => {
        toast.error('Emergency Freeze Executed', 'All live tables terminated.');
        setIsFreezeModalOpen(false);
      },
    });
  };

  const handleOpenEditPill = (pill: ArenaCategoryPill, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPill(pill);
    setIsNewPill(false);
    setIsPillModalOpen(true);
  };

  const handleOpenNewPill = () => {
    setEditingPill(null);
    setIsNewPill(true);
    setIsPillModalOpen(true);
  };

  const handleSavePill = (saved: ArenaCategoryPill) => {
    setArenaPills((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const updated = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
      try {
        localStorage.setItem(PILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    setIsPillModalOpen(false);
    toast.success('Tab Saved', `Arena tab "${saved.name}" updated.`);
  };

  const handleDeletePill = (id: string) => {
    setArenaPills((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(PILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    if (arenaPill === id) {
      setArenaPill('all');
    }
    setIsPillModalOpen(false);
    toast.info('Tab Deleted', 'Arena tab removed.');
  };

  const handleResetPills = () => {
    setArenaPills(DEFAULT_ARENA_PILLS);
    localStorage.removeItem(PILLS_STORAGE_KEY);
    toast.info('Tabs Reset', 'Restored default arena tabs.');
  };

  return (
    <div className="space-y-4.5 pb-12 max-w-7xl mx-auto">
      {/* 1. Page Header with Title, Actions & Emergency Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Live Games Monitor</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● CLUSTER 24/48
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage games, configurations, live sessions and game availability.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            title="Refresh game states"
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${isFetching ? 'animate-ping' : ''}`} />
            Auto-sync in {syncCountdown}s
          </button>

          <button
            onClick={() => setIsFreezeModalOpen(true)}
            className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Emergency Freeze All
          </button>

          <button
            onClick={() => navigate('/admin/games/new')}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
          >
            + Create Game
          </button>
        </div>
      </div>

      {/* 2. Real-time Telemetry Banner (from Reference Image) */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Real-time socket synchronized</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-900 font-semibold">
            {metrics?.playersPlaying || 386} Concurrent Players in {metrics?.liveGames || 6} Active Arenas
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-mono text-[11px]">Mumbai Core Engine v3.1</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>EDGE: <strong className="text-slate-700 font-medium">BOM-01</strong></span>
          <span>PACKET LOSS: <strong className="text-emerald-600 font-semibold">0.00%</strong></span>
        </div>
      </div>

      {/* 3. Top Functional Statistics Cards (Dynamic from Service Layer) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Games" value={metrics?.totalGames ?? games.length} sub="in catalog" />
        <MetricCard label="Live Games" value={metrics?.liveGames ?? 6} sub="active sessions" highlight={true} />
        <MetricCard label="Players Playing" value={metrics?.playersPlaying ?? 386} sub="currently seated" />
        <MetricCard label="Enabled Games" value={metrics?.enabledGames ?? 20} sub="queue accepting" />
        <MetricCard label="Disabled Games" value={metrics?.disabledGames ?? 4} sub="in maintenance" />
        <MetricCard label="Games Today" value={metrics?.gamesToday ?? 142} sub="rounds concluded" />
      </div>

      {/* 4. Filter Toolbar & Pill Tabs (Reference Image Style) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Category Pill Buttons with Edit / Add controls */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {arenaPills.map((pill) => {
              const count = getPillCount(pill);
              const isSelected = arenaPill === pill.id;

              return (
                <div key={pill.id} className="group relative inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => setArenaPill(pill.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <span>
                      {pill.name} ({count})
                    </span>
                    {/* Edit Pencil icon button */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleOpenEditPill(pill, e)}
                      title={`Edit "${pill.name}" tab`}
                      className={`ml-0.5 p-0.5 rounded transition-opacity ${
                        isSelected
                          ? 'text-blue-100 hover:text-white hover:bg-blue-500/50 opacity-70 group-hover:opacity-100'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </span>
                  </button>
                </div>
              );
            })}

          </div>
        </div>

        {/* Search & Detailed Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search games by name, ID, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Status: All</option>
              <option value="live">Live</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Category: All</option>
              {arenaPills.filter(p => p.id !== 'all').map(p => (
                <option key={p.id} value={p.category}>{p.name}</option>
              ))}
            </select>

            {/* Player Activity */}
            <select
              value={playerActivityFilter}
              onChange={(e) => setPlayerActivityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Activity: All</option>
              <option value="no_players">No Players</option>
              <option value="1_10">1–10 Players</option>
              <option value="11_50">11–50 Players</option>
              <option value="50_plus">50+ Players</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="name">Sort: Name</option>
              <option value="most_players">Most Players</option>
              <option value="least_players">Least Players</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="recently_updated">Recently Updated</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
                aria-label="Grid view"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
                aria-label="Table view"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>{selectedIds.length} {selectedIds.length === 1 ? 'game' : 'games'} selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkEnable}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
              >
                Enable Selected
              </button>
              <button
                onClick={handleBulkDisable}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
              >
                Disable Selected
              </button>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-blue-700 hover:underline px-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Main Games View (Grid or Table) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-xs text-slate-400">
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
          Loading games...
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="text-sm font-bold text-slate-900">No Games Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No game arenas matched your search query or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setPlayerActivityFilter('all');
              setArenaPill('all');
            }}
            className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (3x2 responsive card matrix matching reference UI) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          <AnimatePresence>
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={selectedIds.includes(game.id)}
                onToggleSelect={toggleSelect}
                onRequestDelete={(g) => setGameToDelete(g)}
                onRequestStop={(g) => setGameToStop(g)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-4.5 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredGames.length && filteredGames.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Game</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Category</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Players</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Capacity</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Pot / Stakes</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Status</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4.5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(game.id)}
                        onChange={() => toggleSelect(game.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div
                        onClick={() => navigate(`/admin/games/${game.id}`)}
                        className="hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {game.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{game.id}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-600">{game.category}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 tabular-nums">
                      {game.currentPlayers}{' '}
                      <span className="text-xs text-slate-400 font-normal">/ {game.maxPlayers}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{game.maxPlayers} seats</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 tabular-nums">
                      ₹{game.currentPot > 0 ? game.currentPot.toLocaleString('en-IN') : game.totalPot.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          game.status === 'live'
                            ? 'bg-emerald-50 text-emerald-700'
                            : game.status === 'enabled'
                            ? 'bg-blue-50 text-blue-700'
                            : game.status === 'disabled'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/games/${game.id}`)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setGameToDelete(game)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Real-time Platform Game Events Stream (From Reference Image!) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              ⚡
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Real-time Platform Game Events
              </h3>
              <p className="text-[11px] text-slate-400">Streaming low-latency room mutations.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live WebSockets Active
            </span>
            <button
              onClick={() => toast.info('Event Log', 'Event logs cleared.')}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              Clear Feed
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {platformEvents.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">{evt.timestamp}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100">
                  {evt.gameName || 'TABLE'}
                </span>
                <span className="text-slate-700 font-medium">{evt.message}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Synced</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={Boolean(gameToDelete)}
        title={`Delete ${gameToDelete?.name}?`}
        description={`Are you sure you want to delete ${gameToDelete?.name} (${gameToDelete?.id})? This action cannot be undone.`}
        isDestructive={true}
        confirmLabel="Delete Game"
        onConfirm={handleDeleteSingleConfirm}
        onCancel={() => setGameToDelete(null)}
      />

      <ConfirmationModal
        isOpen={Boolean(gameToStop)}
        title="Stop Game Session?"
        description={`Are you sure you want to stop ${gameToStop?.name}? This will immediately end the current session.`}
        isDestructive={true}
        confirmLabel="Stop Game"
        onConfirm={handleStopSingleConfirm}
        onCancel={() => setGameToStop(null)}
      />

      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        title="Delete Selected Games?"
        description={`Are you sure you want to delete ${selectedIds.length} selected games? This action cannot be undone.`}
        isDestructive={true}
        confirmLabel="Delete Selected"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isFreezeModalOpen}
        title="Emergency Freeze All Tables?"
        description="This will immediately freeze all running game sessions on all clusters. Players will be refunded and sockets disconnected."
        isDestructive={true}
        confirmLabel="Execute Freeze"
        onConfirm={handleEmergencyFreezeConfirm}
        onCancel={() => setIsFreezeModalOpen(false)}
      />

      {/* Editable Arena Category Pills Modal */}
      <EditPillModal
        isOpen={isPillModalOpen}
        pill={editingPill}
        isNew={isNewPill}
        onSave={handleSavePill}
        onDelete={handleDeletePill}
        onClose={() => setIsPillModalOpen(false)}
      />
    </div>
  );
};

export default AllGamesPage;
