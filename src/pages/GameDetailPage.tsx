import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import {
  useGame,
  useGamePlayers,
  useGameHistory,
  useGameActivity,
  useEnableGame,
  useDisableGame,
  useStartGame,
  useStopGame,
  useResetGame,
  useDeleteGame,
} from '../hooks/useGamesQuery';
import ConfirmationModal from '../components/games/ConfirmationModal';
import type { LivePlayer } from '../types/game';

type TabType = 'overview' | 'configuration' | 'players' | 'history' | 'activity';

export const GameDetailPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'overview';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const navigate = useNavigate();
  const toast = useToast();

  const { data: game, isLoading, isError } = useGame(gameId);
  const { data: players = [] } = useGamePlayers(gameId);
  const { data: history = [] } = useGameHistory(gameId);
  const { data: activities = [] } = useGameActivity(gameId);

  const enableMutation = useEnableGame();
  const disableMutation = useDisableGame();
  const startMutation = useStartGame();
  const stopMutation = useStopGame();
  const resetMutation = useResetGame();
  const deleteMutation = useDeleteGame();

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const [playerToRemove, setPlayerToRemove] = useState<LivePlayer | null>(null);

  // Sync tab with URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-xs">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Loading game console...
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="text-sm font-bold text-slate-900">Game Not Found</div>
        <p className="text-xs text-slate-500">Record for ID {gameId} cannot be found.</p>
        <button
          onClick={() => navigate('/admin/games')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to All Games
        </button>
      </div>
    );
  }

  // Action handlers
  const handleStartGame = () => {
    setConfirmModal({
      isOpen: true,
      title: `Start Game: ${game.name}?`,
      description: 'This will initiate the game server instance and start matching active queue players.',
      isDestructive: false,
      onConfirm: () => {
        startMutation.mutate(game.id, {
          onSuccess: () => {
            toast.success('Game Started', `${game.name} is now live.`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      },
    });
  };

  const handleStopGame = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Stop Game Session?',
      description: `Are you sure you want to stop ${game.name}? This will immediately end the current session, cancel in-flight turns, and refund active stakes.`,
      isDestructive: true,
      onConfirm: () => {
        stopMutation.mutate(game.id, {
          onSuccess: () => {
            toast.error('Game Stopped', `${game.name} session halted.`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      },
    });
  };

  const handleResetGame = () => {
    setConfirmModal({
      isOpen: true,
      title: `Reset ${game.name}?`,
      description: 'Clears active player seats, turns, and round history for this table.',
      isDestructive: false,
      onConfirm: () => {
        resetMutation.mutate(game.id, {
          onSuccess: () => {
            toast.info('Game Reset', `${game.name} state reset to standby.`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      },
    });
  };

  const handleDeleteGame = () => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${game.name}?`,
      description: `Are you sure you want to delete ${game.name} (${game.id})? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: () => {
        deleteMutation.mutate(game.id, {
          onSuccess: () => {
            toast.success('Game Deleted', `${game.name} removed from catalog.`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            navigate('/admin/games');
          },
        });
      },
    });
  };

  const handleToggleEnable = () => {
    if (game.status === 'disabled') {
      enableMutation.mutate(game.id, {
        onSuccess: () => toast.success('Game Enabled', `${game.name} is now accepting players.`),
      });
    } else {
      disableMutation.mutate(game.id, {
        onSuccess: () => toast.info('Game Disabled', `${game.name} paused.`),
      });
    }
  };

  const handleConfirmRemovePlayer = () => {
    if (!playerToRemove) return;
    toast.error('Player Removed', `${playerToRemove.name} (${playerToRemove.playerId}) removed from table.`);
    setPlayerToRemove(null);
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div>
        <button
          onClick={() => navigate('/admin/games')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          ← Back to All Games
        </button>

        {/* Header Console */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-xs shrink-0"
              style={{ backgroundColor: game.accentColor || '#3B82F6' }}
            >
              {game.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{game.name}</h1>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-600">
                  {game.id}
                </span>
                {game.status === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                ) : game.status === 'enabled' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    ENABLED
                  </span>
                ) : game.status === 'scheduled' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    SCHEDULED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    DISABLED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {game.subtitle || game.description || 'Interactive multiplayer arena table'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/admin/games/${game.id}/edit`)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Edit Game
            </button>

            {game.status === 'live' ? (
              <button
                onClick={handleStopGame}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Stop Game
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Start Game
              </button>
            )}

            <button
              onClick={handleToggleEnable}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                game.status === 'disabled'
                  ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {game.status === 'disabled' ? 'Enable' : 'Disable'}
            </button>

            <button
              onClick={handleResetGame}
              className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
            >
              Reset
            </button>

            <button
              onClick={handleDeleteGame}
              className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation with Framer Motion */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
        {(['overview', 'configuration', 'players', 'history', 'activity'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<TabType, string> = {
            overview: 'Overview',
            configuration: 'Configuration',
            players: `Live Players (${players.length || game.currentPlayers})`,
            history: `Game History (${history.length})`,
            activity: 'Activity Stream',
          };

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`relative pb-3 px-3 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {labels[tab]}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="pt-2">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4.5">
            {/* Top KPI Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
                <div className="text-base font-bold text-slate-900 mt-1 capitalize flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      game.status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                    }`}
                  />
                  {game.status}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Players</div>
                <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  {game.currentPlayers} <span className="text-xs text-slate-400 font-normal">/ {game.maxPlayers}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Round</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  Round {game.currentRound || 1}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</div>
                <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                  {game.duration || '18:42'}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Games Today</div>
                <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  {game.gamesTodayCount || 42}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Games</div>
                <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  {game.totalGamesCount ? game.totalGamesCount.toLocaleString('en-IN') : '1,284'}
                </div>
              </div>
            </div>

            {/* Live Pot & Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Snapshot</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Current Pot:</span>
                    <span className="font-bold text-emerald-600">₹{game.currentPot.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Min / Max Entry:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{game.minEntry} / ₹{game.maxEntry}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Platform Rake:</span>
                    <span className="font-semibold text-blue-600">{game.rakePercent}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Currency:</span>
                    <span className="font-mono font-medium text-slate-800">{game.currency}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry & Performance</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Socket Latency:</span>
                    <span className="font-mono font-bold text-emerald-600">{game.pingMs || 22}ms (BOM-01)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Turn Clock:</span>
                    <span className="font-medium text-slate-800">{game.turnDuration}s shot clock</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Reconnect Window:</span>
                    <span className="font-medium text-slate-800">{game.reconnectionTime}s grace period</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Auto-Start Engine:</span>
                    <span className="font-medium text-blue-600">{game.autoStart ? 'Active' : 'Manual'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rules & Guidelines</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {game.rules || 'Standard tournament rules apply. Verified RNG shuffle algorithm active.'}
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                  Updated: <span className="font-medium text-slate-600">2 minutes ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONFIGURATION TAB */}
        {activeTab === 'configuration' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Group 1: Basic Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Basic Information</h3>
                  <button
                    onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Game Name:</span><span className="font-semibold text-slate-800">{game.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Game ID:</span><span className="font-mono text-slate-800">{game.id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium text-slate-800">{game.category}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Subtitle:</span><span className="font-medium text-slate-800">{game.subtitle || '-'}</span></div>
                </div>
              </div>
            </div>

            {/* Group 2: Player Configuration */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Player Configuration</h3>
                  <button
                    onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Min Players:</span><span className="font-semibold text-slate-800">{game.minPlayers}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Max Players:</span><span className="font-semibold text-slate-800">{game.maxPlayers}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Recommended:</span><span className="font-semibold text-slate-800">{game.recommendedPlayers}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Allow Spectators:</span><span className="font-semibold text-slate-800">{game.allowSpectators ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Auto-Start:</span><span className="font-semibold text-slate-800">{game.autoStart ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
            </div>

            {/* Group 3: Game Rules */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Game Rules & Timers</h3>
                  <button
                    onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Rounds:</span><span className="font-semibold text-slate-800">{game.rounds}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Round Duration:</span><span className="font-semibold text-slate-800">{game.roundDuration}s</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Turn Shot Clock:</span><span className="font-semibold text-slate-800">{game.turnDuration}s</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Reconnect Window:</span><span className="font-semibold text-slate-800">{game.reconnectionTime}s</span></div>
                </div>
              </div>
            </div>

            {/* Group 4: Entry Configuration */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Entry & Financial</h3>
                  <button
                    onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Default Entry:</span><span className="font-bold text-slate-800">₹{game.entryAmount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Min / Max Limits:</span><span className="font-semibold text-slate-800">₹{game.minEntry} - ₹{game.maxEntry}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Rake Fee:</span><span className="font-semibold text-blue-600">{game.rakePercent}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Currency:</span><span className="font-mono text-slate-800">{game.currency}</span></div>
                </div>
              </div>
            </div>

            {/* Group 5: Display Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Display Settings</h3>
                  <button
                    onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Accent Color:</span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: game.accentColor }} />
                      {game.accentColor}
                    </span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">Visibility:</span><span className="font-semibold capitalize text-slate-800">{game.visibility}</span></div>
                </div>
              </div>
            </div>

            {/* Group 6: Advanced Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Advanced Controls</h3>
                  <button
                    onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Logging:</span>
                    <span className="font-semibold text-blue-600">{game.advanced?.enableLogging ? 'ON' : 'OFF'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Replay:</span>
                    <span className="font-semibold text-blue-600">{game.advanced?.allowReplay ? 'ON' : 'OFF'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Manual Start:</span>
                    <span className="font-semibold text-blue-600">{game.advanced?.allowManualStart ? 'ON' : 'OFF'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Maintenance:</span>
                    <span className="font-semibold text-red-600">{game.advanced?.maintenanceMode ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. LIVE PLAYERS TAB */}
        {activeTab === 'players' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Table Seated Players</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time seat telemetry, scores, and connection health.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {players.length} Active Participants
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Player</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Player ID</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Status</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Joined</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Round</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Score / Balance</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Connection</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {players.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-xs text-slate-400 italic">
                        No active players seated at this table currently.
                      </td>
                    </tr>
                  ) : (
                    players.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4.5 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                              {p.avatarInitials}
                            </div>
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4.5 py-3 font-mono text-xs text-slate-500">{p.playerId}</td>
                        <td className="px-4.5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4.5 py-3 text-xs text-slate-500">{p.joinedAt}</td>
                        <td className="px-4.5 py-3 font-medium text-slate-800">Round {p.currentRound}</td>
                        <td className="px-4.5 py-3 font-bold text-slate-900">{p.score}</td>
                        <td className="px-4.5 py-3 text-xs">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {p.connection} ({p.pingMs}ms)
                          </span>
                        </td>
                        <td className="px-4.5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toast.info('Player Details', `Viewing account for ${p.name}`)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => setPlayerToRemove(p)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. GAME HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historical Sessions for {game.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit log of concluded match rounds and winner payouts.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Session</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Players</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Started</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Duration</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Winner</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Total Pot</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-xs text-slate-400 italic">
                        No previous match archives recorded yet for this arena.
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4.5 py-3 font-mono font-semibold text-slate-800 text-xs">{h.sessionId}</td>
                        <td className="px-4.5 py-3 text-slate-800 font-medium">{h.playersCount} seats</td>
                        <td className="px-4.5 py-3 text-xs text-slate-500">{h.startedAt}</td>
                        <td className="px-4.5 py-3 text-xs font-mono text-slate-600">{h.duration}</td>
                        <td className="px-4.5 py-3">
                          <span className="font-semibold text-slate-900">{h.winnerName}</span>
                          <span className="text-xs text-slate-400 font-mono ml-1">({h.winnerPlayerId})</span>
                        </td>
                        <td className="px-4.5 py-3 font-bold text-emerald-600">₹{h.totalPot.toLocaleString('en-IN')}</td>
                        <td className="px-4.5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-time Event Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chronological low-latency state stream for {game.name}.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live WebSocket Active
              </span>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center italic">No events recorded.</div>
              ) : (
                activities.map((act) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <span className="font-mono text-[11px] text-slate-400 mt-0.5 shrink-0">{act.timestamp}</span>
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        act.type === 'payout'
                          ? 'bg-emerald-500'
                          : act.type === 'alert'
                          ? 'bg-amber-500'
                          : act.type === 'stop'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="text-xs text-slate-700 leading-relaxed font-medium">
                      {act.message}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Remove Player Modal */}
      <ConfirmationModal
        isOpen={Boolean(playerToRemove)}
        title={`Remove ${playerToRemove?.name}?`}
        description={`Are you sure you want to remove ${playerToRemove?.name} (${playerToRemove?.playerId}) from this table? Their chips will be refunded to their wallet.`}
        isDestructive={true}
        confirmLabel="Remove Player"
        onConfirm={handleConfirmRemovePlayer}
        onCancel={() => setPlayerToRemove(null)}
      />
    </div>
  );
};

export default GameDetailPage;
