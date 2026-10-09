import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { PlayerSegmentSummary } from '../../types/playerReport';

interface PlayerSegmentsTableProps {
  segments: PlayerSegmentSummary[];
  isLoading?: boolean;
}

export const PlayerSegmentsTable: React.FC<PlayerSegmentsTableProps> = ({
  segments,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse h-80">
        <div className="h-4 w-32 bg-slate-100 rounded-md" />
        <div className="h-56 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Player Segments</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort segmentation performance. Click any segment to view filtered accounts.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          6 Active Tiers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-2.5">Segment</th>
              <th className="pb-2.5">Players</th>
              <th className="pb-2.5">Avg Session</th>
              <th className="pb-2.5">Avg Spend</th>
              <th className="pb-2.5">Retention</th>
              <th className="pb-2.5 text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {(segments || []).map((s) => (
              <tr
                key={s.segmentKey}
                onClick={() => navigate(`/admin/players?segment=${s.segmentKey}`)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-2.5 font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] border ${s.badgeClass}`}>
                    {s.segment}
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                </td>
                <td className="py-2.5 font-mono text-slate-700">
                  <AnimatedNumber value={s.players} />
                </td>
                <td className="py-2.5 text-slate-600">{s.avgSession}</td>
                <td className="py-2.5 font-mono text-slate-900 font-semibold">
                  <AnimatedNumber value={s.avgSpend} format="currency" />
                </td>
                <td className="py-2.5 font-mono text-blue-600 font-bold">
                  {s.retention}%
                </td>
                <td className={`py-2.5 text-right font-mono font-bold ${
                  s.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {s.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerSegmentsTable;
