import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Player } from '../../types/player';
import { useFlagPlayer, useMarkRiskReviewed } from '../../hooks/usePlayersQuery';
import { useToast } from '../../hooks/useToast';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

interface RiskDetailsModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({ isOpen, player, onClose }) => {
  const toast = useToast();
  const flagMutation = useFlagPlayer();
  const reviewMutation = useMarkRiskReviewed();

  const [flagReason, setFlagReason] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);

  // ESC key listener to close modal
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

  if (!player) return null;

  const handleMarkReviewed = () => {
    reviewMutation.mutate(player.id, {
      onSuccess: () => {
        toast.success('Risk Status Updated', `${player.username} marked as audited and reviewed.`);
        onClose();
      },
    });
  };

  const handleAddFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    flagMutation.mutate(
      { id: player.id, reason: flagReason.trim() },
      {
        onSuccess: () => {
          toast.info('Player Flagged', `Added security flag for ${player.username}`);
          setFlagReason('');
          setShowFlagInput(false);
        },
      }
    );
  };

  const getMeterColor = (score: number) => {
    if (score > 80) return 'bg-red-600';
    if (score > 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 z-10 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Security & Risk Analysis</h3>
                <p className="text-xs text-slate-500">
                  {player.username} ({player.playerId})
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close (ESC)"
                  aria-label="Close modal (ESC)"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Score & Meter */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Risk Score
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">
                    {player.riskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    player.riskTier === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : player.riskTier === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : player.riskTier === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {player.riskTier} Risk
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getMeterColor(player.riskScore)}`}
                  style={{ width: `${player.riskScore}%` }}
                />
              </div>
            </div>

            {/* Security Flags */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Triggers & Flags</div>
              <div className="flex flex-wrap gap-1.5">
                {player.riskFlags && player.riskFlags.length > 0 ? (
                  player.riskFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
                    >
                      ⚠ {flag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No suspicious flags triggered.</span>
                )}
              </div>
            </div>

            {/* Add Flag form */}
            {showFlagInput ? (
              <form onSubmit={handleAddFlag} className="space-y-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="e.g. Velocity anomaly, Chip dumping suspicion..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFlagInput(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                  >
                    Save Flag
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowFlagInput(true)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                + Add Security Flag
              </button>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleMarkReviewed}
                disabled={reviewMutation.isPending}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                Mark as Reviewed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RiskDetailsModal;
