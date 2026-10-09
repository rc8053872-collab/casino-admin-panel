import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Withdrawal } from '../../types/withdrawal';
import { formatINR } from '../../utils/currency';

interface WithdrawalBulkApproveModalProps {
  selectedWithdrawals: Withdrawal[];
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (eligibleIds: string[]) => void;
  onClose: () => void;
}

export const WithdrawalBulkApproveModal: React.FC<WithdrawalBulkApproveModalProps> = ({
  selectedWithdrawals,
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  // Split eligible vs ineligible
  const eligible = selectedWithdrawals.filter(
    (w) =>
      w.status === 'pending' &&
      (w.riskTier === 'low' || w.riskTier === 'medium') &&
      w.turnover.percentage >= 100
  );

  const ineligible = selectedWithdrawals.filter(
    (w) =>
      w.status !== 'pending' ||
      w.riskTier === 'high' ||
      w.riskTier === 'critical' ||
      w.turnover.percentage < 100
  );

  const totalEligibleAmount = eligible.reduce((sum, w) => sum + w.amount, 0);

  const handleApprove = () => {
    onConfirm(eligible.map((w) => w.id));
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
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Approve {eligible.length} Withdrawal{eligible.length === 1 ? '' : 's'}?
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedWithdrawals.length} selected in queue
                </span>
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

          {/* Breakdown summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Total Payout Volume:</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatINR(totalEligibleAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Eligible Requests (Low/Medium Risk):</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {eligible.length} Requests
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Requires Manual Review:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {ineligible.length} Requests
              </span>
            </div>
          </div>

          {ineligible.length > 0 && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Ineligible items will remain untouched:</div>
                <div className="text-[10px] text-amber-700 mt-0.5">
                  High-risk items, compliance reviews, and unmet turnover cannot be batch approved.
                </div>
              </div>
            </div>
          )}

          {eligible.length === 0 ? (
            <div className="p-3 text-center text-slate-500 text-xs">
              None of the selected requests are currently eligible for bulk approval.
            </div>
          ) : null}

          {/* Action Buttons */}
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
              type="button"
              disabled={isLoading || eligible.length === 0}
              onClick={handleApprove}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : `Approve ${eligible.length} Requests`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalBulkApproveModal;
