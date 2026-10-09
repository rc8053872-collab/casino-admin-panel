import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Clock,
  TrendingUp,
  Zap,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import type { WithdrawalStats } from '../../types/withdrawal';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface WithdrawalKpiCardsProps {
  stats?: WithdrawalStats;
  isLoading?: boolean;
}

export const WithdrawalKpiCards: React.FC<WithdrawalKpiCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    const ctx = gsap.context(() => {
      gsap.from('.kpi-card-anim', {
        opacity: 0,
        y: 8,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs animate-pulse h-24 space-y-2"
          >
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Pending Approvals */}
      <div className="kpi-card-anim bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Approvals
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Priority
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            <AnimatedNumber value={stats.pendingApprovalsCount} label="Requests" />
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
          <span><AnimatedNumber value={stats.pendingApprovalsAmount} format="currency" /> total queue</span>
        </div>
      </div>

      {/* 2. 24H Payout Volume */}
      <div className="kpi-card-anim bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            24H Payout Volume
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            <AnimatedNumber value={stats.payout24hVolume} format="compactCurrency" />
          </span>
          {stats.volumeGrowthText && (
            <span className="text-[10px] font-bold text-emerald-600">
              {stats.volumeGrowthText}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 truncate">
          <AnimatedNumber value={stats.completedTxns24h} /> completed txns
        </div>
      </div>

      {/* 3. Avg Settlement Time */}
      <div className="kpi-card-anim bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Settlement Time
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {stats.settlementStatus}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            {stats.avgSettlementTime}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
          <Zap className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="truncate">{stats.settlementMethod}</span>
        </div>
      </div>

      {/* 4. Failed / Compliance Review */}
      <div className="kpi-card-anim bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Compliance Review
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {stats.complianceStatus}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            <AnimatedNumber value={stats.failedComplianceCases} label="Cases" />
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
          <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />
          <span className="truncate" title={stats.complianceReason}>{stats.complianceReason}</span>
        </div>
      </div>

      {/* 5. Processing Success Rate */}
      <div className="kpi-card-anim bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Processing Success
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-emerald-700 tracking-tight font-mono">
            <AnimatedNumber value={stats.successRate} decimals={1} suffix="%" />
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>{stats.successRatePeriod}</span>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalKpiCards;
