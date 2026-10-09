import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import type { KycPlayer, KycModalType } from '../types/kyc.types';

interface KycActionModalProps {
  modalType: KycModalType;
  player: KycPlayer | null;
  onClose: () => void;
  onConfirmApprove: (playerId: string, notes?: string) => Promise<void>;
  onConfirmReject: (playerId: string, reason: string, notes?: string) => Promise<void>;
  onConfirmRequestInfo: (playerId: string, requirements: string[], message: string) => Promise<void>;
  isSubmitting?: boolean;
}

const REJECT_REASONS = [
  'Name mismatch',
  'DOB mismatch',
  'Invalid document',
  'Expired document',
  'Verification failed',
  'Other',
];

const INFO_REQUIREMENTS = [
  'Identity document',
  'Address proof',
  'PAN verification',
  'Bank verification',
];

export const KycActionModal: React.FC<KycActionModalProps> = ({
  modalType,
  player,
  onClose,
  onConfirmApprove,
  onConfirmReject,
  onConfirmRequestInfo,
  isSubmitting = false,
}) => {
  // Approve state
  const [approveNotes, setApproveNotes] = useState('');

  // Reject state
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [rejectNotes, setRejectNotes] = useState('');

  // Request Info state
  const [selectedReqs, setSelectedReqs] = useState<string[]>([INFO_REQUIREMENTS[0]]);
  const [infoMessage, setInfoMessage] = useState('');

  // ESC key listener to close modal
  useEffect(() => {
    if (!modalType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalType, onClose]);

  if (!modalType || !player) return null;

  const handleToggleReq = (item: string) => {
    setSelectedReqs((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmApprove(player.id, approveNotes);
    onClose();
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmReject(player.id, rejectReason, rejectNotes);
    onClose();
  };

  const handleRequestInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReqs.length === 0) return;
    await onConfirmRequestInfo(player.id, selectedReqs, infoMessage);
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200/90 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden z-10"
        >
          {/* ───────────────────────────────────────────────────────────── */}
          {/* FLOW 1: APPROVE KYC                                           */}
          {/* ───────────────────────────────────────────────────────────── */}
          {modalType === 'approve' && (
            <form onSubmit={handleApproveSubmit} className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Approve KYC?
                    </h3>
                    <p className="text-xs text-slate-500">
                      Grant full platform verification credentials.
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
                    title="Close (ESC)"
                    aria-label="Close modal (ESC)"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Player details comparison */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Player:</span>
                  <span className="font-bold text-slate-900">{player.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Player ID:</span>
                  <span className="font-mono font-bold text-slate-900">{player.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10.5px] font-semibold">
                    {player.kycStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">New Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Verification Notes (Optional)
                </label>
                <input
                  type="text"
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="e.g. Identity and PAN confirmed via manual scrutiny"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Verifying...' : 'Confirm Verification'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* FLOW 2: REJECT KYC                                            */}
          {/* ───────────────────────────────────────────────────────────── */}
          {modalType === 'reject' && (
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Reject KYC
                    </h3>
                    <p className="text-xs text-slate-500">
                      Decline document verification for {player.name}.
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
                    title="Close (ESC)"
                    aria-label="Close modal (ESC)"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Rejection Reason *
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-rose-600"
                    required
                  >
                    {REJECT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Provide details on why the document was declined..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-rose-600 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* FLOW 3: REQUEST MORE INFORMATION                              */}
          {/* ───────────────────────────────────────────────────────────── */}
          {modalType === 'request_info' && (
            <form onSubmit={handleRequestInfoSubmit} className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/80">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Request More Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      Notify player {player.name} to upload supplementary proofs.
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
                    title="Close (ESC)"
                    aria-label="Close modal (ESC)"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    Required Supplementary Documents *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INFO_REQUIREMENTS.map((item) => {
                      const isChecked = selectedReqs.includes(item);
                      return (
                        <label
                          key={item}
                          onClick={() => handleToggleReq(item)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-purple-50/60 border-purple-300 text-purple-900 font-medium'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Instructions / Message to Player *
                  </label>
                  <textarea
                    rows={3}
                    value={infoMessage}
                    onChange={(e) => setInfoMessage(e.target.value)}
                    placeholder="e.g. Please provide a clear electricity or water utility bill dated within the last 3 months..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-purple-600 resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedReqs.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default KycActionModal;
