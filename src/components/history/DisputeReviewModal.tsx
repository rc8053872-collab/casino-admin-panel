import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import type { GameSession } from '../../types/gameHistory';
import { formatINR } from '../../utils/currency';
import { useResolveDispute } from '../../hooks/useGameHistoryQuery';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../games/ConfirmationModal';

interface DisputeReviewModalProps {
  session: GameSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DisputeReviewModal: React.FC<DisputeReviewModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const resolveMutation = useResolveDispute();
  const [disputeNotes, setDisputeNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    action: 'reviewed' | 'refunded' | 'confirmed' | 'escalated';
    title: string;
    description: string;
    isDestructive: boolean;
  } | null>(null);

  if (!isOpen || !session) return null;

  const handleExecuteAction = () => {
    if (!confirmAction) return;

    resolveMutation.mutate(
      {
        sessionId: session.sessionId,
        action: confirmAction.action,
        notes: disputeNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            'Dispute Updated',
            `Session ${session.sessionId} marked as ${confirmAction.action}.`
          );
          setConfirmAction(null);
          onClose();
        },
        onError: (err: any) => {
          toast.error('Action Failed', err?.message || 'Failed to update dispute status.');
        },
      }
    );
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 z-10 space-y-4 text-xs text-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Review Player Dispute: {session.roundId}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Session {session.sessionId} • {session.gameName}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dispute Case Summary */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Dispute Grounds & Claim Details</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {session.disputeNotes ||
                  'Player claims network disconnection during turn round execution. Hand was ahead with 82% equity before disconnect timeout trigger.'}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-amber-700 font-medium">
                <span>Disputed Pot: {formatINR(session.totalPot)}</span>
                <span>Affected Players: {session.playerCount}</span>
              </div>
            </div>

            {/* Quick Session Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Pot</span>
                <div className="font-bold text-slate-900 mt-0.5">{formatINR(session.totalPot)}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Claimant</span>
                <div className="font-bold text-slate-900 mt-0.5 truncate">{session.winnerName}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Rake Held</span>
                <div className="font-bold text-slate-900 mt-0.5">{formatINR(session.platformRake)}</div>
              </div>
            </div>

            {/* Investigation Notes input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Investigation Audit Notes (Recorded into permanent ledger)
              </label>
              <textarea
                rows={2}
                placeholder="Document verification findings, telemetry check results, or reconciliation details..."
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons Grid */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      action: 'confirmed',
                      title: 'Confirm Match Result & Award Pot?',
                      description: `Confirm the original showdown results for ${session.roundId} and release ${formatINR(session.totalPayout)} to the winner.`,
                      isDestructive: false,
                    })
                  }
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm Result</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      action: 'refunded',
                      title: 'Refund All Seated Players?',
                      description: `Void session ${session.sessionId} and refund total pot of ${formatINR(session.totalPot)} equally back to the players.`,
                      isDestructive: true,
                    })
                  }
                  className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refund Players</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      action: 'reviewed',
                      title: 'Mark Dispute as Reviewed?',
                      description: `Flag session ${session.sessionId} as reviewed without changing payout allocations.`,
                      isDestructive: false,
                    })
                  }
                  className="py-1.5 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  <span>Mark Reviewed</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      action: 'escalated',
                      title: 'Escalate to Compliance Risk Officer?',
                      description: `Forward round audit logs to Level 3 Compliance Integrity audit queue.`,
                      isDestructive: false,
                    })
                  }
                  className="py-1.5 px-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Escalate to Risk Lead</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || 'Confirm Action'}
        description={confirmAction?.description || ''}
        isDestructive={confirmAction?.isDestructive || false}
        confirmLabel="Confirm Action"
        isLoading={resolveMutation.isPending}
        onConfirm={handleExecuteAction}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
};

export default DisputeReviewModal;
