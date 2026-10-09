import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Lock, UserCheck, X } from 'lucide-react';
import type { Player } from '../../types/player';
import { formatINR } from '../../utils/currency';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

interface UnblockConfirmModalProps {
  isOpen: boolean;
  player: Player | null;
  selectedPlayers?: Player[];
  isBulk?: boolean;
  isLoading?: boolean;
  onConfirm: (resolutionNote: string) => void;
  onClose: () => void;
}

export const UnblockConfirmModal: React.FC<UnblockConfirmModalProps> = ({
  isOpen,
  player,
  selectedPlayers = [],
  isBulk = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [resolutionNote, setResolutionNote] = useState('Manual verification completed by Compliance Officer');

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

  if (!isOpen) return null;

  const totalFrozen = isBulk
    ? selectedPlayers.reduce((acc, p) => acc + (p.balance || 0), 0)
    : player?.balance || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(resolutionNote);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs"
        />

        {/* Modal Dialog */}
        <motion.div
          variants={modalDialogVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 z-10 space-y-4.5 text-xs text-slate-700"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/80">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isBulk ? `Batch Unblock (${selectedPlayers.length} Accounts)` : `Restore Access for @${player?.username}`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isBulk
                    ? 'Reactivate selected players and release escrow wallet holds.'
                    : `Player ID: ${player?.playerId} • Cluster: ${player?.cluster}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
              title="Close modal (Esc)"
            >
              <kbd className="text-[10px] font-mono bg-white px-1 py-0.2 rounded border border-slate-300 shadow-2xs">ESC</kbd>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Account Summary Warning Box */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 space-y-2 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Compliance Action Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Unblocking will immediately lift login barriers, reset account status to{' '}
              <strong className="underline">Active</strong>, and restore full wallet access.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-amber-200/70 text-[11px] font-semibold">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Wallet Escrow To Release:</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {formatINR(totalFrozen)}
              </span>
            </div>
          </div>

          {/* Individual Violations preview if single */}
          {!isBulk && player && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px]">
              <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Isolated Under Violation:
              </div>
              <div className="font-bold text-rose-700">
                {player.riskFlags?.[0] || player.lastActiveDetail || 'Security Policy Violation'}
              </div>
              <div className="text-slate-500 text-[10px]">
                KYC Status: <span className="font-semibold text-slate-700">{player.kycDocumentType || 'Unverified'}</span> • Risk Score:{' '}
                <span className="font-bold text-rose-600">{player.riskScore}/100</span>
              </div>
            </div>
          )}

          {/* Audit Resolution Note Field */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Audit Resolution Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                required
                rows={2}
                placeholder="Provide compliance rationale for unblocking..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !resolutionNote.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Confirm & Restore Access</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnblockConfirmModal;
