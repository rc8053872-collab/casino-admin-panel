import React from 'react';
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { KycStats as KycStatsType } from '../types/kyc.types';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';

interface KycStatsProps {
  stats: KycStatsType | null;
  isLoading?: boolean;
}

export const KycStats: React.FC<KycStatsProps> = ({ stats, isLoading = false }) => {
  const cards = [
    {
      id: 'kpi-total',
      label: 'Total KYC',
      value: stats?.total ?? 12840,
      sub: '98.4% player base covered',
      icon: Shield,
      color: 'blue',
      badge: 'All Tiers',
      badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'kpi-pending',
      label: 'Pending',
      value: stats?.pending ?? 184,
      sub: 'Awaiting operator review',
      icon: Clock,
      color: 'amber',
      badge: 'Action Queue',
      badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'kpi-verified',
      label: 'Verified',
      value: stats?.verified ?? 11982,
      sub: '93.3% approval rate',
      icon: CheckCircle2,
      color: 'emerald',
      badge: 'Compliant',
      badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'kpi-rejected',
      label: 'Rejected',
      value: stats?.rejected ?? 521,
      sub: 'OCR or name mismatch',
      icon: XCircle,
      color: 'rose',
      badge: 'Declined',
      badgeCls: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'kpi-risk-review',
      label: 'Risk Review',
      value: stats?.riskReview ?? 153,
      sub: 'Heuristic anomaly triggers',
      icon: AlertTriangle,
      color: 'purple',
      badge: 'High Vigilance',
      badgeCls: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="w-20 h-3 bg-slate-200 rounded" />
              <div className="w-8 h-8 bg-slate-200 rounded-xl" />
            </div>
            <div className="w-24 h-7 bg-slate-200 rounded" />
            <div className="w-32 h-2.5 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeCls}`}
                >
                  {card.badge}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight mt-2 flex items-baseline">
                <AnimatedNumber value={card.value} duration={1.1} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="truncate" title={card.sub}>
                {card.sub}
              </span>
              <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KycStats;
