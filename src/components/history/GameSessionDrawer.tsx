import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Trophy,
  Users,
  Clock,
  Coins,
  Download,
  AlertTriangle,
  Gamepad2,
} from 'lucide-react';
import type { GameSession } from '../../types/gameHistory';
import { formatINR } from '../../utils/currency';
import { gameHistoryService } from '../../services/gameHistoryService';
import { useToast } from '../../hooks/useToast';

interface GameSessionDrawerProps {
  session: GameSession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDisputeReview?: (session: GameSession) => void;
}

export const GameSessionDrawer: React.FC<GameSessionDrawerProps> = ({
  session,
  isOpen,
  onClose,
  onOpenDisputeReview,
}) => {
  const navigate = useNavigate();
  const toast = useToast();

  if (!isOpen || !session) return null;

  const handleExportRounds = async () => {
    const rounds = await gameHistoryService.getGameRounds(session.sessionId);
    gameHistoryService.exportRoundDataToCsv(session.sessionId, rounds);
    toast.success('Rounds Exported', `Downloaded rounds data for ${session.sessionId}.`);
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● Completed
          </span>
        );
      case 'disputed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ● Disputed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ● Cancelled
          </span>
        );
      case 'abandoned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            ● Abandoned
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            ● {session.status}
          </span>
        );
    }
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
          className="relative w-full max-w-[480px] h-full bg-white shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {session.sessionId}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {session.roundId}
                </span>
                {getStatusBadge()}
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                {session.gameName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Table: {session.tableId} • Stakes: {session.stakes}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700">
            {/* Quick Session Financial & Time Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Coins className="w-3 h-3 text-emerald-600" />
                  <span>Total Pot & Payout</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  {formatINR(session.totalPot)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Net Payout: {formatINR(session.totalPayout)} (Rake: {formatINR(session.platformRake)})
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>Duration & Rounds</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                  {session.duration}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {session.rounds} Rounds concluded
                </div>
              </div>
            </div>

            {/* Winner & Hand Showcase */}
            {session.winnerName ? (
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Concluded Winner</span>
                  </div>
                  {session.winnerId && (
                    <button
                      onClick={() => navigate(`/admin/players/${session.winnerId}`)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Player Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{session.winnerName}</span>
                    <span className="text-slate-400 font-mono ml-1.5">
                      {session.winnerPlayerId}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700">
                    {formatINR(session.totalPayout)} Won
                  </span>
                </div>

                {session.winningHandOrOutcome && (
                  <div className="bg-white p-2 rounded-lg border border-emerald-200/80 text-[11px] font-medium text-slate-700">
                    {session.winningHandOrOutcome}
                  </div>
                )}
              </div>
            ) : session.cancellationReason ? (
              <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Session Interrupted / Cancelled</span>
                </div>
                <p className="text-[11px] text-rose-700">{session.cancellationReason}</p>
                {session.refundAmount && (
                  <div className="text-[11px] font-bold text-slate-800 pt-1">
                    Full refunds issued: {formatINR(session.refundAmount)}
                  </div>
                )}
              </div>
            ) : null}

            {/* Cryptographic RNG Proof Box */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Cryptographic Proof</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Verified SHA-256
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Server Seed Hash
                </div>
                <div className="font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 break-all select-all">
                  {session.serverSeedHash}
                </div>
              </div>

              {session.communityCards && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 mr-1">Board:</span>
                  {session.communityCards.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 font-bold rounded border border-slate-200 text-xs text-slate-900"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Seated Players List */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Seated Players ({session.playerCount})</span>
                </div>
                <span className="text-[10px] text-slate-400">Peak {session.peakPlayers}</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {session.playersList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/admin/players/${p.id}`)}
                    className="py-1.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {p.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs hover:text-blue-600">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.playerId} • @{p.username}
                        </div>
                      </div>
                    </div>
                    {session.winnerId === p.id && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Winner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                navigate(`/admin/games/history/${session.sessionId}`);
              }}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Open Full Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/admin/games/history/${session.sessionId}?tab=players`);
                }}
                className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>View Players</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/admin/games/history/${session.sessionId}?tab=rounds`);
                }}
                className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>View Rounds</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportRounds}
                className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Rounds CSV</span>
              </button>

              {session.status === 'disputed' && onOpenDisputeReview ? (
                <button
                  onClick={() => onOpenDisputeReview(session)}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Review Dispute</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/admin/games/${session.gameId}`)}
                  className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Game Arena</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GameSessionDrawer;
