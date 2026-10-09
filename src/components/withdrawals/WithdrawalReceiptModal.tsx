import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, Receipt } from 'lucide-react';
import type { Withdrawal } from '../../types/withdrawal';
import { formatINR } from '../../utils/currency';
import { useToast } from '../../hooks/useToast';

interface WithdrawalReceiptModalProps {
  withdrawal: Withdrawal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalReceiptModal: React.FC<WithdrawalReceiptModalProps> = ({
  withdrawal,
  isOpen,
  onClose,
}) => {
  const toast = useToast();

  if (!isOpen || !withdrawal) return null;

  const handleDownload = () => {
    const content = `
=============================================
           DIGIMATE GAMING PLATFORM
          SETTLED PAYOUT RECEIPT
=============================================
Payout ID:      ${withdrawal.payoutId}
Player:         ${withdrawal.playerName} (${withdrawal.playerId})
Amount:         ${formatINR(withdrawal.amount)}
Currency:       INR
Payment Rail:   ${withdrawal.method}
Destination:    ${withdrawal.destination.type === 'bank' ? `${withdrawal.destination.bankName} (${withdrawal.destination.maskedAccount})` : withdrawal.destination.upiId}
Processed At:   ${withdrawal.processedAt || new Date().toLocaleString('en-IN')}
Status:         Paid / Settled
UTR / Ref:      UTR-BANK-IN-${withdrawal.payoutId}-00918
=============================================
This is an immutable electronic settlement voucher.
`;
    const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Receipt_${withdrawal.payoutId}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Receipt Downloaded', `Settlement receipt for ${withdrawal.payoutId} saved.`);
  };

  const destText =
    withdrawal.destination.type === 'bank'
      ? `${withdrawal.destination.bankName} ${withdrawal.destination.maskedAccount}`
      : withdrawal.destination.upiId;

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
          className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 z-10 space-y-4 text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Payout Receipt</h3>
                <span className="text-[11px] text-slate-400 font-mono">{withdrawal.payoutId}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          {/* Receipt Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 font-mono text-[11px]">
            <div className="text-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Settled Amount</span>
              <span className="text-2xl font-bold text-slate-900">{formatINR(withdrawal.amount)}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Paid / Settled</span>
              </span>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Payout ID:</span>
                <span className="text-slate-900 font-bold">{withdrawal.payoutId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Player:</span>
                <span className="text-slate-900 font-semibold">{withdrawal.playerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Rail:</span>
                <span className="text-slate-800 font-semibold">{withdrawal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-slate-800">{destText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processed At:</span>
                <span className="text-slate-700">06 Oct 2026, 10:47 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banking Node:</span>
                <span className="text-slate-700">BOM-02 (RazorpayX)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Receipt</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalReceiptModal;
