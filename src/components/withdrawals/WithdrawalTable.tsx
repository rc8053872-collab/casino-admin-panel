import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Square,
  ArrowUpDown,
  Clock,
  Receipt,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import type { Withdrawal, WithdrawalStatus, RiskTier } from '../../types/withdrawal';
import { formatINR } from '../../utils/currency';

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  selectedIds: string[];
  isLoading?: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onSort: (field: any) => void;
  onApprove: (withdrawal: Withdrawal) => void;
  onReject: (withdrawal: Withdrawal) => void;
  onInvestigate: (withdrawal: Withdrawal) => void;
  onViewReceipt: (withdrawal: Withdrawal) => void;
}

function getRelativeTime(isoStr: string): string {
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    const remMin = diffMin % 60;
    if (diffHours < 24) {
      return remMin > 0 ? `${diffHours}h ${remMin}m ago` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export const WithdrawalTable: React.FC<WithdrawalTableProps> = ({
  withdrawals,
  selectedIds,
  isLoading = false,
  onToggleSelectAll,
  onToggleSelect,
  onSort,
  onApprove,
  onReject,
  onInvestigate,
  onViewReceipt,
}) => {
  const navigate = useNavigate();

  const renderStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Verification
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
            Processing
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Paid / Settled
          </span>
        );
      case 'compliance_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Compliance Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Rejected
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Refunded
          </span>
        );
    }
  };

  const renderRiskBadge = (tier: RiskTier) => {
    switch (tier) {
      case 'low':
        return <span className="text-[10px] font-bold text-emerald-700">● Low</span>;
      case 'medium':
        return <span className="text-[10px] font-bold text-amber-700">● Medium</span>;
      case 'high':
        return <span className="text-[10px] font-bold text-rose-700">● High</span>;
      case 'critical':
        return <span className="text-[10px] font-bold text-rose-800 font-mono">● CRITICAL</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div>Synchronizing withdrawal settlement queue...</div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="py-16 text-center space-y-2 px-4">
        <div className="text-sm font-bold text-slate-800">No withdrawal requests found.</div>
        <p className="text-xs text-slate-400">Try changing your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
            {/* 1. SELECT */}
            <th className="px-3 py-3 w-8">
              <button
                type="button"
                onClick={onToggleSelectAll}
                className="p-0.5 text-slate-400 hover:text-slate-700"
                title="Select All"
              >
                {selectedIds.length === withdrawals.length && withdrawals.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </th>

            {/* 2. PAYOUT ID */}
            <th className="px-3.5 py-3">PAYOUT ID</th>

            {/* 3. PLAYER */}
            <th className="px-3 py-3">PLAYER</th>

            {/* 4. REQUESTED AMOUNT */}
            <th
              className="px-3 py-3 cursor-pointer hover:text-slate-700"
              onClick={() => onSort('amount')}
            >
              <div className="flex items-center gap-1">
                <span>REQUESTED AMOUNT</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>

            {/* 5. DESTINATION ACCOUNT / MODE */}
            <th className="px-3 py-3">DESTINATION ACCOUNT / MODE</th>

            {/* 6. TURNOVER / RISK CHECK */}
            <th
              className="px-3 py-3 cursor-pointer hover:text-slate-700"
              onClick={() => onSort('riskScore')}
            >
              <div className="flex items-center gap-1">
                <span>TURNOVER / RISK CHECK</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>

            {/* 7. REQUESTED */}
            <th
              className="px-3 py-3 cursor-pointer hover:text-slate-700"
              onClick={() => onSort('requestedAt')}
            >
              <div className="flex items-center gap-1">
                <span>REQUESTED</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>

            {/* 8. STATUS */}
            <th
              className="px-3 py-3 cursor-pointer hover:text-slate-700"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-1">
                <span>STATUS</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>

            {/* 9. APPROVAL ACTIONS */}
            <th className="px-3.5 py-3 text-right">APPROVAL ACTIONS</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {withdrawals.map((w) => {
            const isSelected = selectedIds.includes(w.id);
            const destText =
              w.destination.type === 'bank'
                ? `${w.destination.bankName} ${w.destination.maskedAccount}`
                : w.destination.upiId;

            return (
              <tr
                key={w.id}
                className={`hover:bg-slate-50/70 transition-colors ${
                  isSelected ? 'bg-blue-50/30' : ''
                }`}
              >
                {/* 1. SELECT */}
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={(e) => onToggleSelect(w.id, e)}
                    className="p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </td>

                {/* 2. PAYOUT ID */}
                <td className="px-3.5 py-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/transactions/withdrawals/${w.payoutId}`)}
                      className="font-mono font-bold text-blue-600 hover:underline hover:text-blue-700 text-xs text-left"
                    >
                      {w.payoutId}
                    </button>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {w.method === 'UPI' ? 'UPI Auto' : `${w.method} Rail`}
                    </div>
                  </div>
                </td>

                {/* 3. PLAYER */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {w.avatarInitials}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/players/${w.playerId}`)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left truncate max-w-[130px] block"
                      >
                        {w.playerName}
                      </button>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>@{w.username}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">{w.playerTier}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 4. REQUESTED AMOUNT */}
                <td className="px-3 py-3">
                  <div>
                    <span className="font-bold text-slate-900 font-mono text-[13px]">
                      {formatINR(w.amount)}
                    </span>
                    {w.feePercent !== undefined && w.feePercent > 0 && (
                      <div className="text-[10px] text-amber-700 font-medium">
                        Fee: -{formatINR(w.feeAmount || 0)} ({w.feePercent}%)
                      </div>
                    )}
                    <div className="text-[11px] font-bold text-emerald-700 font-mono">
                      Pay: {formatINR(w.finalAmount || w.amount)}
                    </div>
                  </div>
                </td>

                {/* 5. DESTINATION ACCOUNT / MODE */}
                <td className="px-3 py-3 font-mono text-[11px] text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900 block truncate max-w-[170px]">
                      {destText}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">{w.method} Rail</span>
                  </div>
                </td>

                {/* 6. TURNOVER / RISK CHECK */}
                <td className="px-3 py-3">
                  <div
                    onClick={() => onInvestigate(w)}
                    className="cursor-pointer group select-none space-y-1"
                    title="Click to open compliance drawer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-[11px]">
                        {w.turnover.percentage}% Met
                      </span>
                      {renderRiskBadge(w.riskTier)}
                    </div>

                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          w.turnover.percentage >= 100
                            ? 'bg-emerald-500'
                            : w.turnover.percentage > 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, w.turnover.percentage)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 7. REQUESTED */}
                <td className="px-3 py-3 text-slate-500 font-medium">
                  {getRelativeTime(w.requestedAt)}
                </td>

                {/* 8. STATUS */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {renderStatusBadge(w.status)}
                </td>

                {/* 9. APPROVAL ACTIONS */}
                <td className="px-3.5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {w.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(w)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(w)}
                          className="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg font-semibold text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {w.status === 'processing' && (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/transactions/withdrawals/${w.payoutId}`)}
                        className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Track</span>
                      </button>
                    )}

                    {w.status === 'paid' && (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(w)}
                        className="px-2.5 py-1 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    )}

                    {w.status === 'compliance_review' && (
                      <button
                        type="button"
                        onClick={() => onInvestigate(w)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>Investigate</span>
                      </button>
                    )}

                    {/* More Details Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/transactions/withdrawals/${w.payoutId}`)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Inspect full details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalTable;
