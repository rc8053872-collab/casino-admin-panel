import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Game } from '../../types/game';
import { useToast } from '../../hooks/useToast';
import {
  useEnableGame,
  useDisableGame,
  useStartGame,
  useStopGame,
  useResetGame,
  useDuplicateGame,
} from '../../hooks/useGamesQuery';

interface GameCardProps {
  game: Game;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onRequestDelete?: (game: Game) => void;
  onRequestStop?: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected = false,
  onToggleSelect,
  onRequestDelete,
  onRequestStop,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const enableMutation = useEnableGame();
  const disableMutation = useDisableGame();
  const startMutation = useStartGame();
  const stopMutation = useStopGame();
  const resetMutation = useResetGame();
  const duplicateMutation = useDuplicateGame();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Action handlers
  const handleEnable = () => {
    setMenuOpen(false);
    enableMutation.mutate(game.id, {
      onSuccess: () => toast.success('Game Enabled', `${game.name} is now open for player queues.`),
    });
  };

  const handleDisable = () => {
    setMenuOpen(false);
    disableMutation.mutate(game.id, {
      onSuccess: () => toast.info('Game Disabled', `${game.name} has been paused.`),
    });
  };

  const handleStart = () => {
    setMenuOpen(false);
    startMutation.mutate(game.id, {
      onSuccess: () => toast.success('Game Started', `Live session initiated for ${game.name}.`),
    });
  };

  const handleReset = () => {
    setMenuOpen(false);
    resetMutation.mutate(game.id, {
      onSuccess: () => toast.info('Game Reset', `Table state cleared for ${game.name}.`),
    });
  };

  const handleDuplicate = () => {
    setMenuOpen(false);
    duplicateMutation.mutate(game.id, {
      onSuccess: (newGame) => {
        toast.success('Game Duplicated', `Created ${newGame.name} (${newGame.id})`);
        navigate(`/admin/games/${newGame.id}/edit`);
      },
    });
  };

  // Badge status styling
  const renderStatusBadge = () => {
    if (game.status === 'live') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE {game.currentPot > 0 ? `• ₹${game.currentPot.toLocaleString('en-IN')}` : ''}
        </span>
      );
    }
    if (game.status === 'enabled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          ENABLED
        </span>
      );
    }
    if (game.status === 'disabled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          DISABLED
        </span>
      );
    }
    if (game.status === 'scheduled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          SCHEDULED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        COMPLETED
      </span>
    );
  };

  const occupancyRatio = game.maxPlayers > 0 ? Math.min(100, Math.round((game.currentPlayers / game.maxPlayers) * 100)) : 0;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`bg-white border rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90'
      }`}
    >
      <div>
        {/* Top bar with Selection checkbox, Title, Tags, and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(game.id)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                aria-label={`Select ${game.name}`}
              />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  onClick={() => navigate(`/admin/games/${game.id}`)}
                  className="font-bold text-slate-900 text-sm tracking-tight hover:text-blue-600 cursor-pointer transition-colors"
                >
                  {game.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  {game.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {game.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
                {game.subtitle || game.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {renderStatusBadge()}
          </div>
        </div>

        {/* Seats Occupied & Avatars */}
        <div className="mt-3.5 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {game.category === 'Wheel' || game.category === 'Crash'
                ? `Active Bettors (${game.currentPlayers} Online)`
                : `Seats Occupied (${game.currentPlayers}/${game.maxPlayers}${game.currentPlayers === game.maxPlayers ? ' FULL' : ''})`}
            </span>
            <span className="text-[11px] font-mono font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {game.pingMs || 20}ms
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {game.activeSeats && game.activeSeats.length > 0 ? (
              game.activeSeats.map((seat, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200 shadow-2xs"
                  title={`Seat: ${seat}`}
                >
                  {seat}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No players seated</span>
            )}
            {game.currentPlayers < game.maxPlayers && game.status === 'live' && (
              <div
                className="w-6 h-6 rounded-full bg-slate-200/60 text-slate-400 text-xs font-bold flex items-center justify-center border border-dashed border-slate-300"
                title="Available seat"
              >
                +
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyRatio > 85 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${occupancyRatio}%` }}
            />
          </div>
        </div>

        {/* Stakes & Pot Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="p-2 rounded-lg bg-slate-50/50 border border-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {game.category === 'Crash' ? 'Flight Multiplier' : game.category === 'Wheel' ? 'Total Bets' : 'Blinds / Entry'}
            </div>
            <div className="font-bold text-slate-900 mt-0.5 text-xs">
              {game.category === 'Crash'
                ? '4.82x'
                : game.category === 'Wheel'
                ? `₹${(game.entryAmount * 10).toLocaleString('en-IN')}`
                : `₹${game.minEntry.toLocaleString('en-IN')}${game.maxEntry !== game.minEntry ? ` / ₹${game.maxEntry.toLocaleString('en-IN')}` : ''}`}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50/50 border border-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {game.category === 'Crash' ? 'Total Pool' : 'Current Pot'}
            </div>
            <div className="font-bold text-emerald-600 mt-0.5 text-xs">
              ₹{game.currentPot > 0 ? game.currentPot.toLocaleString('en-IN') : game.totalPot.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Turn info / countdown */}
        <div className="flex items-center justify-between text-xs mt-2.5 px-1 text-slate-500">
          <span className="font-medium text-[11px] text-slate-600 truncate max-w-[60%]">
            {game.roundStatus || `Round ${game.currentRound} of ${game.rounds}`}
          </span>
          <span className="text-[11px] font-mono text-slate-400 truncate">
            {game.countdownText || (game.duration ? `Elapsed: ${game.duration}` : 'Idle')}
          </span>
        </div>
      </div>

      {/* Card Footer: Status Chip, Spectate, Inspect, Action Menu */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          {game.activityLabel || 'Normal Activity'}
        </span>

        <div className="flex items-center gap-1.5 relative" ref={menuRef}>
          {game.status === 'live' && (
            <button
              onClick={() => toast.info('Spectator Mode', `Connecting live feed for ${game.name}...`)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Spectate
            </button>
          )}

          <button
            onClick={() => navigate(`/admin/games/${game.id}`)}
            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Inspect
          </button>

          {/* Context Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Actions menu"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Contextual Action Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-8 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-xs font-medium text-slate-700"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/admin/games/${game.id}`);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  View Game Details
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/admin/games/${game.id}/edit`);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Edit Configuration
                </button>

                <button
                  onClick={handleDuplicate}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Duplicate Game
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Status-dependent actions */}
                {game.status === 'live' ? (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(`/admin/games/${game.id}?tab=players`);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      View Live Players
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        if (onRequestStop) {
                          onRequestStop(game);
                        } else {
                          stopMutation.mutate(game.id, {
                            onSuccess: () => toast.error('Game Stopped', `${game.name} stopped.`),
                          });
                        }
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      Stop Game
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStart}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                    >
                      Start Game
                    </button>
                    {game.status === 'disabled' ? (
                      <button
                        onClick={handleEnable}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        Enable Game
                      </button>
                    ) : (
                      <button
                        onClick={handleDisable}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Disable Game
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Reset Game State
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/admin/games/${game.id}?tab=history`);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  View History
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onRequestDelete) {
                      onRequestDelete(game);
                    }
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                >
                  Delete Game
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
