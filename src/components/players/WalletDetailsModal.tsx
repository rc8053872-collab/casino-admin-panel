import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '../../types/player';
import { X } from 'lucide-react';
import { useFreezeWallet, useUnfreezeWallet } from '../../hooks/usePlayersQuery';
import { useToast } from '../../hooks/useToast';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

interface WalletDetailsModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
}

export const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({ isOpen, player, onClose }) => {
  const toast = useToast();
  const freezeMutation = useFreezeWallet();
  const unfreezeMutation = useUnfreezeWallet();

  // ESC key listener to close modal
  React.useEffect(() => {
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

  const handleToggleFreeze = () => {
    if (player.walletStatus === 'frozen') {
      unfreezeMutation.mutate(player.id, {
        onSuccess: () => {
          toast.success('Wallet Unfrozen', `Wallet unlocked for ${player.username}.`);
          onClose();
        },
      });
    } else {
      freezeMutation.mutate(player.id, {
        onSuccess: () => {
          toast.error('Wallet Frozen', `Wallet locked for ${player.username}.`);
          onClose();
        },
      });
    }
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
                <h3 className="text-base font-bold text-slate-900">Wallet & Escrow Balance</h3>
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

            {/* Current Balance Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Available Player Balance
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">
                  ₹{player.balance.toLocaleString('en-IN')}
                </div>
                {player.bonusBalance > 0 && (
                  <div className="text-xs text-blue-600 font-medium mt-0.5">
                    + ₹{player.bonusBalance} Promotional Bonus
                  </div>
                )}
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  player.walletStatus === 'frozen'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {player.walletStatus === 'frozen' ? '● Frozen' : '● Operational'}
              </span>
            </div>

            {/* Lifetime Financials */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Lifetime Deposits:</span>
                <span className="font-semibold text-slate-900">₹{player.totalDeposits.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Lifetime Withdrawals:</span>
                <span className="font-semibold text-slate-900">₹{player.totalWithdrawals.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Deposit / Withdrawal Ratio:</span>
                <span className="font-semibold text-blue-600">{player.depositWithdrawalRatioText || 'Healthy'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Escrow Sync Status:</span>
                <span className="text-emerald-600 font-medium">Synchronized with Mumbai Payment Gateway</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleToggleFreeze}
                disabled={freezeMutation.isPending || unfreezeMutation.isPending}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  player.walletStatus === 'frozen'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {player.walletStatus === 'frozen' ? 'Unfreeze Wallet' : 'Freeze Wallet'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletDetailsModal;
