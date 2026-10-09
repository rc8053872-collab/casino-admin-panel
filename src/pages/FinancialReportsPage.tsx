import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { animateTableRows } from '../animations/gsapUtils';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { pageVariants } from '../animations/variants';

interface FinancialMetricCardProps {
  label: string;
  value: number;
  format?: 'currency' | 'compactCurrency' | 'percent' | 'number';
  prefix?: string;
  suffix?: string;
  sub?: string;
  badge?: string;
  badgeType?: 'positive' | 'negative' | 'neutral' | 'info';
  isHighlight?: boolean;
}

function FinancialMetricCard({
  label,
  value,
  format = 'currency',
  prefix,
  suffix,
  sub,
  badge,
  badgeType = 'neutral',
  isHighlight = false,
}: FinancialMetricCardProps) {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'negative':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div
      className={`p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group ${
        isHighlight
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/10'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between pb-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        {badge && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass()}`}
          >
            {badgeType === 'positive' && <ArrowUpRight className="w-2.5 h-2.5" />}
            {badgeType === 'negative' && <ArrowDownRight className="w-2.5 h-2.5" />}
            {badge}
          </span>
        )}
      </div>

      <div
        className={`text-2xl font-black tracking-tight font-mono mt-1 ${
          isHighlight ? 'text-emerald-600' : 'text-slate-900'
        }`}
      >
        <AnimatedNumber
          value={value}
          format={format}
          prefix={prefix}
          suffix={suffix}
          duration={0.8}
        />
      </div>

      {sub && <span className="text-[11px] text-slate-500 mt-1 block">{sub}</span>}
    </div>
  );
}

export const FinancialReportsPage: React.FC = () => {
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const reducedMotion = useReducedMotion();
  const toast = useToast();

  const [datePeriod, setDatePeriod] = useState<'october' | 'september' | 'quarter'>('october');

  // Simulated live reactive dataset depending on period
  const financialData = {
    october: {
      netPnL: 324000,
      grossRevenue: 842000,
      grossWithdrawals: 518000,
      netOperatingRevenue: 309800,
      dailyClosingBalance: 14850000,
      settlementTotal: 503800,
      pendingSettlement: 14200,
      totalFees: 32400,
      platformFees: 18400,
      entryFees: 11200,
      gameFees: 2800,
      playerPayouts: 518000,
      refunds: 4200,
      bonuses: 18500,
      paymentFees: 14200,
      gatewayFees: 14200,
    },
    september: {
      netPnL: 320000,
      grossRevenue: 810000,
      grossWithdrawals: 490000,
      netOperatingRevenue: 306500,
      dailyClosingBalance: 14120000,
      settlementTotal: 476500,
      pendingSettlement: 13500,
      totalFees: 31200,
      platformFees: 17800,
      entryFees: 10800,
      gameFees: 2600,
      playerPayouts: 490000,
      refunds: 3900,
      bonuses: 17200,
      paymentFees: 13500,
      gatewayFees: 13500,
    },
    quarter: {
      netPnL: 914000,
      grossRevenue: 2372000,
      grossWithdrawals: 1458000,
      netOperatingRevenue: 874200,
      dailyClosingBalance: 14850000,
      settlementTotal: 1418200,
      pendingSettlement: 39800,
      totalFees: 89400,
      platformFees: 51200,
      entryFees: 31400,
      gameFees: 6800,
      playerPayouts: 1458000,
      refunds: 11800,
      bonuses: 51200,
      paymentFees: 39800,
      gatewayFees: 39800,
    },
  }[datePeriod];

  useEffect(() => {
    const tween = animateTableRows(tbodyRef.current, reducedMotion);
    return () => {
      tween?.kill();
    };
  }, [reducedMotion]);

  const handleExportPdf = () => {
    toast.success('P&L Report Exported', 'Certified financial statement downloaded.');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Audit-Grade Accounting Ledger</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400">INR Compliant (Lakhs & Crores)</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Financial & P&L Statement</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Reconciliation
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-rail financial audit of deposits, withdrawals, platform rake, and settlement escrow.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Period selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDatePeriod('october')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                datePeriod === 'october'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Oct 2026
            </button>
            <button
              type="button"
              onClick={() => setDatePeriod('september')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                datePeriod === 'september'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sep 2026
            </button>
            <button
              type="button"
              onClick={() => setDatePeriod('quarter')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                datePeriod === 'quarter'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Q3 Full
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Top Primary Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <FinancialMetricCard
          label="Net P&L (Platform Rake)"
          value={financialData.netPnL}
          format="currency"
          badge="+12.4% MoM"
          badgeType="positive"
          sub="Deposits − Player Payouts"
          isHighlight
        />
        <FinancialMetricCard
          label="Gross Revenue (Inflow)"
          value={financialData.grossRevenue}
          format="currency"
          badge="Inflow SLA"
          badgeType="info"
          sub="All verified player wallet top-ups"
        />
        <FinancialMetricCard
          label="Gross Withdrawals (Outflow)"
          value={financialData.grossWithdrawals}
          format="currency"
          badge="61.5% Ratio"
          badgeType="neutral"
          sub="Processed payout settlements"
        />
        <FinancialMetricCard
          label="Daily Closing Balance"
          value={financialData.dailyClosingBalance}
          format="compactCurrency"
          badge="Audited"
          badgeType="positive"
          sub="Liquid bank reserve balance"
        />
      </div>

      {/* 3. Detailed Financial Breakdown System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <FinancialMetricCard
          label="Net Operating Revenue"
          value={financialData.netOperatingRevenue}
          format="currency"
          sub="After deducting processing charges"
        />
        <FinancialMetricCard
          label="Platform Fees"
          value={financialData.platformFees}
          format="currency"
          sub="System rake & matchmaking"
        />
        <FinancialMetricCard
          label="Entry Fees"
          value={financialData.entryFees}
          format="currency"
          sub="Tournament & arena entry collections"
        />
        <FinancialMetricCard
          label="Game Fees"
          value={financialData.gameFees}
          format="currency"
          sub="Table maintenance allocation"
        />
        <FinancialMetricCard
          label="Settlement Total"
          value={financialData.settlementTotal}
          format="currency"
          sub="Dispatched bank transfer batches"
        />
        <FinancialMetricCard
          label="Pending Settlement"
          value={financialData.pendingSettlement}
          format="currency"
          badge="Queue"
          badgeType="info"
          sub="Pending bank confirmation"
        />
        <FinancialMetricCard
          label="Gateway Fees (Est.)"
          value={financialData.gatewayFees}
          format="currency"
          sub="Razorpay / Cashfree interchange"
        />
        <FinancialMetricCard
          label="Promotional Bonuses"
          value={financialData.bonuses}
          format="currency"
          sub="Welcome perks & cashbacks"
        />
      </div>

      {/* 4. Financial Statement Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly P&L Ledger Summary</h3>
            <p className="text-xs text-slate-500">Historical performance with dynamic animated figures</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            All figures formatted in Indian INR
          </span>
        </div>

        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100">
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Accounting Period
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Total Deposits
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Total Withdrawals
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Gateway Fees (est.)
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Net Flow (Rake)
              </th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-slate-100">
            {[
              {
                month: 'October 2026 (MTD)',
                deposits: 842000,
                withdrawals: 518000,
                fees: 14200,
                net: 324000,
              },
              {
                month: 'September 2026',
                deposits: 810000,
                withdrawals: 490000,
                fees: 13500,
                net: 320000,
              },
              {
                month: 'August 2026',
                deposits: 720000,
                withdrawals: 450000,
                fees: 12100,
                net: 270000,
              },
              {
                month: 'July 2026',
                deposits: 640000,
                withdrawals: 410000,
                fees: 10800,
                net: 230000,
              },
            ].map((m) => (
              <tr key={m.month} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900">{m.month}</td>
                <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                  <AnimatedNumber value={m.deposits} format="currency" />
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 font-mono">
                  <AnimatedNumber value={m.withdrawals} format="currency" />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                  <AnimatedNumber value={m.fees} format="currency" />
                </td>
                <td className="px-4 py-3 font-bold text-emerald-600 font-mono">
                  <AnimatedNumber value={m.net} format="currency" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default FinancialReportsPage;
