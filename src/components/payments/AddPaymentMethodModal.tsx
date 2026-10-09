import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Shield } from 'lucide-react';
import type { PaymentMethodItem, PaymentMethodCategory, SettlementCycle } from '../../types/paymentGateway';
import { useToast } from '../../hooks/useToast';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<PaymentMethodItem, 'id' | 'lastSyncAt'>) => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const toast = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PaymentMethodCategory>('other');
  const [subMethods, setSubMethods] = useState('');
  const [providerName, setProviderName] = useState('Sandbox Aggregator');
  const [settlementCycle, setSettlementCycle] = useState<SettlementCycle>('t1');
  const [feePercentage, setFeePercentage] = useState(0.5);
  const [minAmount, setMinAmount] = useState(100);
  const [maxAmount, setMaxAmount] = useState(100000);
  const [description, setDescription] = useState('');

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      category,
      name: name.trim().toUpperCase(),
      status: 'configured',
      subMethods: subMethods
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      successRate: 98.0,
      todayVolume: 0,
      todayTxnCount: 0,
      settlementSpeed:
        settlementCycle === 'instant'
          ? 'Instant (Real-Time)'
          : settlementCycle === 't1'
          ? 'T+1 Working Day'
          : 'T+2 Days (Standard)',
      settlementCycle,
      isSandbox: true,
      providerName: providerName.trim() || 'Sandbox Node',
      feePercentage,
      minAmount,
      maxAmount,
      description: description.trim() || 'Custom configured payment rail.',
    });

    toast.success('Payment Method Added', `${name} registered in sandbox catalog.`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Payment Method</h3>
                <p className="text-[11px] text-slate-500">
                  Register a new collection rail or gateway channel.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Method Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CRYPTO USDT / AMAZON PAY"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600 uppercase font-mono"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PaymentMethodCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600"
                >
                  <option value="upi">UPI Rail</option>
                  <option value="bank_transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="card">Card Scheme</option>
                  <option value="other">Other / Wallets</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Cycle</label>
                <select
                  value={settlementCycle}
                  onChange={(e) => setSettlementCycle(e.target.value as SettlementCycle)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600"
                >
                  <option value="instant">Instant</option>
                  <option value="t1">T+1 Working Day</option>
                  <option value="t2">T+2 Days</option>
                </select>
              </div>
            </div>

            {/* Sub-Methods comma separated */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sub-Methods (comma separated)
              </label>
              <input
                type="text"
                value={subMethods}
                onChange={(e) => setSubMethods(e.target.value)}
                placeholder="e.g. UPI Dynamic QR, Intent URL, Direct Push"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Deposit (₹)</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Deposit (₹)</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Provider Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gateway Provider</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Sandbox Provider"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
              />
            </div>

            {/* Fee Percentage */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Percentage (%)</label>
              <input
                type="number"
                step="0.05"
                value={feePercentage}
                onChange={(e) => setFeePercentage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Method description..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            {/* Sandbox Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-800">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                New payment methods operate in <strong>SANDBOX / DEMO</strong> mode until verified by backend provider credentials.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Method</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPaymentMethodModal;
