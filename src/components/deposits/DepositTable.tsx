import React, { useRef, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Copy,
  Check,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Smartphone,
  Building,
  CreditCard,
} from 'lucide-react';
import type { DepositItem } from '../../types/deposit';
import { formatINR } from '../../utils/currency';
import { animateTableRows } from '../../animations/gsapUtils';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useToast } from '../../hooks/useToast';

interface DepositTableProps {
  deposits: DepositItem[];
  isLoading?: boolean;
  onSelectDeposit: (deposit: DepositItem) => void;
  selectedDepositId?: string;
  onResetFilters?: () => void;
}

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.25,
      ease: 'easeOut',
    },
  }),
};

export const DepositTable: React.FC<DepositTableProps> = ({
  deposits,
  isLoading = false,
  onSelectDeposit,
  selectedDepositId,
  onResetFilters,
}) => {
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const reducedMotion = useReducedMotion();
  const toast = useToast();
  const [copiedRef, setCopiedRef] = React.useState<string | null>(null);

  useEffect(() => {
    const tween = animateTableRows(tbodyRef.current, reducedMotion);
    return () => {
      tween?.kill();
    };
  }, [deposits, reducedMotion]);

  const handleCopyRef = (refText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(refText);
    setCopiedRef(refText);
    setTimeout(() => setCopiedRef(null), 2000);
    toast.success('UTR Copied', `${refText} copied to clipboard.`);
  };

  const renderPaymentMethodBadge = (gateway: string) => {
    const gLower = gateway.toLowerCase();

    if (gLower.includes('phonepe')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-purple-600" />
          <span>PhonePe UPI</span>
        </span>
      );
    }

    if (gLower.includes('google')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Google Pay</span>
        </span>
      );
    }

    if (gLower.includes('paytm')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
          <span>Paytm UPI</span>
        </span>
      );
    }

    if (gLower.includes('hdfc')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
          <Building className="w-3.5 h-3.5 text-indigo-600" />
          <span>HDFC NetBanking</span>
        </span>
      );
    }

    if (gLower.includes('icici')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs">
          <Building className="w-3.5 h-3.5 text-orange-600" />
          <span>ICICI NetBanking</span>
        </span>
      );
    }

    if (gLower.includes('razorpay')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
          <span>RazorpayX UPI</span>
        </span>
      );
    }

    if (gLower.includes('cred')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cred Pay</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
        <span>{gateway}</span>
      </span>
    );
  };

  const renderStatusBadge = (status: DepositItem['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Success</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 space-y-2">
        <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div>Loading payment gateway deposit telemetry...</div>
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 px-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200 shadow-2xs">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">No Deposit Records Found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
            No transactions match the selected filters or search keyword.
          </p>
        </div>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs" aria-label="Player deposits table">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
            <th className="px-4.5 py-3">DEPOSIT ID</th>
            <th className="px-4.5 py-3">PLAYER</th>
            <th className="px-4.5 py-3">AMOUNT</th>
            <th className="px-4.5 py-3">PAYMENT METHOD</th>
            <th className="px-4.5 py-3">GATEWAY REF (UTR)</th>
            <th className="px-4.5 py-3">TIME & SPEED</th>
            <th className="px-4.5 py-3">STATUS</th>
            <th className="px-4.5 py-3 text-right">RECEIPT</th>
          </tr>
        </thead>

        <tbody ref={tbodyRef} className="divide-y divide-slate-100">
          {deposits.map((dep, idx) => {
            const isWhale = dep.amount >= 10000;
            const isSelected = selectedDepositId === dep.id;

            return (
              <motion.tr
                key={dep.id}
                custom={idx}
                variants={tableRowVariants}
                initial="hidden"
                animate="visible"
                onClick={() => onSelectDeposit(dep)}
                className={`transition-colors cursor-pointer group ${
                  isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* 1. DEPOSIT ID */}
                <td className="px-4.5 py-3.5 font-mono text-slate-900 font-semibold">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="hover:text-blue-600 transition-colors">{dep.id}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyRef(dep.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-opacity"
                        title="Copy Deposit ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">{dep.timeAgo}</div>
                  </div>
                </td>

                {/* 2. PLAYER */}
                <td className="px-4.5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs shrink-0">
                      {dep.playerAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{dep.playerName}</span>
                        {dep.playerTier === 'VIP Whale' && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            VIP
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums block">
                        {dep.playerId}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 3. AMOUNT */}
                <td className="px-4.5 py-3.5">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-900 font-mono tracking-tight flex items-center gap-1.5">
                      <span className="text-emerald-700">{formatINR(dep.amount)}</span>
                      {isWhale && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
                          High Roller
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Net: {formatINR(dep.netCredit)}</div>
                  </div>
                </td>

                {/* 4. PAYMENT METHOD */}
                <td className="px-4.5 py-3.5">{renderPaymentMethodBadge(dep.gateway)}</td>

                {/* 5. GATEWAY REF (UTR) */}
                <td className="px-4.5 py-3.5 font-mono text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80">
                      {dep.gatewayRef}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyRef(dep.gatewayRef, e)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      title="Copy UTR Reference"
                    >
                      {copiedRef === dep.gatewayRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>

                {/* 6. TIME & SPEED */}
                <td className="px-4.5 py-3.5 text-xs text-slate-500">
                  <div className="space-y-0.5">
                    <span className="text-slate-700 font-medium block">{dep.timeAgo}</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold block">
                      {dep.settlementSpeed}
                    </span>
                  </div>
                </td>

                {/* 7. STATUS */}
                <td className="px-4.5 py-3.5">{renderStatusBadge(dep.status)}</td>

                {/* 8. ACTIONS */}
                <td className="px-4.5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDeposit(dep);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors inline-flex items-center gap-1 shadow-2xs group-hover:border-slate-300 cursor-pointer"
                    title="View full receipt dossier"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dossier</span>
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DepositTable;
