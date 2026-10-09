import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sliders, Shield } from 'lucide-react';
import type { PaymentMethodItem, SettlementCycle, GatewayStatus } from '../../types/paymentGateway';
import { useToast } from '../../hooks/useToast';

interface ConfigureMethodModalProps {
  method: PaymentMethodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PaymentMethodItem) => void;
}

export const ConfigureMethodModal: React.FC<ConfigureMethodModalProps> = ({
  method,
  isOpen,
  onClose,
  onSave,
}) => {
  const toast = useToast();

  const [status, setStatus] = useState<GatewayStatus>(method?.status ?? 'active');
  const [settlementCycle, setSettlementCycle] = useState<SettlementCycle>(method?.settlementCycle ?? 't1');
  const [feePercentage, setFeePercentage] = useState<number>(method?.feePercentage ?? 0.5);
  const [minAmount, setMinAmount] = useState<number>(method?.minAmount ?? 100);
  const [maxAmount, setMaxAmount] = useState<number>(method?.maxAmount ?? 100000);
  const [description, setDescription] = useState<string>(method?.description ?? '');

  // Sync state when method changes
  useEffect(() => {
    if (method) {
      setStatus(method.status);
      setSettlementCycle(method.settlementCycle);
      setFeePercentage(method.feePercentage);
      setMinAmount(method.minAmount);
      setMaxAmount(method.maxAmount);
      setDescription(method.description);
    }
  }, [method]);

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

  if (!isOpen || !method) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PaymentMethodItem = {
      ...method,
      status,
      settlementCycle,
      settlementSpeed:
        settlementCycle === 'instant'
          ? 'Instant (Real-Time)'
          : settlementCycle === 't1'
          ? 'T+1 Working Day'
          : 'T+2 Days (Standard)',
      feePercentage,
      minAmount,
      maxAmount,
      description,
    };
    onSave(updated);
    toast.success('Configuration Saved', `${method.name} settings updated successfully.`);
    onClose();
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
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
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Configure {method.name} Gateway
                </h3>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                  SANDBOX / DEMO MODE
                </span>
              </div>
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
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            {/* Status Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Gateway Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'configured', 'disabled'] as GatewayStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all cursor-pointer ${
                      status === st
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Settlement Cycle */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Settlement Cycle</label>
              <select
                value={settlementCycle}
                onChange={(e) => setSettlementCycle(e.target.value as SettlementCycle)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600"
              >
                <option value="instant">Instant (Real-Time Settlement)</option>
                <option value="t1">T+1 Working Day (Standard Batch)</option>
                <option value="t2">T+2 Days (Card Networks)</option>
                <option value="batch_daily">Daily Midnight Batch</option>
              </select>
            </div>

            {/* Min / Max Transaction Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Deposit (₹)</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  min={10}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Deposit (₹)</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  min={100}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Merchant Fee % */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Merchant Gateway Fee (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={feePercentage}
                onChange={(e) => setFeePercentage(Number(e.target.value))}
                min={0}
                max={10}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                0% for domestic UPI in compliance with RBI / NPCI guidelines.
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Notes / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600 resize-none"
              />
            </div>

            {/* Sandbox Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-[11px] text-slate-600">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Real provider credentials and webhook keys will be securely injected from production vault secrets once backend integration is live.
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
                <Check className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfigureMethodModal;
