import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Clock,
  Activity,
  Wifi,
  Wallet,
  Gamepad2,
  AlertTriangle,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import type { ActivePlayerTelemetry } from '../../services/activePlayerService';
import { formatINR } from '../../lib/formatters';

interface ActivePlayerDrawerProps {
  player: ActivePlayerTelemetry | null;
  isOpen: boolean;
  onClose: () => void;
  onEndSession: (player: ActivePlayerTelemetry) => void;
}

export const ActivePlayerDrawer: React.FC<ActivePlayerDrawerProps> = ({
  player,
  isOpen,
  onClose,
  onEndSession,
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !player) return null;

  const getDeviceIcon = () => {
    switch (player.device) {
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = () => {
    if (player.status === 'in_match') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          In Match
        </span>
      );
    }
    if (player.status === 'idle') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Online Lobby
      </span>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-[460px] h-full bg-white shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {player.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    {player.username}
                  </h2>
                  {getStatusBadge()}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {player.playerId} • {player.region}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                title="Close (ESC)"
                aria-label="Close drawer (ESC)"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4.5 text-xs text-slate-700">
            {/* 1. Live Connection Visual Telemetry Box */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Connection Telemetry</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">(Telemetry Mock)</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
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
                    {player.heartbeatState === 'healthy' ? 'Connected' : 'Latency Warning'}
                  </span>
                </div>
                <span className="font-mono text-slate-600">Latency {player.latencyMs}ms</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 text-[10px]">
                  {player.connectionQuality}
                </span>
              </div>

              {/* Signal Bar Visual Meter */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      player.latencyMs < 50
                        ? 'bg-emerald-500 w-[92%]'
                        : player.latencyMs < 100
                        ? 'bg-emerald-500 w-[78%]'
                        : 'bg-amber-500 w-[55%]'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Heartbeat: {player.heartbeatText}</span>
                  <span>Context: {player.heartbeatContext}</span>
                </div>
              </div>
            </div>

            {/* 2. Current Session Overview */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-white">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-2">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Current Session</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Duration
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5 text-sm">
                    {player.sessionDurationText}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {player.sessionStartTimeText}
                  </div>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Device & Client
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5 capitalize text-sm">
                    {getDeviceIcon()}
                    <span>{player.device}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    <span>{player.region}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Current Game Arena & Round */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Current Arena</span>
                </div>
                {player.currentGameId && (
                  <button
                    onClick={() => navigate(`/admin/games/${player.currentGameId}`)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Inspect Arena</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {player.currentGameName ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {player.currentGameName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {player.currentArenaCategory || 'Tournament Match'}
                      </div>
                    </div>
                    {player.score !== undefined && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Live Score
                        </div>
                        <div className="font-mono font-bold text-blue-600 text-sm">
                          {player.score.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </div>

                  {player.currentRound && player.totalRounds && (
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-600">
                          Round {player.currentRound} / {player.totalRounds}
                        </span>
                        <span className="text-slate-400">
                          {Math.round((player.currentRound / player.totalRounds) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{
                            width: `${(player.currentRound / player.totalRounds) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-center text-slate-400 text-xs italic bg-slate-50 rounded-lg">
                  Player is currently in the Main Lobby (Not seated at a table).
                </div>
              )}
            </div>

            {/* 4. Wallet & Overall Activity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <Wallet className="w-3 h-3 text-emerald-600" />
                  <span>Wallet Balance</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  {formatINR(player.balance)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Verified Escrow
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span>Activity Record</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {player.gamesPlayed} <span className="text-xs font-normal text-slate-400">Games</span>
                </div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                  {player.winRate}% Win Rate
                </div>
              </div>
            </div>

            {/* 5. Live Session Timeline */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Recent Activity Timeline</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </div>

              <div className="space-y-2.5 relative pl-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {player.recentActivity.map((evt, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative flex items-start gap-2.5 text-[11px]"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white -left-3.5 relative top-1 shrink-0" />
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{evt.time}</span>
                      <span className="text-slate-700 font-medium">{evt.description}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/admin/players/${player.id}`)}
                className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => navigate(`/admin/players/${player.id}?tab=transactions`)}
                className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Transactions</span>
              </button>
            </div>

            <button
              onClick={() => onEndSession(player)}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>End Player Session</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivePlayerDrawer;
