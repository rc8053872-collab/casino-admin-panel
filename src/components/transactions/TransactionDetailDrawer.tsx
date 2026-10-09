import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ShieldCheck,
  Smartphone,
  Building,
  Wallet,
  Cpu,
} from 'lucide-react';
import type { MasterTransaction } from '../../services/transactionHistoryService';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { useToast } from '../../hooks/useToast';

interface TransactionDetailDrawerProps {
  transaction: MasterTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: 'Completed' | 'Pending' | 'Declined') => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const toast = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!transaction) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to Clipboard', `${fieldName} copied.`);
  };

  const handleDownloadReceipt = () => {
    toast.success('Receipt Generated', `Tax invoice for ${transaction.id} ready.`);
  };

  const handleApprovePending = () => {
    setIsUpdating(true);
    setTimeout(() => {
      onStatusChange?.(transaction.id, 'Completed');
      setIsUpdating(false);
      toast.success('Transaction Settled', `${transaction.id} marked as cleared.`);
    }, 450);
  };

  const getChannelIcon = () => {
    switch (transaction.channelCategory) {
      case 'upi':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'bank':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-amber-600" />;
      case 'internal':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      default:
        return <Smartphone className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900 tracking-tight">
                    {transaction.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(transaction.id, 'Transaction ID')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy Tx ID"
                  >
                    {copiedField === 'Transaction ID' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {transaction.type} • {transaction.timeAgo}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    transaction.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : transaction.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {transaction.status === 'Completed' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  {transaction.status === 'Pending' && (
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  )}
                  {transaction.status === 'Declined' && (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{transaction.status}</span>
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-600">
              {/* Primary Amount Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Gross Transaction Value
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                    <AnimatedNumber value={transaction.amount} format="currency" duration={0.6} />
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Platform Rail Fee: ₹0.00 (Zero Surcharge)</span>
                    <span className="text-emerald-400 font-semibold">100% Net Credited</span>
                  </div>
                </div>
              </div>

              {/* Entity / Player Dossier */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Account Entity Information
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200/80 shadow-2xs">
                      {transaction.playerAvatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{transaction.playerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{transaction.playerId}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(transaction.playerId, 'Player ID')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    {copiedField === 'Player ID' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy ID</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Device Channel</span>
                    <span className="font-medium text-slate-800">{transaction.device || 'Mobile App'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">IP Geolocation</span>
                    <span className="font-medium text-slate-800">{transaction.ipAddress || '103.21.x.x'}</span>
                  </div>
                </div>
              </div>

              {/* Banking & Gateway Rails */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Gateway Rail & UTR
                </span>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Method / Channel</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {getChannelIcon()}
                      <span>{transaction.paymentMode}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Gateway UTR Ref</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                      <span>{transaction.gatewayRef}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(transaction.gatewayRef, 'Gateway UTR')}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                        title="Copy UTR"
                      >
                        {copiedField === 'Gateway UTR' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {transaction.vpaOrAccount && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Destination Rail</span>
                      <span className="font-mono text-slate-700">{transaction.vpaOrAccount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Recorded At</span>
                    <span className="text-slate-700">
                      {new Date(transaction.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit & Settlement Notes */}
              {transaction.auditReason && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Audit System Flag / Reason</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    {transaction.auditReason}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Receipt</span>
              </button>

              {transaction.status === 'Pending' ? (
                <button
                  type="button"
                  onClick={handleApprovePending}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Clearing...' : 'Approve & Clear'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailDrawer;
