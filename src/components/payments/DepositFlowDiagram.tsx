import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ExternalLink,
  UserCheck,
  FileCheck,
} from 'lucide-react';

interface DepositFlowDiagramProps {
  onOpenAadhaarKyc?: () => void;
}

export const DepositFlowDiagram: React.FC<DepositFlowDiagramProps> = ({ onOpenAadhaarKyc }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal'>('deposit');

  const depositStages = [
    { num: '01', title: 'PLAYER', sub: 'Initiates deposit' },
    { num: '02', title: 'SELECTS DEPOSIT', sub: 'Enters INR amount' },
    { num: '03', title: 'PAYMENT METHOD', sub: 'UPI / NetBanking' },
    { num: '04', title: 'UPI / QR', sub: 'Scans or opens app' },
    { num: '05', title: 'PAYMENT PROVIDER', sub: 'Bank / NPCI switch' },
    { num: '06', title: 'VERIFICATION', sub: 'Webhook / UTR match' },
    { num: '07', title: 'DEPOSIT CREATED', sub: 'Audit receipt generated' },
    { num: '08', title: 'WALLET CREDIT', sub: 'Instant player balance' },
    { num: '09', title: 'HISTORY', sub: 'Ledger immutable log' },
  ];

  const depositStatuses = [
    { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Success', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: 'Expired', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { label: 'Refunded', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  const withdrawalStages = [
    { num: '01', title: 'PLAYER', sub: 'Requests cashout' },
    { num: '02', title: 'WITHDRAWAL REQ', sub: 'Amount & bank/UPI' },
    { num: '03', title: 'KYC / RISK CHECK', sub: 'Aadhaar + Turnover audit' },
    { num: '04', title: 'ADMIN REVIEW', sub: 'Manual or Auto-approval' },
    { num: '05', title: 'PAYMENT PROVIDER', sub: 'IMPS / Payout node' },
    { num: '06', title: 'PROCESSING', sub: 'Bank network clearing' },
    { num: '07', title: 'SETTLED', sub: 'Player account credited' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Tab Switcher & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Transaction Lifecycle Architecture
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
              PIPELINE FLOW
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end routing stages from player initiation to ledger settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('deposit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Deposit Flow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('withdrawal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'withdrawal'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Withdrawal Flow
            </button>
          </div>

          {/* Quick link to actual transactions page */}
          {activeTab === 'deposit' ? (
            <button
              type="button"
              onClick={() => navigate('/admin/transactions/deposits')}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Deposits Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/admin/transactions/withdrawals')}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Withdrawals Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Aadhaar KYC Option */}
          {onOpenAadhaarKyc && (
            <button
              type="button"
              onClick={onOpenAadhaarKyc}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aadhaar KYC</span>
            </button>
          )}
        </div>
      </div>

      {/* Diagram Pipeline */}
      {activeTab === 'deposit' ? (
        <div className="space-y-3">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[780px] gap-1.5">
              {depositStages.map((stage, idx) => (
                <React.Fragment key={stage.num}>
                  <div className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-center transition-colors hover:border-blue-400">
                    <span className="text-[9.5px] font-mono text-blue-600 font-bold block">
                      {stage.num}
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 font-mono block mt-0.5 whitespace-nowrap">
                      {stage.title}
                    </span>
                    <span className="text-[9.5px] text-slate-500 block truncate mt-0.5">
                      {stage.sub}
                    </span>
                  </div>
                  {idx < depositStages.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-0.5" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Deposit Status Indicators */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 text-[11px]">Lifecycle Statuses:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {depositStatuses.map((st) => (
                  <span
                    key={st.label}
                    className={`px-2 py-0.5 rounded-md border text-[10.5px] font-mono font-semibold ${st.color}`}
                  >
                    {st.label}
                  </span>
                ))}
              </div>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Auto-reconciliation runs every 5 minutes
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[700px] gap-2">
              {withdrawalStages.map((stage, idx) => (
                <React.Fragment key={stage.num}>
                  <div
                    className={`flex-1 rounded-xl p-3 text-center border transition-colors ${
                      stage.title.includes('KYC')
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50 border-slate-200/90 hover:border-blue-400'
                    }`}
                  >
                    <span className="text-[9.5px] font-mono text-blue-600 font-bold block">
                      {stage.num}
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 font-mono block mt-0.5 whitespace-nowrap">
                      {stage.title}
                    </span>
                    <span className="text-[9.5px] text-slate-500 block truncate mt-0.5">
                      {stage.sub}
                    </span>
                  </div>
                  {idx < withdrawalStages.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-0.5" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* KYC Notice */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Aadhaar Card KYC Check:</strong> Required for deposits & withdrawals over ₹50,000 or high-frequency accounts.
              </span>
            </div>
            {onOpenAadhaarKyc && (
              <button
                type="button"
                onClick={onOpenAadhaarKyc}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
              >
                + Verify Aadhaar Card
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositFlowDiagram;
