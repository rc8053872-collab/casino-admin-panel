import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, AlertCircle } from 'lucide-react';
import type { Withdrawal } from '../../types/withdrawal';
import { formatINR } from '../../utils/currency';

interface WithdrawalRejectModalProps {
  withdrawal: Withdrawal | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const REJECTION_OPTIONS = [
  'Insufficient turnover requirement',
  'KYC verification issue',
  'Risk / velocity investigation flag',
  'Invalid payment / bank details',
  'Duplicate payout request',
  'Other',
];

export const WithdrawalRejectModal: React.FC<WithdrawalRejectModalProps> = ({
  withdrawal,
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState(REJECTION_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !withdrawal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? customReason.trim() || 'Administrative rejection' : selectedReason;
    onConfirm(finalReason);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 z-10 space-y-4 text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Reject Withdrawal Request</h3>
                <span className="text-[11px] text-slate-400 font-mono">{withdrawal.payoutId}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Player:</span>
                <span className="font-semibold text-slate-800">{withdrawal.playerName} ({withdrawal.playerId})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Requested Amount:</span>
                <span className="font-bold text-slate-900 font-mono">{formatINR(withdrawal.amount)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">
                Select Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {REJECTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {selectedReason === 'Other' && (
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold text-xs">
                  Provide Detailed Explanation <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Detail the audit findings or compliance deficiency that caused this rejection..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Rejecting this payout will automatically revert {formatINR(withdrawal.amount)} to the player&apos;s available wallet balance and notify the user.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Reject & Revert Funds'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalRejectModal;
