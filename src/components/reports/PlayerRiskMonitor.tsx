import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { PlayerRiskData } from '../../types/playerReport';

interface PlayerRiskMonitorProps {
  riskData: PlayerRiskData;
  isLoading?: boolean;
}

export const PlayerRiskMonitor: React.FC<PlayerRiskMonitorProps> = ({
  riskData,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse h-80">
        <div className="h-4 w-40 bg-slate-100 rounded-md" />
        <div className="h-56 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Header with Direct Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Player Risk Monitor</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-accounting alerts, velocity anomalies, and fraud detection.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/players/blocked')}
          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>View Risk Players</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Flagged Accounts</span>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
            <AnimatedNumber value={riskData?.flaggedCount ?? 0} />
          </div>
        </div>
        <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">High Risk Tier</span>
          <div className="text-lg font-black text-rose-700 mt-0.5 font-mono">
            <AnimatedNumber value={riskData?.highRiskCount ?? 0} />
          </div>
        </div>
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Medium Risk</span>
          <div className="text-lg font-black text-amber-700 mt-0.5 font-mono">
            <AnimatedNumber value={riskData?.mediumRiskCount ?? 0} />
          </div>
        </div>
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Low / Monitored</span>
          <div className="text-lg font-black text-blue-700 mt-0.5 font-mono">
            <AnimatedNumber value={riskData?.lowRiskCount ?? 0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-6 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">7-Day Risk & Review Trend</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />Flags</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-800" />Suspensions</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Reviews</span>
            </div>
          </div>

          <div className="h-36 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData?.trend || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-2 text-xs shadow-md space-y-1">
                        <div className="font-bold text-slate-800">{label}</div>
                        {payload.map((e: any) => (
                          <div key={e.dataKey} className="flex items-center justify-between gap-3 text-[11px]">
                            <span style={{ color: e.color }}>{e.name}:</span>
                            <span className="font-mono font-bold text-slate-900">{e.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="flags" name="Risk Flags" fill="#F43F5E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="reviews" name="Reviews" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="suspensions" name="Suspensions" fill="#1E293B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Risk Signals (Clickable) */}
        <div className="lg:col-span-6 space-y-2 min-w-0">
          <span className="text-xs font-semibold text-slate-700 block">Top Risk Signals (Audit Queue)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(riskData?.signals || []).map((sig) => (
              <button
                key={sig.label}
                type="button"
                onClick={() => navigate(`/admin/players/blocked?reason=${sig.riskFilter}`)}
                className="p-2.5 bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 rounded-xl text-left transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  <span className="truncate">{sig.label}</span>
                  <span className="font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 text-[10.5px]">
                    {sig.cases} cases
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 group-hover:text-slate-600">
                  {sig.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRiskMonitor;
