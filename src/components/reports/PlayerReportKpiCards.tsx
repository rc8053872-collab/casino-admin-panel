import React from 'react';
import { TrendingUp, Users, UserCheck, ShieldAlert, Wallet } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { PlayerReportKPIs } from '../../types/playerReport';

interface PlayerReportKpiCardsProps {
  kpis: PlayerReportKPIs;
  isLoading?: boolean;
}

export const PlayerReportKpiCards: React.FC<PlayerReportKpiCardsProps> = ({
  kpis,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2 animate-pulse"
          >
            <div className="h-3 w-20 bg-slate-100 rounded-md" />
            <div className="h-7 w-28 bg-slate-100 rounded-md" />
            <div className="h-3 w-24 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. New Players */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              New Players
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
            <AnimatedNumber value={kpis.newPlayers} />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px]">
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{kpis.newPlayersTrend}%</span>
          </span>
          <span className="text-slate-400 truncate">{kpis.newPlayersSub}</span>
        </div>
      </div>

      {/* 2. Daily Active Users */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Daily Active Users
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
            <AnimatedNumber value={kpis.dailyActiveUsers} />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px]">
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{kpis.dauTrend}%</span>
          </span>
          <span className="text-slate-400 truncate">{kpis.dauSub}</span>
        </div>
      </div>

      {/* 3. Retention Rate */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Retention Rate
            </span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200">
              30D
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
            <AnimatedNumber value={kpis.retentionRate} decimals={1} suffix="%" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px]">
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{kpis.retentionTrend}%</span>
          </span>
          <span className="text-slate-400 truncate">vs prior cohort</span>
        </div>
      </div>

      {/* 4. Average Player Value */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg Player Value
            </span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
            <AnimatedNumber value={kpis.averagePlayerValue} format="currency" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px]">
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{kpis.arpuTrend}%</span>
          </span>
          <span className="text-slate-400 truncate">wallet + rake</span>
        </div>
      </div>

      {/* 5. Fraud / Risk Rate */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Fraud / Risk Rate
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
            <AnimatedNumber value={kpis.fraudRiskRate} decimals={2} suffix="%" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px]">
          <span className="text-rose-600 font-bold">
            <AnimatedNumber value={kpis.flaggedAccounts} /> flagged
          </span>
          <span className="text-slate-400 truncate">{kpis.fraudSub}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerReportKpiCards;
