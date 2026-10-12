import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Building,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import {
  useWithdrawal,
  useSettlementTimeline,
  useApproveWithdrawal,
  useRejectWithdrawal,
} from '../hooks/useWithdrawalsQuery';
import { formatINR } from '../utils/currency';
import { useToast } from '../hooks/useToast';
import WithdrawalApproveModal from '../components/withdrawals/WithdrawalApproveModal';
import WithdrawalRejectModal from '../components/withdrawals/WithdrawalRejectModal';
import WithdrawalComplianceDrawer from '../components/withdrawals/WithdrawalComplianceDrawer';
import WithdrawalReceiptModal from '../components/withdrawals/WithdrawalReceiptModal';

export const WithdrawalDetailPage: React.FC = () => {
  const { withdrawalId = 'WTH-00182' } = useParams<{ withdrawalId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: withdrawal, isLoading, isError } = useWithdrawal(withdrawalId);
  const { data: timeline = [] } = useSettlementTimeline(withdrawal?.id);

  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isInvestigateOpen, setIsInvestigateOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleApprove = async (amount: number, paymentReference: string) => {
    if (!withdrawal) return;
    try {
      await approveMutation.mutateAsync({ id: withdrawal.id, amount, paymentReference });
      toast.success(
        'Withdrawal marked as paid',
        `₹${withdrawal.amount.toLocaleString('en-IN')} marked paid for ${withdrawal.playerName}.`
      );
      setIsApproveOpen(false);
    } catch {
      toast.error('Approval Failed', 'Unable to approve request.');
    }
  };

  const handleReject = async (reason: string) => {
    if (!withdrawal) return;
    try {
      await rejectMutation.mutateAsync({ id: withdrawal.id, reason });
      toast.error(
        'Withdrawal rejected',
        `${withdrawal.payoutId} rejected: ${reason}. Funds reverted.`
      );
      setIsRejectOpen(false);
    } catch {
      toast.error('Rejection Failed', 'Unable to reject request.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div>Loading withdrawal payout record...</div>
      </div>
    );
  }

  if (isError || !withdrawal) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">Withdrawal Request Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested payout ID &quot;{withdrawalId}&quot; does not exist in the active settlement ledger.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/transactions/withdrawals')}
          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Withdrawals Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1280px] mx-auto pb-14 text-slate-800 text-xs">
      {/* 1. Header & Breadcrumb */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/transactions/withdrawals')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Withdrawals Queue</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Withdrawal {withdrawal.payoutId}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                withdrawal.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : withdrawal.status === 'pending'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : withdrawal.status === 'processing'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              ● {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Rail: {withdrawal.method} • Requested {new Date(withdrawal.requestedAt).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-right mr-3 hidden md:block">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Requested</span>
            <span className="text-xl font-bold text-slate-900 font-mono tracking-tight block">
              {formatINR(withdrawal.amount)}
            </span>
            {withdrawal.feePercent !== undefined && withdrawal.feePercent > 0 && (
              <span className="text-[10px] text-amber-700 font-semibold block">
                Fee Cut: -{formatINR(withdrawal.feeAmount || 0)} ({withdrawal.feePercent}%)
              </span>
            )}
            <span className="text-xs font-extrabold text-emerald-700 font-mono block">
              Net Pay: {formatINR(withdrawal.finalAmount || withdrawal.amount)}
            </span>
          </div>

          {withdrawal.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => setIsApproveOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Payout</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRejectOpen(true)}
                className="px-3.5 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Reject Request
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsInvestigateOpen(true)}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Investigate AML</span>
          </button>

          {withdrawal.status === 'paid' && (
            <button
              type="button"
              onClick={() => setIsReceiptOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Grid Sections: Withdrawal Info, Destination, Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 1: Withdrawal Information */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Withdrawal Information</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Payout ID:</span>
              <span className="font-mono font-bold text-slate-900">{withdrawal.payoutId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Player:</span>
              <button
                type="button"
                onClick={() => navigate(`/admin/players/${withdrawal.playerId}`)}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>{withdrawal.playerName}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Amount:</span>
              <span className="font-mono font-bold text-slate-900">{formatINR(withdrawal.amount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Payment Method:</span>
              <span className="font-semibold text-slate-800">{withdrawal.method} Rail</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Requested At:</span>
              <span className="text-slate-700 font-mono">
                {new Date(withdrawal.requestedAt).toLocaleTimeString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Destination */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Destination Account</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Mode:</span>
              <span className="font-bold uppercase text-slate-800">{withdrawal.destination.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Account Holder:</span>
              <span className="font-semibold text-slate-900">
                {withdrawal.destination.accountHolder || withdrawal.playerName}
              </span>
            </div>
            {withdrawal.destination.type === 'bank' ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-semibold text-slate-800">{withdrawal.destination.bankName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Masked Account:</span>
                  <span className="font-mono font-bold text-slate-900">{withdrawal.destination.maskedAccount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="font-mono text-slate-700">{withdrawal.destination.ifsc}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">UPI ID:</span>
                <span className="font-mono font-bold text-slate-900">{withdrawal.destination.upiId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Compliance & Risk */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Compliance & AML Verification</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">KYC Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED (DigiLocker)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Turnover Wagering:</span>
              <span className="font-bold text-slate-900">{withdrawal.turnover.percentage}% Met</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Risk Score:</span>
              <span className="font-mono font-bold text-slate-900">{withdrawal.riskScore}/100</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Risk Tier:</span>
              <span
                className={`font-bold uppercase ${
                  withdrawal.riskTier === 'low'
                    ? 'text-emerald-700'
                    : withdrawal.riskTier === 'medium'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                ● {withdrawal.riskTier} Tier
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Settlement Timeline Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Settlement Processing Timeline</span>
          </div>
          <span className="text-[11px] text-slate-400">Real-time banking lifecycle stream</span>
        </div>

        <div className="relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 space-y-4">
          {timeline.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex items-start gap-3"
            >
              <span
                className={`w-3 h-3 rounded-full ring-4 ring-white -left-[19px] relative top-1 shrink-0 ${
                  step.status === 'completed'
                    ? 'bg-emerald-500'
                    : step.status === 'current'
                    ? 'bg-blue-600 animate-ping'
                    : step.status === 'rejected'
                    ? 'bg-rose-500'
                    : 'bg-slate-300'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-xs font-semibold">{step.time}</span>
                  <span className="font-bold text-slate-900 text-xs">{step.title}</span>
                </div>
                {step.description && (
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{step.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals & Drawer */}
      <WithdrawalApproveModal
        withdrawal={withdrawal}
        isOpen={isApproveOpen}
        isLoading={approveMutation.isPending}
        onConfirm={handleApprove}
        onClose={() => setIsApproveOpen(false)}
      />

      <WithdrawalRejectModal
        withdrawal={withdrawal}
        isOpen={isRejectOpen}
        isLoading={rejectMutation.isPending}
        onConfirm={handleReject}
        onClose={() => setIsRejectOpen(false)}
      />

      <WithdrawalComplianceDrawer
        withdrawal={withdrawal}
        isOpen={isInvestigateOpen}
        onClose={() => setIsInvestigateOpen(false)}
        onApprove={() => {
          setIsInvestigateOpen(false);
          setIsApproveOpen(true);
        }}
        onReject={() => {
          setIsInvestigateOpen(false);
          setIsRejectOpen(true);
        }}
      />

      <WithdrawalReceiptModal
        withdrawal={withdrawal}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

export default WithdrawalDetailPage;
