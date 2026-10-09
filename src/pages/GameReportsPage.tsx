import React, { useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { animateTableRows } from '../animations/gsapUtils';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

function GameReportStat({
  label,
  value,
  format = 'number',
  prefix,
  suffix,
  decimals,
  sub,
  isGreen = false,
}: {
  label: string;
  value: string | number;
  format?: 'number' | 'currency' | 'compactCurrency' | 'percent';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  sub: React.ReactNode;
  isGreen?: boolean;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono">
        <AnimatedNumber
          value={value}
          format={format}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </div>
      <div className={`text-xs mt-1 ${isGreen ? 'text-emerald-600 font-semibold' : 'text-slate-500 font-medium'}`}>
        {sub}
      </div>
    </div>
  );
}

export const GameReportsPage: React.FC = () => {
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const reducedMotion = useReducedMotion();
  const toast = useToast();

  useEffect(() => {
    const tween = animateTableRows(tbodyRef.current, reducedMotion);
    return () => {
      tween?.kill();
    };
  }, [reducedMotion]);

  return (
    <div className="space-y-4.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Game Arena & Liquidity Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnover volume per arena, average session completion times, and player distribution.
          </p>
        </div>

        <button
          onClick={() => toast.success('Report downloaded', 'Arena analytics export ready.')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          Download Arena Analytics
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <GameReportStat
          label="Total Matches Concluded"
          value={4812}
          sub={
            <span>
              <AnimatedNumber value={8.4} prefix="+" suffix="%" decimals={1} /> this week
            </span>
          }
          isGreen
        />
        <GameReportStat
          label="Total Handle / Pot Volume"
          value={4820000}
          format="compactCurrency"
          sub="Across all arenas"
        />
        <GameReportStat
          label="Average Match Duration"
          value={18.4}
          decimals={1}
          suffix=" mins"
          sub="Fastest: Blitz (6m)"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Arena Breakdown Performance</h3>
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100">
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Arena Name
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Matches Played
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Total Pot Handled
              </th>
              <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5">
                Platform Rake (₹)
              </th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-slate-100">
            {[
              { name: 'Game Arena 01 (High Roller)', matches: 1420, pot: 2240000, rake: 78400 },
              { name: 'Game Arena 02 (1v1 Duel)',   matches: 1840, pot: 1280000, rake: 38400 },
              { name: 'Game Arena 03 (Battle Pro)',  matches: 890,  pot: 850000,  rake: 29750 },
              { name: 'Game Arena 04 (Blitz 4P)',    matches: 480,  pot: 320000,  rake: 12800 },
              { name: 'Game Arena 05 (Weekend Cup)', matches: 182,  pot: 130000,  rake: 4550 },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                <td className="px-4 py-3 font-semibold text-slate-700 font-mono">
                  <AnimatedNumber value={row.matches} />
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                  <AnimatedNumber value={row.pot} format="currency" />
                </td>
                <td className="px-4 py-3 font-bold text-emerald-600 font-mono">
                  <AnimatedNumber value={row.rake} format="currency" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameReportsPage;
