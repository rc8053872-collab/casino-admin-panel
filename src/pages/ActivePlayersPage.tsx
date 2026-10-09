import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  Search,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  AlertTriangle,
  UserCheck,
  Eye,
} from 'lucide-react';
import {
  useActivePlayers,
  useActivePlayerStats,
  useEndActiveSession,
} from '../hooks/useActivePlayersQuery';
import type { ActivePlayerTelemetry } from '../services/activePlayerService';
import GsapLiveStatStrip from '../components/players/GsapLiveStatStrip';
import LivePlayerActivityChart from '../components/players/LivePlayerActivityChart';
import ActivePlayerDrawer from '../components/players/ActivePlayerDrawer';
import ConfirmationModal from '../components/games/ConfirmationModal';
import { formatINR } from '../lib/formatters';
import { useToast } from '../hooks/useToast';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

type StatusTab = 'all' | 'in_match' | 'lobby';
type DeviceFilter = 'all' | 'desktop' | 'mobile' | 'tablet';
type DurationFilter = 'all' | '<10m' | '10-30m' | '30-60m' | '1h+';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const ActivePlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Telemetry Queries
  const { data: players = [], isLoading, refetch, isFetching } = useActivePlayers();
  const { data: stats } = useActivePlayerStats();
  const endSessionMutation = useEndActiveSession();

  // Filters state
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');

  // Drawer & Inspection state
  const [inspectingPlayer, setInspectingPlayer] = useState<ActivePlayerTelemetry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMenuPlayerId, setActiveMenuPlayerId] = useState<string | null>(null);

  // End Session Confirmation Modal state
  const [playerToEndSession, setPlayerToEndSession] = useState<ActivePlayerTelemetry | null>(null);

  // Sync Timer state (e.g., 8s countdown)
  const [secondsAgo, setSecondsAgo] = useState(8);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev <= 1 ? 8 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuPlayerId(null);
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // Filtered players computation
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // 1. Tab filter
      if (activeTab === 'in_match' && player.status !== 'in_match') return false;
      if (activeTab === 'lobby' && player.status === 'in_match') return false;

      // 2. Search query (username, ID, name, region)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = player.username.toLowerCase().includes(q);
        const matchId = player.playerId.toLowerCase().includes(q);
        const matchName = `${player.firstName} ${player.lastName}`.toLowerCase().includes(q);
        const matchRegion = player.region.toLowerCase().includes(q);
        if (!matchUser && !matchId && !matchName && !matchRegion) return false;
      }

      // 3. Game filter
      if (gameFilter !== 'all') {
        if (!player.currentGameName) return false;
        if (!player.currentGameName.toLowerCase().includes(gameFilter.toLowerCase())) return false;
      }

      // 4. Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'in_match' && player.status !== 'in_match') return false;
        if (statusFilter === 'lobby' && (player.status !== 'active' && player.status !== 'idle')) return false;
        if (statusFilter === 'idle' && player.status !== 'idle') return false;
      }

      // 5. Device filter
      if (deviceFilter !== 'all' && player.device !== deviceFilter) return false;

      // 6. Session duration filter
      if (durationFilter !== 'all') {
        const match = player.sessionDurationText.match(/(\d+)m/);
        const minutes = match ? parseInt(match[1], 10) : 0;
        if (durationFilter === '<10m' && minutes >= 10) return false;
        if (durationFilter === '10-30m' && (minutes < 10 || minutes > 30)) return false;
        if (durationFilter === '30-60m' && (minutes < 30 || minutes > 60)) return false;
        if (durationFilter === '1h+' && minutes < 60) return false;
      }

      return true;
    });
  }, [players, activeTab, searchQuery, gameFilter, statusFilter, deviceFilter, durationFilter]);

  // Handlers
  const handleInspect = (player: ActivePlayerTelemetry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setInspectingPlayer(player);
    setIsDrawerOpen(true);
    setActiveMenuPlayerId(null);
  };

  const handleOpenEndSessionConfirm = (player: ActivePlayerTelemetry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPlayerToEndSession(player);
    setActiveMenuPlayerId(null);
  };

  const handleConfirmEndSession = () => {
    if (!playerToEndSession) return;
    const targetPlayer = playerToEndSession;
    endSessionMutation.mutate(targetPlayer.id, {
      onSuccess: () => {
        toast.success(
          'Player Session Ended',
          `${targetPlayer.username} has been disconnected and session terminated.`
        );
        setPlayerToEndSession(null);
        if (inspectingPlayer?.id === targetPlayer.id) {
          setIsDrawerOpen(false);
          setInspectingPlayer(null);
        }
      },
      onError: (err: any) => {
        toast.error('Failed to End Session', err?.message || 'Unexpected server error.');
      },
    });
  };

  const handleRefresh = async () => {
    await refetch();
    setSecondsAgo(8);
    toast.info('Telemetry Synced', 'Active player telemetry updated.');
  };

  const resetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setGameFilter('all');
    setStatusFilter('all');
    setDeviceFilter('all');
    setDurationFilter('all');
  };

  // Helper icon for device
  const renderDeviceIcon = (device: 'desktop' | 'mobile' | 'tablet') => {
    switch (device) {
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800"
    >
      {/* 1. Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Active Players Monitor
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              TELEMETRY CLUSTER 01
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live telemetry of connected and in-game accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Subtle Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              LIVE
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-800"><AnimatedNumber value={players.length} /> Active Players</span>
          </div>

          {/* Sync status & button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 active:translate-y-0.5 text-slate-600 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            title="Force telemetry sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing...' : `Last synced ${secondsAgo}s ago`}</span>
          </button>

          {/* Add Player button */}
          <button
            onClick={() => navigate('/admin/players/new')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Add Player</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Live Summary Strip with GSAP Count-Ups */}
      <motion.div variants={itemVariants}>
        <GsapLiveStatStrip
          activeNow={stats?.activeNow ?? players.length}
          inMatch={stats?.inMatch ?? players.filter((p) => p.status === 'in_match').length}
          lobbyOnline={
            stats?.lobbyOnline ??
            players.filter((p) => p.status === 'active' || p.status === 'idle').length
          }
          avgSession={stats?.avgSession ?? '24m'}
          totalBalance={
            stats?.totalBalance ?? players.reduce((sum, p) => sum + p.balance, 0)
          }
          lastUpdateText={`${secondsAgo} sec ago`}
        />
      </motion.div>

      {/* 3. Player Activity Mini Graph */}
      <motion.div variants={itemVariants}>
        <LivePlayerActivityChart
          data={
            stats?.activityHistory ?? [
              { time: '30m', players: 2, inMatch: 1, lobby: 1 },
              { time: '25m', players: 3, inMatch: 1, lobby: 2 },
              { time: '20m', players: 3, inMatch: 1, lobby: 2 },
              { time: '15m', players: 4, inMatch: 2, lobby: 2 },
              { time: '10m', players: 4, inMatch: 1, lobby: 3 },
              { time: '5m', players: 5, inMatch: 2, lobby: 3 },
              { time: 'Now', players: players.length, inMatch: 1, lobby: 3 },
            ]
          }
          currentCount={players.length}
        />
      </motion.div>

      {/* 4. Player Status Tabs & Quick Filters */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5"
      >
        {/* Status Tabs with Framer Motion layoutId */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
          <div className="relative flex items-center p-1 bg-slate-100/80 rounded-xl">
            {(
              [
                { id: 'all', label: 'All Active', count: players.length },
                {
                  id: 'in_match',
                  label: 'In Match',
                  count: players.filter((p) => p.status === 'in_match').length,
                },
                {
                  id: 'lobby',
                  label: 'Lobby / Online',
                  count: players.filter((p) => p.status === 'active' || p.status === 'idle').length,
                },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors z-10 ${
                    isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePlayerTabIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredPlayers.length}</strong> of{' '}
              {players.length} connected
            </span>
            {(searchQuery ||
              gameFilter !== 'all' ||
              statusFilter !== 'all' ||
              deviceFilter !== 'all' ||
              durationFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:underline font-semibold ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 5. Quick Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-0.5">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search active players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Game Arena Filter */}
          <div>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="all">All Games</option>
              <option value="Arena 01">Arena 01</option>
              <option value="Arena 02">Arena 02</option>
              <option value="Arena 03">Arena 03</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="in_match">In Match</option>
              <option value="lobby">Online Lobby</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value as DeviceFilter)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          {/* Session Duration Filter */}
          <div>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="all">Any Duration</option>
              <option value="<10m">&lt; 10 min</option>
              <option value="10-30m">10–30 min</option>
              <option value="30-60m">30–60 min</option>
              <option value="1h+">1h+</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 6. Main Active Players Table (Desktop) & Cards (Mobile) */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
      >
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500" />
            <div>Synchronizing active player telemetry...</div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No active players found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                There are currently no connected players matching your selected filter criteria.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">PLAYER</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">CURRENT ARENA</th>
                    <th className="px-4 py-3">SESSION</th>
                    <th className="px-4 py-3">BALANCE</th>
                    <th className="px-4 py-3">GAME ACTIVITY</th>
                    <th className="px-4 py-3">HEARTBEAT</th>
                    <th className="px-4 py-3">DEVICE</th>
                    <th className="px-4 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredPlayers.map((player) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => handleInspect(player)}
                      >
                        {/* 1. PLAYER */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {player.avatarInitials}
                            </div>
                            <div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/players/${player.id}`);
                                }}
                                className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left flex items-center gap-1"
                              >
                                <span>{player.username}</span>
                              </button>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {player.playerId} • {player.region}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. STATUS */}
                        <td className="px-4 py-3.5">
                          {player.status === 'in_match' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              In Match
                            </span>
                          ) : player.status === 'idle' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Idle
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Online Lobby
                            </span>
                          )}
                        </td>

                        {/* 3. CURRENT ARENA */}
                        <td className="px-4 py-3.5">
                          {player.currentGameName ? (
                            <div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/games/${player.currentGameId || 'all'}`);
                                }}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left flex items-center gap-1"
                              >
                                <span>{player.currentGameName}</span>
                              </button>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {player.currentArenaCategory || 'Tournament'}
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs flex items-center gap-1">
                              <span>—</span>
                              <span className="text-slate-500 font-medium">Lobby</span>
                            </div>
                          )}
                        </td>

                        {/* 4. SESSION */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800">
                            {player.sessionDurationText}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {player.sessionStartTimeText}
                          </div>
                        </td>

                        {/* 5. BALANCE */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 tabular-nums">
                            {formatINR(player.balance)}
                          </div>
                        </td>

                        {/* 6. GAME ACTIVITY */}
                        <td className="px-4 py-3.5">
                          {player.currentRound && player.totalRounds ? (
                            <div className="space-y-1 max-w-[130px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700">
                                  Round {player.currentRound} / {player.totalRounds}
                                </span>
                              </div>
                              {/* Compact Progress Bar */}
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full"
                                  style={{
                                    width: `${(player.currentRound / player.totalRounds) * 100}%`,
                                  }}
                                />
                              </div>
                              {player.score !== undefined && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Score {player.score.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Not playing</span>
                          )}
                        </td>

                        {/* 7. HEARTBEAT */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                player.heartbeatState === 'healthy'
                                  ? 'bg-emerald-500'
                                  : player.heartbeatState === 'delayed'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span className="font-semibold text-slate-700">
                              {player.heartbeatText}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-3.5">
                            {player.heartbeatContext}
                          </div>
                        </td>

                        {/* 8. DEVICE */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium capitalize">
                            {renderDeviceIcon(player.device)}
                            <span>{player.device}</span>
                          </div>
                        </td>

                        {/* 9. ACTIONS */}
                        <td className="px-4 py-3.5 text-right relative">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => handleInspect(player, e)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-transform active:scale-95 flex items-center gap-1"
                              title="Inspect player live telemetry"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>

                            {/* Dropdown Menu Trigger */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuPlayerId(
                                    activeMenuPlayerId === player.id ? null : player.id
                                  );
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Action Dropdown Menu */}
                              <AnimatePresence>
                                {activeMenuPlayerId === player.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1 text-left space-y-0.5 text-xs"
                                  >
                                    <button
                                      onClick={() => handleInspect(player)}
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 flex items-center gap-2"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Inspect Player</span>
                                    </button>

                                    <button
                                      onClick={() => navigate(`/admin/players/${player.id}`)}
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                      <span>View Profile</span>
                                    </button>

                                    {player.currentGameId && (
                                      <button
                                        onClick={() =>
                                          navigate(`/admin/games/${player.currentGameId}`)
                                        }
                                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg font-semibold text-blue-600 flex items-center gap-2"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                        <span>
                                          {player.status === 'in_match' ? 'View Match' : 'View Game'}
                                        </span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() =>
                                        navigate(`/admin/players/${player.id}?tab=activity`)
                                      }
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-slate-700"
                                    >
                                      View Activity
                                    </button>

                                    <button
                                      onClick={() =>
                                        navigate(`/admin/players/${player.id}?tab=transactions`)
                                      }
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-slate-700"
                                    >
                                      View Transactions
                                    </button>

                                    <div className="border-t border-slate-100 my-1" />

                                    <button
                                      onClick={() => handleOpenEndSessionConfirm(player)}
                                      className="w-full text-left px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-2"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                      <span>End Session</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="lg:hidden p-3 divide-y divide-slate-100 space-y-3">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handleInspect(player)}
                  className="pt-3 first:pt-0 space-y-2.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {player.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {player.username}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {player.playerId} • {player.region}
                        </div>
                      </div>
                    </div>
                    {player.status === 'in_match' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        In Match
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Online Lobby
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Current Arena:
                      </span>
                      <div className="font-bold text-slate-800">
                        {player.currentGameName || 'Lobby'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Balance:
                      </span>
                      <div className="font-bold text-slate-900">
                        {formatINR(player.balance)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Session:
                      </span>
                      <div className="font-medium text-slate-700">
                        {player.sessionDurationText}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Heartbeat:
                      </span>
                      <div className="font-medium text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{player.heartbeatText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 capitalize">
                      {renderDeviceIcon(player.device)}
                      <span>{player.device}</span>
                    </div>

                    <button
                      onClick={(e) => handleInspect(player, e)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold text-xs shadow-2xs"
                    >
                      Inspect Player
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* 7. Player Inspection Drawer */}
      <ActivePlayerDrawer
        player={inspectingPlayer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setInspectingPlayer(null);
        }}
        onEndSession={(player) => {
          setPlayerToEndSession(player);
        }}
      />

      {/* 8. End Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(playerToEndSession)}
        title="End Player Session?"
        description={`${playerToEndSession?.username || 'Player'} is currently connected to ${
          playerToEndSession?.currentGameName || 'the lobby'
        }. Ending the session will immediately disconnect the player.`}
        isDestructive={true}
        confirmLabel="End Session"
        isLoading={endSessionMutation.isPending}
        onConfirm={handleConfirmEndSession}
        onCancel={() => setPlayerToEndSession(null)}
      />
    </motion.div>
  );
};

export default ActivePlayersPage;
