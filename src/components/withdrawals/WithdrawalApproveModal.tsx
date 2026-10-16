import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldCheck, Copy } from 'lucide-react';
import type { Withdrawal } from '../../types/withdrawal';
import { formatINR } from '../../utils/currency';

interface WithdrawalApproveModalProps {
  withdrawal: Withdrawal | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (amount: number, paymentReference: string) => void;
  onClose: () => void;
}

export const WithdrawalApproveModal: React.FC<WithdrawalApproveModalProps> = ({
  withdrawal,
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  useEffect(() => {
    setPaidAmount(withdrawal ? String(withdrawal.finalAmount || withdrawal.amount) : '');
    setPaymentReference('');
  }, [withdrawal?.id, withdrawal?.amount, withdrawal?.finalAmount, isOpen]);
  if (!isOpen || !withdrawal) return null;

  const destText =
    withdrawal.destination.type === 'bank'
      ? `${withdrawal.destination.bankName || 'Bank'} ${withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount || ''}`
      : withdrawal.destination.upiId || 'UPI';

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
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Mark Withdrawal Paid?</h3>
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

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Player ID / Username:</span>
              <span className="font-bold text-slate-900">
                {withdrawal.playerName}{' '}
                <span className="text-slate-400 font-normal">({withdrawal.playerId})</span>
              </span>
            </div>

            {withdrawal.destination.type === 'bank' && (
              <>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Account Holder Name:</span>
                  <span className="font-bold text-blue-900 text-xs">
                    {withdrawal.destination.accountHolder || withdrawal.playerName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Bank Account Number:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span>{withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount || '—'}</span>
                    {(withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount) && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount || '')}
                        className="text-slate-400 hover:text-blue-600 p-0.5"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">IFSC Code:</span>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
                    <span>{withdrawal.destination.ifsc || '—'}</span>
                    {withdrawal.destination.ifsc && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(withdrawal.destination.ifsc || '')}
                        className="text-slate-400 hover:text-blue-600 p-0.5"
                        title="Copy IFSC Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Branch Name:</span>
                  <span className="font-semibold text-slate-800">{withdrawal.destination.branchName || '—'}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Requested Amount:</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatINR(withdrawal.amount)}
              </span>
            </div>

            {withdrawal.feePercent !== undefined && withdrawal.feePercent > 0 && (
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 text-amber-700">
                <span className="font-medium">Platform Fee Cut ({withdrawal.feePercent}%):</span>
                <span className="font-bold font-mono">
                  - {formatINR(withdrawal.feeAmount || 0)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 bg-emerald-50/70 px-2 rounded-lg">
              <span className="text-emerald-800 font-bold">Transfer to Player:</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">
                {formatINR(withdrawal.finalAmount || withdrawal.amount)}
              </span>
            </div>

            <label className="block space-y-1.5">
              <span className="font-bold text-slate-700">Amount to send player (after admin fee cut)</span>
              <input
                type="number"
                min="1"
                step="any"
                value={paidAmount}
                onChange={event => setPaidAmount(event.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="font-bold text-slate-700">Bank payment reference (UTR / IMPS Ref)</span>
              <input
                type="text"
                maxLength={100}
                value={paymentReference}
                onChange={event => setPaymentReference(event.target.value)}
                placeholder="Enter UTR / transfer reference"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </label>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Method & Destination:</span>
              <span className="font-semibold text-slate-800">
                {withdrawal.method} • {destText}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Risk Assessment:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  withdrawal.riskTier === 'low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : withdrawal.riskTier === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                ● {withdrawal.riskTier.toUpperCase()} ({withdrawal.riskScore}/100)
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Turnover Status:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{withdrawal.turnover.percentage}% Met</span>
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px]">
            Send the exact requested amount to the displayed bank account outside this panel first. This action only records the payout as paid in the app.
          </div>

          {withdrawal.riskTier !== 'low' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Confirm you have transferred the requested amount to the bank account above. Marking it paid notifies the player that the payout is complete.
              </span>
            </div>
          )}

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
              disabled={isLoading || !paidAmount || Number(paidAmount) <= 0}
              onClick={() => onConfirm(Number(paidAmount), paymentReference.trim())}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? 'Saving...' : `Mark paid ${formatINR(Number(paidAmount) || withdrawal.finalAmount || withdrawal.amount)}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalApproveModal;
