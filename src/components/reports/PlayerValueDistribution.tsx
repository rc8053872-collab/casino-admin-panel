import React from 'react';
import { IndianRupee } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { ValueDistributionItem } from '../../types/playerReport';

interface PlayerValueDistributionProps {
  distribution: ValueDistributionItem[];
  isLoading?: boolean;
}

export const PlayerValueDistribution: React.FC<PlayerValueDistributionProps> = ({
  distribution,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse h-80">
        <div className="h-4 w-40 bg-slate-100 rounded-md" />
        <div className="h-56 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Player Value Distribution
          </h3>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            LTV Tiers
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Cumulative deposit & buy-in wealth breakdown across active player base.
        </p>
      </div>

      <div className="space-y-3">
        {(distribution || []).map((item, idx) => (
          <div key={item.tier} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 font-mono flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-slate-400" />
                <span>{item.tier}</span>
              </span>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="font-mono text-slate-600">
                  <AnimatedNumber value={item.count} /> players ({item.percentage}%)
                </span>
                <span className="text-slate-400 font-medium">
                  {item.avgActivity}
                </span>
              </div>
            </div>

            {/* Horizontal Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  idx === 0
                    ? 'bg-slate-400'
                    : idx === 1
                    ? 'bg-blue-500'
                    : idx === 2
                    ? 'bg-emerald-500'
                    : idx === 3
                    ? 'bg-purple-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Top 15% generates 72.4% of total rake escrow</span>
        <span className="font-semibold text-purple-700">Pareto Skew</span>
      </div>
    </div>
  );
};

export default PlayerValueDistribution;
