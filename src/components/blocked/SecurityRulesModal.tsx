import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Cpu } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

interface SecurityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityRulesModal: React.FC<SecurityRulesModalProps> = ({ isOpen, onClose }) => {
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

  const rules = [
    {
      title: 'Sybil Multi-Account Collision',
      code: 'SEC-RULE-01',
      description: 'Detects concurrent sessions originating from identical Canvas/WebGL hardware fingerprints, duplicated UPI IDs, or colliding IP subnets.',
      action: 'Auto-Quarantine & Escrow Freeze',
      active: true,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      title: 'Payment Gateway Velocity Abuse',
      code: 'SEC-RULE-02',
      description: 'Isolates accounts triggering repeated payout cancellations, disputed UPI chargebacks, or mismatched bank account holder names.',
      action: 'Immediate Payout Hold',
      active: true,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'KYC Forgery & OCR Document Audit',
      code: 'SEC-RULE-03',
      description: 'Automated verification check against NSDL & UIDAI databases. Flags low-resolution, doctored PAN cards, and fake driving licenses.',
      action: 'Permanent Barring & Compliance Flag',
      active: true,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: 'Gameplay Collusion & Chip Dumping',
      code: 'SEC-RULE-04',
      description: 'Analyzes table match history for abnormal win-rate anomalies (e.g. 100% win-rate) and intentional fold sequences between clustered players.',
      action: 'Matchmaking Isolation',
      active: true,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
        />

        <motion.div
          variants={modalDialogVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 z-10 space-y-4 text-xs text-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Automated Anti-Fraud Protocols</h3>
                <p className="text-[11px] text-slate-500">Live isolation criteria powering player quarantine.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
              title="Close rules (Esc)"
            >
              <kbd className="text-[10px] font-mono bg-white px-1 py-0.2 rounded border border-slate-300 shadow-2xs">ESC</kbd>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rules list */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.code}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{rule.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{rule.code}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">{rule.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                  <span className="text-slate-400">Trigger Enforcement:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded border ${rule.color}`}>
                    {rule.action}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>All 4 security sentinels operational</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SecurityRulesModal;
