import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  RotateCcw,
  Clock,
  Zap,
  ShieldCheck,
  Flame,
  Dices,
  Disc,
  Rocket,
  Sliders,
  Square,
  Coins,
  Gamepad2,
  Play,
  Edit3,
  Save,
  Check,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import {
  useLiveGames,
  useGames,
  useStartGame,
  useStopGame,
  useResetGame,
  useUpdateGame,
} from '../hooks/useGamesQuery';
import { formatINR } from '../utils/currency';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import LiveGamesKpiCards from '../components/games/LiveGamesKpiCards';
import LiveGamesFilterBar, { type LiveGamesFilters } from '../components/games/LiveGamesFilterBar';
import LiveGameConsoleDrawer from '../components/games/LiveGameConsoleDrawer';
import EditLiveGameModal from '../components/games/EditLiveGameModal';
import ConfirmationModal from '../components/games/ConfirmationModal';
import type { Game } from '../types/game';

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.28,
      ease: 'easeOut',
    },
  }),
};

function formatTickingDuration(baseDuration: string, elapsedTicks: number): string {
  try {
    const parts = baseDuration.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const totalSec = parts[0] * 60 + parts[1] + elapsedTicks;
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2] + elapsedTicks;
      const h = Math.floor(totalSec / 3600);
      const rem = totalSec % 3600;
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  } catch {
    // fallback
  }
  return baseDuration || 'Live';
}

export const LiveGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { data: liveGames = [], isLoading, refetch, isFetching } = useLiveGames();
  const { data: allGames = [] } = useGames();
  const startGameMutation = useStartGame();
  const stopMutation = useStopGame();
  const resetMutation = useResetGame();
  const updateGameMutation = useUpdateGame();

  // Selected for modals/drawer
  const [selectedToHalt, setSelectedToHalt] = useState<Game | null>(null);
  const [selectedToReset, setSelectedToReset] = useState<Game | null>(null);
  const [consoleGame, setConsoleGame] = useState<Game | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Quick Inline Edit Mode
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [inlineDrafts, setInlineDrafts] = useState<Record<string, Partial<Game>>>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<LiveGamesFilters>({
    search: '',
    category: 'all',
    occupancy: 'all',
    sortBy: 'pot_desc',
  });

  // Real-time ticking telemetry simulation (seconds tick & packet telemetry)
  const [elapsedTicks, setElapsedTicks] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTicks((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // KPI Computations
  const totalPlayers = useMemo(
    () => liveGames.reduce((sum, g) => sum + (g.currentPlayers || 0), 0),
    [liveGames]
  );
  const totalPot = useMemo(
    () => liveGames.reduce((sum, g) => sum + (g.currentPot > 0 ? g.currentPot : g.totalPot || 0), 0),
    [liveGames]
  );
  const totalCapacity = useMemo(
    () => liveGames.reduce((sum, g) => sum + (g.maxPlayers || 0), 0),
    [liveGames]
  );
  const avgPing = useMemo(() => {
    if (liveGames.length === 0) return 0;
    const sum = liveGames.reduce((acc, g) => acc + (g.pingMs || 20), 0);
    return sum / liveGames.length;
  }, [liveGames]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    liveGames.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [liveGames]);

  // Check for halted games in the selected category
  const haltedGamesForCategory = useMemo(() => {
    if (filters.category === 'all') return [];
    return allGames.filter((g) => g.category === filters.category && g.status !== 'live');
  }, [allGames, filters.category]);

  // Filter & Sort Logic
  const filteredGames = useMemo(() => {
    let result = liveGames.filter((game) => {
      // 1. Search (name, id, subtitle, rules)
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchName = game.name.toLowerCase().includes(q);
        const matchId = game.id.toLowerCase().includes(q);
        const matchSub = (game.subtitle || '').toLowerCase().includes(q);
        const matchCat = game.category.toLowerCase().includes(q);
        const matchAct = (game.activityLabel || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchSub && !matchCat && !matchAct) {
          return false;
        }
      }

      // 2. Category Filter
      if (filters.category !== 'all' && game.category !== filters.category) {
        return false;
      }

      // 3. Occupancy Filter
      if (filters.occupancy === 'almost_full') {
        const isAlmostFull = game.maxPlayers > 0 && game.currentPlayers >= game.maxPlayers * 0.8;
        if (!isAlmostFull) return false;
      } else if (filters.occupancy === 'open_seats') {
        if (game.currentPlayers >= game.maxPlayers) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      const potA = a.currentPot > 0 ? a.currentPot : a.totalPot || 0;
      const potB = b.currentPot > 0 ? b.currentPot : b.totalPot || 0;

      switch (filters.sortBy) {
        case 'pot_desc':
          return potB - potA;
        case 'players_desc':
          return b.currentPlayers - a.currentPlayers;
        case 'ping_asc':
          return (a.pingMs || 20) - (b.pingMs || 20);
        case 'round_desc':
          return (b.currentRound || 1) - (a.currentRound || 1);
        default:
          return 0;
      }
    });

    return result;
  }, [liveGames, filters]);

  // Confirmation Handlers
  const handleConfirmHalt = () => {
    if (!selectedToHalt) return;
    const target = selectedToHalt;

    stopMutation.mutate(target.id, {
      onSuccess: () => {
        toast.error('Arena Halted', `${target.name} stopped. All stakes reverted to player balances.`);
        setSelectedToHalt(null);
      },
      onError: () => {
        toast.error('Error', 'Unable to stop live arena session.');
      },
    });
  };

  const handleConfirmReset = () => {
    if (!selectedToReset) return;
    const target = selectedToReset;

    resetMutation.mutate(target.id, {
      onSuccess: () => {
        toast.info('Arena Table Reset', `${target.name} seats cleared and reverted to standby.`);
        setSelectedToReset(null);
      },
      onError: () => {
        toast.error('Error', 'Unable to reset arena table.');
      },
    });
  };

  const handleStartHaltedGame = (gameId: string, gameName: string) => {
    startGameMutation.mutate(gameId, {
      onSuccess: () => {
        toast.success('Arena Launched', `${gameName} is now live with active participants.`);
      },
      onError: () => {
        toast.error('Launch Failed', 'Unable to start arena instance.');
      },
    });
  };

  // Inline Edit Mode Handlers
  const handleToggleInlineEdit = () => {
    if (!isInlineEditMode) {
      const initial: Record<string, Partial<Game>> = {};
      liveGames.forEach((g) => {
        initial[g.id] = {
          name: g.name,
          subtitle: g.subtitle || '',
          category: g.category,
          currentPlayers: g.currentPlayers || 0,
          maxPlayers: g.maxPlayers || 6,
          currentPot: g.currentPot > 0 ? g.currentPot : g.totalPot || 0,
          currentRound: g.currentRound || 1,
        };
      });
      setInlineDrafts(initial);
      setIsInlineEditMode(true);
      toast.info(
        'Quick Table Edit Activated',
        'You can now edit names, categories, seating, pots, and rounds directly in the table.'
      );
    } else {
      setIsInlineEditMode(false);
    }
  };

  const handleDraftChange = (gameId: string, field: keyof Game, value: any) => {
    setInlineDrafts((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        [field]: value,
      },
    }));
  };

  const handleSaveInlineRow = (gameId: string) => {
    const draft = inlineDrafts[gameId];
    if (!draft) return;
    setSavingRowId(gameId);

    const payload: Partial<Game> = {
      ...draft,
      totalPot: draft.currentPot !== undefined ? draft.currentPot : undefined,
      prizePool: draft.currentPot !== undefined ? draft.currentPot : undefined,
    };

    updateGameMutation.mutate(
      { id: gameId, data: payload },
      {
        onSuccess: (saved) => {
          toast.success('Arena Updated', `${saved.name || 'Arena'} saved.`);
          setSavingRowId(null);
        },
        onError: () => {
          toast.error('Save Failed', 'Unable to update arena row.');
          setSavingRowId(null);
        },
      }
    );
  };

  const handleSaveAllInline = async () => {
    setIsSavingAll(true);
    try {
      const entries = Object.entries(inlineDrafts);
      for (const [id, draft] of entries) {
        await updateGameMutation.mutateAsync({
          id,
          data: {
            ...draft,
            totalPot: draft.currentPot !== undefined ? draft.currentPot : undefined,
            prizePool: draft.currentPot !== undefined ? draft.currentPot : undefined,
          },
        });
      }
      toast.success('All Arenas Saved', 'All table modifications saved successfully.');
      setIsInlineEditMode(false);
    } catch {
      toast.error('Save Error', 'Failed to save some arenas.');
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleSaveModal = (updatedData: Partial<Game>) => {
    if (!editingGame) return;
    updateGameMutation.mutate(
      { id: editingGame.id, data: updatedData },
      {
        onSuccess: (savedGame) => {
          toast.success('Arena Updated', `${savedGame.name || editingGame.name} saved successfully.`);
          setEditingGame(null);
        },
        onError: () => {
          toast.error('Update Failed', 'Unable to save arena changes.');
        },
      }
    );
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'Card':
        return <Coins className="w-3.5 h-3.5 text-blue-600" />;
      case 'Board':
        return <Dices className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Wheel':
        return <Disc className="w-3.5 h-3.5 text-pink-600" />;
      case 'Crash':
        return <Rocket className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Gamepad2 className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const renderActivityBadge = (label?: string) => {
    const act = label || 'Normal Activity';
    if (act.toLowerCase().includes('latency')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>{act}</span>
        </span>
      );
    }
    if (act.toLowerCase().includes('rng')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          <ShieldCheck className="w-3 h-3 text-indigo-600" />
          <span>{act}</span>
        </span>
      );
    }
    if (act.toLowerCase().includes('turnover') || act.toLowerCase().includes('high')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <Flame className="w-3 h-3 text-amber-600" />
          <span>{act}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{act}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Server Node Cluster Live</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400">Socket Telemetry Active</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Live Games Operations</span>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: 'all', search: '' }))}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Click to show all live sessions"
            >
              <AnimatedNumber value={liveGames.length} /> Active Sessions
            </button>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, seat occupancy, and management controls for arenas running on server nodes.
          </p>
        </div>

        {/* Header Right Stats & Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Players Online Badge - Clickable to sort by players */}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, sortBy: 'players_desc' }))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/90 text-emerald-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Click to sort by player count"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span><AnimatedNumber value={totalPlayers} /> Players Online</span>
          </button>

          {/* Live Pot Pill - Clickable to sort by pot */}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, sortBy: 'pot_desc' }))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200/90 text-blue-700 text-xs font-bold font-mono shadow-2xs transition-all cursor-pointer"
            title="Click to sort by highest pot"
          >
            <Coins className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Live Pot: <AnimatedNumber value={totalPot} format="currency" /></span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              refetch();
              toast.info('Telemetry Refreshed', 'Synced live arena state.');
            }}
            disabled={isFetching}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh telemetry"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Metrics Strip with CountUp */}
      <LiveGamesKpiCards
        liveGamesCount={liveGames.length}
        totalPlayers={totalPlayers}
        totalPot={totalPot}
        avgPing={avgPing}
        totalCapacity={totalCapacity}
        isLoading={isLoading}
        activeSort={filters.sortBy}
        onSelectSort={(sortTarget) => {
          if (sortTarget === 'all') {
            setFilters((prev) => ({ ...prev, category: 'all', search: '', occupancy: 'all' }));
          } else {
            setFilters((prev) => ({ ...prev, sortBy: sortTarget as any }));
          }
        }}
      />

      {/* 3. Filters & Category Toolbar */}
      <LiveGamesFilterBar
        filters={filters}
        categoryCounts={categoryCounts}
        onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        onReset={() =>
          setFilters({
            search: '',
            category: 'all',
            occupancy: 'all',
            sortBy: 'pot_desc',
          })
        }
        filteredCount={filteredGames.length}
        totalCount={liveGames.length}
        isInlineEditMode={isInlineEditMode}
        onToggleInlineEdit={handleToggleInlineEdit}
      />

      {/* 4. Main Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {/* Quick Inline Edit Mode Banner */}
        {isInlineEditMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-950 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-amber-900">Quick Table Edit Mode Active</span>
                <span className="text-amber-700 text-[11px] ml-2 hidden md:inline">
                  Modify arena names, categories, seating, pots, and rounds directly in the cells.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSavingAll}
                onClick={handleSaveAllInline}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingAll ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving All...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsInlineEditMode(false)}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Exit Edit Mode
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-24 text-xs text-slate-400 space-y-2">
            <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>Polling live multiplayer arena telemetry...</div>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200 shadow-2xs">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">
                {liveGames.length === 0
                  ? 'No Games Currently Live'
                  : `No Live ${filters.category !== 'all' ? filters.category : ''} Arenas`}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                {haltedGamesForCategory.length > 0
                  ? `There is ${haltedGamesForCategory.length} arena available in standby for this category.`
                  : 'Try clearing your search keyword or switching category tabs.'}
              </p>
            </div>

            {/* Quick Action: Start Halted Game if available */}
            {haltedGamesForCategory.length > 0 ? (
              <div className="pt-2 flex flex-col items-center gap-2">
                {haltedGamesForCategory.map((hg) => (
                  <button
                    key={hg.id}
                    type="button"
                    onClick={() => handleStartHaltedGame(hg.id, hg.name)}
                    disabled={startGameMutation.isPending}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch & Start {hg.name} ({hg.category})</span>
                  </button>
                ))}
              </div>
            ) : liveGames.length > 0 ? (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: '',
                    category: 'all',
                    occupancy: 'all',
                    sortBy: 'pot_desc',
                  })
                }
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/admin/games')}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Go to Game Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-left border-collapse text-xs"
              aria-label="Live games operations table"
            >
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th className="px-4.5 py-3">GAME</th>
                  <th className="px-4.5 py-3">CATEGORY</th>
                  <th className="px-4.5 py-3">
                    {isInlineEditMode ? 'SEATED / MAX' : 'PLAYERS / CAPACITY'}
                  </th>
                  <th className="px-4.5 py-3">
                    {isInlineEditMode ? 'LIVE POT (₹)' : 'CURRENT POT'}
                  </th>
                  <th className="px-4.5 py-3">ROUND / DURATION</th>
                  <th className="px-4.5 py-3">STATUS & ACTIVITY</th>
                  <th className="px-4.5 py-3 text-right">ADMIN CONTROLS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredGames.map((game, idx) => {
                  const pot = game.currentPot > 0 ? game.currentPot : game.totalPot || 0;
                  const occupancyRatio =
                    game.maxPlayers > 0
                      ? Math.round((game.currentPlayers / game.maxPlayers) * 100)
                      : 0;
                  const isAlmostFull = game.maxPlayers > 0 && occupancyRatio >= 80;
                  const isLowActivity = game.currentPlayers <= 1;

                  // Dynamic ticking duration & realistic ping jitter
                  const tickingDuration = formatTickingDuration(game.duration || '05:00', elapsedTicks);
                  const dynamicPing = Math.max(
                    12,
                    (game.pingMs || 20) + (Math.sin(elapsedTicks * 0.5 + idx) > 0 ? 1 : -1)
                  );

                  // If in Inline Edit Mode
                  if (isInlineEditMode) {
                    const draft = inlineDrafts[game.id] || {};
                    const isRowSaving = savingRowId === game.id;

                    return (
                      <motion.tr
                        key={game.id}
                        custom={idx}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-amber-50/20 hover:bg-amber-50/40 transition-colors"
                      >
                        {/* 1. GAME INLINE */}
                        <td className="px-4.5 py-3 font-semibold text-slate-900">
                          <div className="space-y-1.5 min-w-[190px]">
                            <input
                              type="text"
                              value={draft.name ?? game.name}
                              onChange={(e) => handleDraftChange(game.id, 'name', e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                              placeholder="Arena Name"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.2 rounded border border-slate-200 shrink-0">
                                {game.id}
                              </span>
                              <input
                                type="text"
                                value={draft.subtitle ?? game.subtitle ?? ''}
                                onChange={(e) =>
                                  handleDraftChange(game.id, 'subtitle', e.target.value)
                                }
                                className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Subtitle / Variant"
                              />
                            </div>
                          </div>
                        </td>

                        {/* 2. CATEGORY INLINE */}
                        <td className="px-4.5 py-3">
                          <select
                            value={draft.category ?? game.category}
                            onChange={(e) =>
                              handleDraftChange(game.id, 'category', e.target.value as any)
                            }
                            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                          >
                            <option value="Card">Card</option>
                            <option value="Board">Board</option>
                            <option value="Wheel">Wheel</option>
                            <option value="Crash">Crash</option>
                            <option value="Arcade">Arcade</option>
                            <option value="Strategy">Strategy</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>

                        {/* 3. PLAYERS / CAPACITY INLINE */}
                        <td className="px-4.5 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={draft.currentPlayers ?? game.currentPlayers}
                              onChange={(e) =>
                                handleDraftChange(game.id, 'currentPlayers', Number(e.target.value))
                              }
                              className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                              title="Current Seated Players"
                            />
                            <span className="text-slate-400 font-mono">/</span>
                            <input
                              type="number"
                              min={1}
                              value={draft.maxPlayers ?? game.maxPlayers}
                              onChange={(e) =>
                                handleDraftChange(game.id, 'maxPlayers', Number(e.target.value))
                              }
                              className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-500 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                              title="Max Table Capacity"
                            />
                          </div>
                        </td>

                        {/* 4. CURRENT POT INLINE */}
                        <td className="px-4.5 py-3">
                          <div className="flex items-center gap-1 min-w-[130px]">
                            <span className="text-emerald-700 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min={0}
                              step={100}
                              value={
                                draft.currentPot ??
                                (game.currentPot > 0 ? game.currentPot : game.totalPot || 0)
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleDraftChange(game.id, 'currentPot', val);
                                handleDraftChange(game.id, 'totalPot', val);
                              }}
                              className="w-24 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                              title="Live Pot Amount (INR)"
                            />
                          </div>
                        </td>

                        {/* 5. ROUND INLINE */}
                        <td className="px-4.5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 text-[11px] font-semibold">Rnd</span>
                            <input
                              type="number"
                              min={0}
                              value={draft.currentRound ?? game.currentRound ?? 1}
                              onChange={(e) =>
                                handleDraftChange(game.id, 'currentRound', Number(e.target.value))
                              }
                              className="w-12 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                              title="Current Round"
                            />
                          </div>
                        </td>

                        {/* 6. STATUS */}
                        <td className="px-4.5 py-3">
                          <div>{renderActivityBadge(game.activityLabel)}</div>
                        </td>

                        {/* 7. CONTROLS INLINE */}
                        <td className="px-4.5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isRowSaving}
                              onClick={() => handleSaveInlineRow(game.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Save row modifications"
                            >
                              {isRowSaving ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Save</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingGame(game)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Open complete edit modal"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>More</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  // Default Normal View
                  return (
                    <motion.tr
                      key={game.id}
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      onDoubleClick={() => setEditingGame(game)}
                      className="hover:bg-slate-50/70 transition-colors group cursor-default"
                      title="Double-click row to edit arena"
                    >
                      {/* 1. GAME */}
                      <td className="px-4.5 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {/* Live pulse dot and category badge */}
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
                              {renderCategoryIcon(game.category)}
                            </div>
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setConsoleGame(game)}
                                className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left block text-xs cursor-pointer"
                                title="Click to open live arena console"
                              >
                                {game.name}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGame(game);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 rounded transition-opacity cursor-pointer"
                                title="Edit arena details"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{game.id}</span>
                              {game.subtitle && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[150px] font-sans">
                                    {game.subtitle}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CATEGORY */}
                      <td className="px-4.5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, category: game.category }))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                          title={`Filter by ${game.category}`}
                        >
                          {renderCategoryIcon(game.category)}
                          <span>{game.category}</span>
                        </button>
                      </td>

                      {/* 3. PLAYERS / CAPACITY - Interactive */}
                      <td
                        className="px-4.5 py-3.5 cursor-pointer"
                        onClick={() => setConsoleGame(game)}
                        title="Click to view seated players in console"
                      >
                        <div className="space-y-1.5 group-hover:opacity-90">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 tabular-nums font-mono text-[13px]">
                              {game.currentPlayers}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              / {game.maxPlayers}
                            </span>
                            {isAlmostFull && (
                              <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Almost Full
                              </span>
                            )}
                            {isLowActivity && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                Low
                              </span>
                            )}
                          </div>

                          {/* Seated Avatars Strip + Occupancy Bar */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {(game.activeSeats && game.activeSeats.length > 0
                                ? game.activeSeats.slice(0, 4)
                                : ['AP', 'RS']
                              ).map((seat, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="w-5 h-5 rounded-md bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white"
                                  title={`Seat: ${seat}`}
                                >
                                  {seat}
                                </div>
                              ))}
                            </div>

                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  occupancyRatio >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, occupancyRatio)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 4. CURRENT POT - Interactive */}
                      <td
                        className="px-4.5 py-3.5 cursor-pointer"
                        onClick={() => setConsoleGame(game)}
                        title="Click to view pot breakdown in console"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-600 font-mono text-sm tracking-tight hover:underline">
                            {formatINR(pot)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Entry: {formatINR(game.entryAmount || game.minEntry)}
                          </div>
                        </div>
                      </td>

                      {/* 5. ROUND / DURATION - Live Ticking Clock */}
                      <td
                        className="px-4.5 py-3.5 text-xs text-slate-700 cursor-pointer"
                        onClick={() => setConsoleGame(game)}
                        title="Click to inspect round in console"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <span>Round {game.currentRound || 1}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-slate-700">{tickingDuration}</span>
                          </div>
                          {game.roundStatus && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[130px]" title={game.roundStatus}>
                              {game.roundStatus}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. STATUS & ACTIVITY - Live Socket Telemetry */}
                      <td
                        className="px-4.5 py-3.5 cursor-pointer"
                        onClick={() => setConsoleGame(game)}
                        title="Click to view socket telemetry stream"
                      >
                        <div className="space-y-1">
                          <div>{renderActivityBadge(game.activityLabel)}</div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                            <span>{dynamicPing} ms latency</span>
                          </div>
                        </div>
                      </td>

                      {/* 7. ADMIN CONTROLS */}
                      <td className="px-4.5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Arena Button */}
                          <button
                            type="button"
                            onClick={() => setEditingGame(game)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Edit arena settings, pot, stakes & telemetry"
                          >
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            <span>Edit</span>
                          </button>

                          {/* Console Button */}
                          <button
                            type="button"
                            onClick={() => setConsoleGame(game)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Open live arena console"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Console</span>
                          </button>

                          {/* Reset Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedToReset(game)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Reset table state"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reset</span>
                          </button>

                          {/* Halt Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedToHalt(game)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Halt arena and revert stakes"
                          >
                            <Square className="w-3.5 h-3.5 text-rose-600" />
                            <span>Halt</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Live Arena Console Slide-Over Drawer */}
      <LiveGameConsoleDrawer
        isOpen={Boolean(consoleGame)}
        game={consoleGame}
        onClose={() => setConsoleGame(null)}
        onHaltClick={(g) => {
          setConsoleGame(null);
          setSelectedToHalt(g);
        }}
        onResetClick={(g) => {
          setConsoleGame(null);
          setSelectedToReset(g);
        }}
        onEditClick={(g) => {
          setConsoleGame(null);
          setEditingGame(g);
        }}
      />

      {/* 6. Stop Game Modal */}
      <ConfirmationModal
        isOpen={Boolean(selectedToHalt)}
        title="Halt Live Arena Session?"
        description={`Are you sure you want to stop ${selectedToHalt?.name}? The active multiplayer round will terminate immediately and all locked pot stakes will be refunded to seated players.`}
        isDestructive={true}
        confirmLabel="Halt Arena"
        onConfirm={handleConfirmHalt}
        onCancel={() => setSelectedToHalt(null)}
      />

      {/* 7. Reset Game Modal */}
      <ConfirmationModal
        isOpen={Boolean(selectedToReset)}
        title={`Reset Table for ${selectedToReset?.name}?`}
        description="This will clear active seated participants, reset the round counter, and return the arena to standby initialization state."
        isDestructive={false}
        confirmLabel="Reset Table"
        onConfirm={handleConfirmReset}
        onCancel={() => setSelectedToReset(null)}
      />

      {/* 8. Edit Arena Modal */}
      <EditLiveGameModal
        isOpen={Boolean(editingGame)}
        game={editingGame}
        isLoading={updateGameMutation.isPending}
        onSave={handleSaveModal}
        onClose={() => setEditingGame(null)}
      />
    </div>
  );
};

export default LiveGamesPage;
