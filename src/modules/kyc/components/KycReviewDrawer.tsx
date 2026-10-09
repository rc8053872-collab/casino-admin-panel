import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  CreditCard,
  UserCheck,
  Phone,
  Mail,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { KycPlayer, KycModalType } from '../types/kyc.types';
import { KycStatusBadge } from './KycStatusBadge';
import { KycRiskBadge } from './KycRiskBadge';
import { KycTimeline } from './KycTimeline';

interface KycReviewDrawerProps {
  isOpen: boolean;
  player: KycPlayer | null;
  onClose: () => void;
  onOpenActionModal: (type: KycModalType) => void;
}

export const KycReviewDrawer: React.FC<KycReviewDrawerProps> = ({
  isOpen,
  player,
  onClose,
  onOpenActionModal,
}) => {
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

  if (!isOpen || !player) return null;

  const checksList: Array<{ label: 'Identity' | 'Age' | 'PAN' | 'Address' | 'Bank'; key: keyof typeof player.checks }> = [
    { label: 'Identity', key: 'Identity' },
    { label: 'Age', key: 'Age' },
    { label: 'PAN', key: 'PAN' },
    { label: 'Address', key: 'Address' },
    { label: 'Bank', key: 'Bank' },
  ];

  const riskScore = player.riskScore ?? player.riskDetails.score ?? 15;
  const riskBarColor =
    riskScore > 65
      ? 'bg-rose-500'
      : riskScore > 35
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        />

        {/* Sliding Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* 1. Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    PLAYER KYC REVIEW
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {player.id}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {player.name}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <KycStatusBadge status={player.kycStatus} size="md" />
                <div className="flex items-center gap-1.5">
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                    aria-label="Close drawer (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {/* Player Profile Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                    {player.avatar || player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-0.5">
                      <span>ID: {player.id}</span>
                      <span>•</span>
                      <span>Joined: {player.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-[11px] text-slate-600 space-y-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{player.phoneMasked}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{player.emailMasked}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Wallet className="w-3 h-3 text-emerald-600" />
                    <span>₹{player.walletBalance.toLocaleString('en-IN')} Balance</span>
                  </div>
                </div>
              </div>

              {/* Identity Verification Section */}
              <div className="border border-slate-200/90 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Identity Verification
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {player.verificationType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      {player.panMasked}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                    <span className="font-semibold text-emerald-700 mt-0.5 block">
                      {player.checks.PAN === 'VERIFIED' ? 'Verified' : 'Pending Review'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Name Match</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {player.nameMatchScore}% Match
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">DOB Match</span>
                    <span className={`font-bold mt-0.5 block ${player.dobMatch === 'Matched' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {player.dobMatch}
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Status Checklist Section */}
              <div className="border border-slate-200/90 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      KYC STATUS CHECKS
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Overall:</span>
                    <KycStatusBadge status={player.kycStatus} size="sm" />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {checksList.map(({ label, key }) => {
                    const checkState = player.checks[key];
                    const isVerified = checkState === 'VERIFIED';
                    const isPending = checkState === 'PENDING';

                    return (
                      <div key={label} className="py-2.5 flex items-center justify-between">
                        <span className="font-medium text-slate-700">{label}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isPending ? (
                            <Clock className="w-3 h-3 text-amber-600" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{checkState === 'VERIFIED' ? 'Verified' : checkState === 'PENDING' ? 'Pending' : checkState}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Risk Assessment Section */}
              <div className="border border-slate-200/90 rounded-xl p-4 space-y-4 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      RISK & FRAUD SCREENING
                    </span>
                  </div>
                  <KycRiskBadge level={player.riskLevel} score={riskScore} size="sm" showScore />
                </div>

                {/* Visual Risk Score Progress Indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">
                      Risk Score: <span className="font-mono font-bold">{riskScore} / 100</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {riskScore < 30 ? 'Low Risk' : riskScore < 70 ? 'Moderate Vigilance' : 'Elevated Risk Alert'}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(riskScore, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${riskBarColor}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-500">Duplicate Account:</span>
                    <span className={`font-bold ${player.riskDetails.duplicateAccount ? 'text-rose-600' : 'text-slate-800'}`}>
                      {player.riskDetails.duplicateAccount ? 'Yes (Detected)' : 'No'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-500">Suspicious Activity:</span>
                    <span className={`font-bold ${player.riskDetails.suspiciousActivity ? 'text-rose-600' : 'text-slate-800'}`}>
                      {player.riskDetails.suspiciousActivity ? 'Yes (Flagged)' : 'No'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-500">Multiple Devices:</span>
                    <span className={`font-bold ${player.riskDetails.multipleDevices ? 'text-rose-600' : 'text-slate-800'}`}>
                      {player.riskDetails.multipleDevices ? 'Yes (Cluster)' : 'No'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-500">Withdrawal Risk:</span>
                    <span className={`font-bold ${player.riskDetails.withdrawalRisk === 'Low' ? 'text-emerald-700' : player.riskDetails.withdrawalRisk === 'Medium' ? 'text-amber-700' : 'text-rose-700'}`}>
                      {player.riskDetails.withdrawalRisk}
                    </span>
                  </div>
                </div>

                {player.riskDetails.flags && player.riskDetails.flags.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                    <span className="font-bold block">Active Risk Flags:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[10.5px]">
                      {player.riskDetails.flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Verification History Section */}
              <div className="border border-slate-200/90 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900 text-xs">
                      Verification History
                    </span>
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-400">
                    {player.history.length} Events
                  </span>
                </div>

                <KycTimeline events={player.history} />
              </div>
            </div>

            {/* 3. Sticky Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                Operator Action Required
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenActionModal('reject')}
                  className="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Reject KYC
                </button>

                <button
                  type="button"
                  onClick={() => onOpenActionModal('request_info')}
                  className="px-3.5 py-2 border border-purple-200 hover:bg-purple-50 text-purple-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Request More Info
                </button>

                <button
                  type="button"
                  onClick={() => onOpenActionModal('approve')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve KYC</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default KycReviewDrawer;
