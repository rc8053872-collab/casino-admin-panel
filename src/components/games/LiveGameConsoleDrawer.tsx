import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Users,
  Coins,
  Clock,
  Zap,
  ShieldCheck,
  RotateCcw,
  Square,
  ExternalLink,
  Activity,
  Radio,
  Terminal,
  Edit3,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { formatINR } from '../../utils/currency';
import { drawerVariants, modalBackdropVariants } from '../../animations/variants';

interface LiveGameConsoleDrawerProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onHaltClick: (game: Game) => void;
  onResetClick: (game: Game) => void;
  onEditClick?: (game: Game) => void;
}

export const LiveGameConsoleDrawer: React.FC<LiveGameConsoleDrawerProps> = ({
  game,
  isOpen,
  onClose,
  onHaltClick,
  onResetClick,
  onEditClick,
}) => {
  const navigate = useNavigate();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!game) return null;

  const occupancyRatio =
    game.maxPlayers > 0 ? Math.round((game.currentPlayers / game.maxPlayers) * 100) : 0;

  // Mock seated players based on activeSeats or defaults
  const seatedPlayers = (game.activeSeats || ['AP', 'RS', 'PN', 'VS']).map((initials, idx) => ({
    seat: idx + 1,
    initials,
    name: `Player_${initials}`,
    chips: Math.round((game.currentPot / Math.max(1, game.currentPlayers)) * (0.8 + idx * 0.15)),
    ping: Math.max(12, (game.pingMs || 20) + (idx * 3 - 5)),
    status: 'In Round',
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-slate-900 text-sm">{game.name}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        Live
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {game.id} • {game.category} Arena
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onEditClick && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditClick(game);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      title="Edit arena settings & parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* ESC button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
                    title="Close console (Esc)"
                  >
                    <kbd className="text-[10px] font-mono bg-slate-100 group-hover:bg-slate-200 text-slate-600 border border-slate-200/80 px-1.5 py-0.5 rounded font-bold transition-colors">
                      ESC
                    </kbd>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-600">
                {/* 1. Live Pot & Financial Stakes */}
                <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      <span>Live Pot & Stake Volume</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Rake: {game.rakePercent || '3.5%'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-white border border-emerald-200/80 rounded-xl space-y-0.5 shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Current Pot
                      </span>
                      <div className="text-lg font-bold text-emerald-600 font-mono">
                        {formatINR(game.currentPot > 0 ? game.currentPot : game.totalPot)}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-emerald-200/80 rounded-xl space-y-0.5 shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Entry Stake / Blinds
                      </span>
                      <div className="text-lg font-bold text-slate-800 font-mono">
                        {formatINR(game.entryAmount || game.minEntry)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Round & Telemetry State */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span>Round State & Telemetry</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Round {game.currentRound || 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Round Status:</span>
                      <span className="font-semibold text-slate-800 block truncate">
                        {game.roundStatus || 'Action in Progress'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Elapsed Duration:</span>
                      <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{game.duration || 'Live'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Telemetry Latency:</span>
                      <span className="font-mono font-semibold text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{game.pingMs || 20} ms</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">RNG Status:</span>
                      <span className="font-semibold text-indigo-700 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        <span>Provably Fair OK</span>
                      </span>
                    </div>
                  </div>

                  {game.countdownText && (
                    <div className="p-2 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="text-slate-400">Action Clock:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {game.countdownText}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Seated Players at this Arena */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Users className="w-4 h-4 text-slate-700" />
                      <span>Active Seated Players</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 font-mono">
                      {game.currentPlayers} / {game.maxPlayers} ({occupancyRatio}%)
                    </span>
                  </div>

                  {/* Seat occupancy bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyRatio >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRatio}%` }}
                    />
                  </div>

                  {/* Seated players list */}
                  <div className="space-y-1.5 pt-1">
                    {seatedPlayers.map((player) => (
                      <div
                        key={player.seat}
                        className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-[11px] shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                            {player.initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">Seat {player.seat}</span>
                            <span className="text-slate-400 text-[10px] ml-1">({player.initials})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-700">
                            {formatINR(player.chips)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {player.ping}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Live Socket Event Log */}
                <div className="bg-slate-900 text-slate-300 rounded-2xl p-3.5 space-y-2 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-slate-200">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span>Node Socket Stream</span>
                    </span>
                    <span className="text-emerald-400 font-bold">● Connected</span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div>[00:02.14] TABLE_HEARTBEAT: OK (ping: {game.pingMs || 20}ms)</div>
                    <div>[00:04.89] RNG_SEED: 0x8a91c04f provably committed</div>
                    <div>[00:08.31] STAKES_UPDATED: Pot ₹{game.currentPot?.toLocaleString('en-IN') || '94,500'}</div>
                    <div className="text-slate-200">[00:12.04] ROUND_STATE: {game.roundStatus || 'Next turn active'}</div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/admin/games/${game.id}`);
                  }}
                  className="px-3 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Arena</span>
                </button>

                <div className="flex items-center gap-2">
                  {onEditClick && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditClick(game);
                      }}
                      className="px-3 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Edit arena details & telemetry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onResetClick(game);
                    }}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset arena table"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onHaltClick(game);
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Stop arena and revert stakes"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Halt Arena</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LiveGameConsoleDrawer;
