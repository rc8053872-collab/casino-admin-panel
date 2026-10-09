import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Player } from '../../types/player';
import { useApproveKYC, useRejectKYC } from '../../hooks/usePlayersQuery';
import { useToast } from '../../hooks/useToast';

const rejectSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters'),
});

type RejectFormData = z.infer<typeof rejectSchema>;

interface KycReviewDrawerProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
}

export const KycReviewDrawer: React.FC<KycReviewDrawerProps> = ({ isOpen, player, onClose }) => {
  const toast = useToast();
  const approveMutation = useApproveKYC();
  const rejectMutation = useRejectKYC();

  const [showRejectForm, setShowRejectForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  });

  // ESC key listener to close drawer
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

  if (!player) return null;

  const handleApprove = () => {
    approveMutation.mutate(
      { id: player.id },
      {
        onSuccess: () => {
          toast.success('KYC Approved', `${player.username} has been verified.`);
          onClose();
        },
      }
    );
  };

  const handleRejectSubmit = (data: RejectFormData) => {
    rejectMutation.mutate(
      { id: player.id, reason: data.reason },
      {
        onSuccess: () => {
          toast.error('KYC Rejected', `${player.username} verification rejected.`);
          reset();
          setShowRejectForm(false);
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer from right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">KYC Document Review</h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        player.kycStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : player.kycStatus === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {player.kycStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {player.username} ({player.playerId}) • {player.region}
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
                    aria-label="Close drawer (ESC)"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Player Card Snapshot */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Full Name:</span>
                    <span className="font-bold text-slate-800">
                      {player.firstName} {player.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="text-slate-800">{player.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Phone:</span>
                    <span className="text-slate-800 font-mono">{player.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Registered:</span>
                    <span className="text-slate-800">{new Date(player.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Submitted KYC details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Metadata</h3>
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document Type:</span>
                      <span className="font-semibold text-slate-900">{player.kycDocumentType || 'Government ID'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Submission Timestamp:</span>
                      <span className="font-mono text-slate-700">{player.kycSubmittedAt || 'Recent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Audit Status:</span>
                      <span className="font-medium text-slate-800">{player.kycReviewNotes || 'Under operator review'}</span>
                    </div>
                  </div>
                </div>

                {/* Document Mock Viewer */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Document Scans</h3>
                  <div className="h-36 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-2xl mb-1">📄</span>
                    <span className="font-semibold text-slate-700 text-xs">Aadhaar / Passport Scan_Verified.pdf</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">2.4 MB • High-Resolution OCR Captured</span>
                  </div>
                </div>

                {/* Reject Form (Conditional) */}
                {showRejectForm && (
                  <form onSubmit={handleSubmit(handleRejectSubmit)} className="space-y-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                    <h4 className="font-bold text-red-900 text-xs">Provide Rejection Reason <span className="text-red-500">*</span></h4>
                    <textarea
                      rows={3}
                      placeholder="e.g. Blurry photo, mismatch in name spelling, expired document..."
                      {...register('reason')}
                      className="w-full p-2 text-xs bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                    {errors.reason && <p className="text-[11px] text-red-600">{errors.reason.message}</p>}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={rejectMutation.isPending}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {!showRejectForm && (
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Reject KYC
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {approveMutation.isPending ? 'Verifying...' : 'Approve KYC'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KycReviewDrawer;
