import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Building,
  Smartphone,
  CreditCard,
  Receipt,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DepositItem } from '../../types/deposit';
import { formatINR } from '../../utils/currency';
import { drawerVariants, modalBackdropVariants } from '../../animations/variants';
import { useToast } from '../../hooks/useToast';

interface DepositReceiptDrawerProps {
  deposit: DepositItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (deposit: DepositItem) => void;
  onReject?: (deposit: DepositItem) => void;
}

export const DepositReceiptDrawer: React.FC<DepositReceiptDrawerProps> = ({
  deposit,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Keyboard shortcut: Close on Escape key
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

  if (!deposit) return null;

  const handleCopy = (text: string, type: 'utr' | 'id') => {
    navigator.clipboard.writeText(text);
    if (type === 'utr') {
      setCopiedUtr(true);
      setTimeout(() => setCopiedUtr(false), 2000);
      toast.success('UTR Copied', `${text} copied to clipboard.`);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      toast.success('Deposit ID Copied', `${text} copied to clipboard.`);
    }
  };

  const handleDownloadReceipt = () => {
    const receipt = {
      transactionId: deposit.id,
      playerId: deposit.playerId,
      playerName: deposit.playerName,
      amount: deposit.amount,
      currency: 'INR',
      reference: deposit.gatewayRef,
      status: deposit.status,
      requestedAt: deposit.timestamp
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deposit.id}-receipt.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt Downloaded', `Transaction record for ${deposit.id} was downloaded.`);
  };

  const renderGatewayIcon = (gateway: string) => {
    if (gateway.toLowerCase().includes('phonepe') || gateway.toLowerCase().includes('paytm') || gateway.toLowerCase().includes('google')) {
      return <Smartphone className="w-4 h-4 text-purple-600" />;
    }
    if (gateway.toLowerCase().includes('netbanking')) {
      return <Building className="w-4 h-4 text-blue-600" />;
    }
    return <CreditCard className="w-4 h-4 text-slate-700" />;
  };

  const transactionRecord = {
    id: deposit.id,
    playerId: deposit.playerId,
    playerName: deposit.playerName,
    amount: deposit.amount,
    currency: 'INR',
    paymentMethod: deposit.gateway,
    reference: deposit.gatewayRef || null,
    status: deposit.status,
    createdAt: deposit.timestamp,
    proofDataUrl: deposit.proofDataUrl ?? null
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-2xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-slate-900 text-sm">Deposit Dossier</h2>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {deposit.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Official transaction receipt & gateway audit log.
                    </p>
                  </div>
                </div>

                {/* ESC button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
                  title="Close receipt (Esc)"
                >
                  <kbd className="text-[10px] font-mono bg-slate-100 group-hover:bg-slate-200 text-slate-600 border border-slate-200/80 px-1.5 py-0.5 rounded font-bold transition-colors">
                    ESC
                  </kbd>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4.5 text-xs text-slate-700">
                {/* 1. Hero Amount Card */}
                <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/90 rounded-2xl p-4.5 text-center relative overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {deposit.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Payment Completed</span>
                      </span>
                    ) : deposit.status === 'processing' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                        <span>Settlement in Progress</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Deposit Failed</span>
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight my-1">
                    {formatINR(deposit.amount)}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Wallet top-up via {deposit.gateway} • {deposit.timeAgo}
                  </p>

                  {deposit.failureReason && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] text-left">
                      <strong>Failure Diagnosis:</strong> {deposit.failureReason}
                    </div>
                  )}
                </div>

                {/* 2. Financial Impact Breakdown */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-bold text-slate-800 text-xs">
                    <span>Financial Breakdown</span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Gross Deposit Amount:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatINR(deposit.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Platform Convenience Fee:</span>
                      <span className="font-mono font-semibold text-emerald-600">
                        ₹0.00 (Free)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Net Credited to Wallet:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {formatINR(deposit.netCredit)}
                      </span>
                    </div>

                    {deposit.walletBalanceBefore !== undefined && deposit.walletBalanceAfter !== undefined && <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-slate-500">Player Balance Impact:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatINR(deposit.walletBalanceBefore)} → {formatINR(deposit.walletBalanceAfter)}
                      </span>
                    </div>}
                  </div>
                </div>

                {/* 3. Player Dossier */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-bold text-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Player Information</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/admin/players/${deposit.playerId.replace('#', '')}`);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {deposit.playerAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{deposit.playerName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {deposit.playerTier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{deposit.playerId}</span>
                        <span>•</span>
                        <span>KYC Verified</span>
                      </div>
                    </div>
                  </div>

                  {deposit.ipAddress && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Origin IP: {deposit.ipAddress}
                    </div>
                  )}
                </div>

                {/* 4. Payment Gateway & Banking Rails */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-bold text-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      {renderGatewayIcon(deposit.gateway)}
                      <span>Gateway & Bank Telemetry</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      {deposit.settlementSpeed}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Payment Gateway:</span>
                      <span className="font-semibold text-slate-800">{deposit.gateway}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bank UTR Reference:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <span>{deposit.gatewayRef}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(deposit.gatewayRef, 'utr')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy UTR Reference"
                        >
                          {copiedUtr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {deposit.vpa && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Payer VPA:</span>
                        <span className="font-mono text-slate-700">{deposit.vpa}</span>
                      </div>
                    )}

                    {deposit.bankName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Bank Node:</span>
                        <span className="text-slate-700 font-medium">{deposit.bankName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Payment Screenshot (Actual Proof) */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs pb-1 border-b border-slate-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Payment Screenshot / Proof</span>
                  </div>

                  <div className="pt-2">
                    {deposit.proofDataUrl ? (
                      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <img 
                          src={deposit.proofDataUrl} 
                          alt="User Payment Proof" 
                          className="w-full h-auto max-h-[300px] object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-500 text-[11px] border border-slate-200 border-dashed">
                        No payment screenshot was uploaded by the user.
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Raw Webhook Payload (Collapsible) */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5">
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <span>Stored Transaction Record</span>
                    {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showRawJson && (
                    <div className="mt-2.5 p-2.5 bg-slate-900 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto">
                      <pre>{JSON.stringify(transactionRecord, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Record</span>
                </button>

                <div className="flex items-center gap-2">
                  {deposit.status === 'processing' && onApprove && onReject && <>
                    <button
                      type="button"
                      onClick={() => onReject(deposit)}
                      className="px-3 py-2 border border-rose-200 bg-white text-rose-700 rounded-xl font-semibold text-xs"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(deposit)}
                      disabled={!deposit.proofDataUrl}
                      title={!deposit.proofDataUrl ? 'A payment screenshot is required to approve.' : undefined}
                      className="px-3 py-2 bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold text-xs"
                    >
                      Approve
                    </button>
                  </>}
                  <button
                    type="button"
                    onClick={() => handleCopy(deposit.id, 'id')}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    Close
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

export default DepositReceiptDrawer;
