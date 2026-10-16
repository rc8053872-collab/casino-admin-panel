import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  History,
  Gamepad2,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileCheck,
  Copy,
} from 'lucide-react';
import type { Withdrawal } from '../../types/withdrawal';
import { formatINR } from '../../utils/currency';
import { useToast } from '../../hooks/useToast';

interface WithdrawalComplianceDrawerProps {
  withdrawal: Withdrawal | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (w: Withdrawal) => void;
  onReject: (w: Withdrawal) => void;
}

export const WithdrawalComplianceDrawer: React.FC<WithdrawalComplianceDrawerProps> = ({
  withdrawal,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const navigate = useNavigate();
  const toast = useToast();

  if (!isOpen || !withdrawal) return null;

  const handleRequestInfo = () => {
    toast.info(
      'Information Request Sent',
      `Sent KYC/turnover clarification request to ${withdrawal.playerName} (${withdrawal.username}).`
    );
  };

  const handleMarkReviewed = () => {
    toast.success(
      'Compliance Audit Stamped',
      `Audit record filed for ${withdrawal.payoutId}. Flag logged as investigated.`
    );
    onClose();
  };

  const destText =
    withdrawal.destination.type === 'bank'
      ? `${withdrawal.destination.bankName} ••••${withdrawal.destination.maskedAccount?.slice(-4)}`
      : withdrawal.destination.upiId;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-[500px] h-full bg-white shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-hidden text-xs"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Compliance & AML Investigation</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {withdrawal.payoutId} • Score {withdrawal.riskScore}/100
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-700">
            {/* 1. Player Profile */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Player Identity
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/admin/players/${withdrawal.playerId}`);
                  }}
                  className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  <span>View Player Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {withdrawal.avatarInitials}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{withdrawal.playerName}</div>
                  <div className="text-[11px] text-slate-400">@{withdrawal.username} • {withdrawal.playerId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">KYC Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified (Aadhaar/PAN)</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Risk Tier:</span>
                  <span
                    className={`font-bold uppercase ${
                      withdrawal.riskTier === 'critical'
                        ? 'text-rose-600'
                        : withdrawal.riskTier === 'high'
                        ? 'text-amber-600'
                        : 'text-slate-700'
                    }`}
                  >
                    ● {withdrawal.riskTier} Tier
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Withdrawal Request Details */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block">
                Payout Payload
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Requested Amount</span>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatINR(withdrawal.amount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Net Pay to Player</span>
                  <div className="text-sm font-extrabold text-emerald-700 font-mono">
                    {formatINR(withdrawal.finalAmount || withdrawal.amount)}
                  </div>
                </div>
                {withdrawal.destination.type === 'bank' ? (
                  <>
                    <div className="col-span-2 py-1 border-t border-slate-200/60">
                      <span className="text-slate-400 text-[10px] uppercase block">Account Holder Name</span>
                      <div className="font-bold text-slate-900 text-xs">
                        {withdrawal.destination.accountHolder || withdrawal.playerName}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Bank Account No</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-xs">
                        <span>{withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount || '—'}</span>
                        {(withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount) && (
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(withdrawal.destination.accountNumber || withdrawal.destination.maskedAccount || '')}
                            className="text-slate-400 hover:text-blue-600 p-0.5"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">IFSC Code</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-800 text-xs">
                        <span>{withdrawal.destination.ifsc || '—'}</span>
                        {withdrawal.destination.ifsc && (
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(withdrawal.destination.ifsc || '')}
                            className="text-slate-400 hover:text-blue-600 p-0.5"
                            title="Copy IFSC Code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Branch Name</span>
                      <div className="font-semibold text-slate-800 text-xs">
                        {withdrawal.destination.branchName || '—'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] uppercase">Destination UPI</span>
                    <div className="font-semibold text-slate-800 font-mono">{destText}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Turnover Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Wagering Turnover Check
                </span>
                <span
                  className={`font-bold text-xs ${
                    withdrawal.turnover.percentage >= 100 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {withdrawal.turnover.percentage}% Met
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    withdrawal.turnover.percentage >= 100
                      ? 'bg-emerald-500'
                      : withdrawal.turnover.percentage > 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, withdrawal.turnover.percentage)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block">Required Wagering:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatINR(withdrawal.turnover.required)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Completed Wagering:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatINR(withdrawal.turnover.completed)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Risk Signals */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Detected AML / Velocity Signals</span>
              </div>

              {withdrawal.riskSignals && withdrawal.riskSignals.length > 0 ? (
                <ul className="space-y-1.5 pl-1">
                  {withdrawal.riskSignals.map((sig, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-rose-900 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-500 text-[11px] italic">
                  No automated velocity or collusion alerts triggered for this session.
                </div>
              )}
            </div>

            {/* 5. Recent Player Transactions */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] uppercase">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Deposit & Payout Ledger</span>
              </div>

              <div className="space-y-1.5">
                {(withdrawal.recentTransactions || [
                  { id: 'TX-DEF1', type: 'deposit', amount: 5000, date: '06 Oct 2026', status: 'Success' },
                ]).map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-500 mr-1.5">
                        {t.type}
                      </span>
                      <span className="text-slate-400 font-mono">{t.date}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        t.type === 'deposit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {t.type === 'deposit' ? '+' : '-'}
                      {formatINR(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Recent Game Activity */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] uppercase">
                <Gamepad2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Arena Sessions</span>
              </div>

              <div className="space-y-1.5">
                {(withdrawal.recentGames || [
                  { id: 'G-DEF1', game: "Texas Hold'em Arena 01", profit: 1200, time: '1h ago' },
                ]).map((g, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{g.game}</span>
                      <div className="text-[10px] text-slate-400">{g.time}</div>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        g.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {g.profit >= 0 ? `+${formatINR(g.profit)}` : `-${formatINR(Math.abs(g.profit))}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2 shrink-0">
            {withdrawal.status === 'pending' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onApprove(withdrawal);
                  }}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Payout</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReject(withdrawal);
                  }}
                  className="w-full py-2 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reject & Revert</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-100 border border-slate-200/80 rounded-xl text-center text-[11px] text-slate-600 font-medium">
                Withdrawal status is <span className="font-bold uppercase text-slate-800">{withdrawal.status}</span>. Payout decisions cannot be altered.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRequestInfo}
                className="w-full py-1.5 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Request Info</span>
              </button>

              <button
                type="button"
                onClick={handleMarkReviewed}
                className="w-full py-1.5 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Mark Reviewed</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalComplianceDrawer;
